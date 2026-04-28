"use client";

import { Mic, MicOff, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SarahAvatar } from "@/components/simulator/Avatar";
import {
  callClaudeJson,
  forgetKey,
  hasKey,
  loadKey,
  saveKey
} from "@/lib/simulator/anthropic";
import { SARAH, FEEDBACK_SYSTEM_PROMPT, buildInterviewSystemPrompt } from "@/lib/simulator/persona";
import { createRecognition, isSpeechSupported, speak, stopSpeaking } from "@/lib/simulator/speech";
import type { Calibration, Evaluation, Question, ScaffoldingMode, ScoreBreakdown } from "@/lib/types";

type Phase =
  | "preflight"
  | "intro"
  | "listening"
  | "thinking"
  | "wrapup"
  | "scoring"
  | "done"
  | "error";

type AvatarState = "idle" | "speaking" | "listening" | "thinking";

type TurnResponse = {
  say: string;
  ended: boolean;
  intent: "greeting" | "followup" | "wrapup";
};

type FeedbackResponse = {
  breakdown: ScoreBreakdown;
  total: number;
  strengths: string[];
  improvements: string[];
  nextAction: string;
};

type Props = {
  question: Question;
  calibration: Calibration;
  mode: ScaffoldingMode;
  onClose: () => void;
  onComplete: (evaluation: Evaluation) => void;
};

export function Simulator({ question, calibration, mode, onClose, onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>("preflight");
  const [keyInput, setKeyInput] = useState(loadKey() ?? "");
  const [keyAccepted, setKeyAccepted] = useState(hasKey());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const recognitionRef = useRef<ReturnType<typeof createRecognition>>(null);
  const startedAtRef = useRef<number>(0);
  const speechSupported = useRef(isSpeechSupported());

  // Timer
  useEffect(() => {
    if (phase !== "listening") return;
    startedAtRef.current = Date.now();
    setElapsed(0);
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000)), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      try {
        recognitionRef.current?.abort();
      } catch {
        // ignore
      }
    };
  }, []);

  function startInterview() {
    if (!speechSupported.current) {
      setErrorMsg(
        "Voice mode needs the Web Speech API (Chrome or Edge). Try those, or stick with text mode in the Drill room."
      );
      setPhase("error");
      return;
    }
    if (!keyAccepted) {
      setErrorMsg("Add an Anthropic API key first.");
      return;
    }
    setPhase("intro");
    runIntroTurn();
  }

  async function runIntroTurn() {
    setAvatarState("thinking");
    setTranscript("");
    setInterim("");

    const apiKey = loadKey();
    if (!apiKey) {
      setErrorMsg("Anthropic key missing.");
      setPhase("error");
      return;
    }

    try {
      const response = await callClaudeJson<TurnResponse>({
        apiKey,
        system: buildInterviewSystemPrompt({
          persona: SARAH,
          targetLevel: calibration.targetLevel,
          mode
        }),
        user: [
          `Open the interview. Greet the candidate, briefly say who you are, and read this prompt verbatim.`,
          ``,
          `Question title: "${question.title}"`,
          `Prompt: "${question.prompt}"`,
          ``,
          `Set intent="greeting", ended=false. Keep your turn under 60 words.`
        ].join("\n"),
        maxTokens: 300
      });
      setAvatarState("speaking");
      speak(response.say, {
        onEnd: () => {
          setPhase("listening");
          setAvatarState("listening");
          startListening();
        }
      });
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error instanceof Error ? `Anthropic call failed: ${error.message}` : "Anthropic call failed."
      );
      setPhase("error");
    }
  }

  function startListening() {
    const recognition = createRecognition();
    if (!recognition) {
      setErrorMsg("Speech recognition not available in this browser.");
      setPhase("error");
      return;
    }
    recognition.onresult = (event: any) => {
      let finalChunk = "";
      let interimChunk = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalChunk += text;
        else interimChunk += text;
      }
      if (finalChunk) {
        setTranscript((prev) => (prev + " " + finalChunk).trim());
        setInterim("");
      } else {
        setInterim(interimChunk);
      }
    };
    recognition.onerror = (event: any) => {
      // Treat 'no-speech' as benign — the user just paused
      if (event.error && event.error !== "no-speech") {
        setErrorMsg(`Mic error: ${event.error}`);
      }
    };
    recognition.onend = () => {
      // If we end during listening (e.g. browser timeout), restart
      if (phase === "listening") {
        try {
          recognition.start();
        } catch {
          // already started
        }
      }
    };
    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      setErrorMsg("Could not start microphone. Check permissions.");
      setPhase("error");
    }
  }

  function stopListening() {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  }

  async function finishAnswer() {
    stopListening();
    setPhase("wrapup");
    setAvatarState("speaking");

    const apiKey = loadKey();
    if (!apiKey) {
      setErrorMsg("Anthropic key missing.");
      setPhase("error");
      return;
    }

    // Wrapup turn — short, no feedback yet
    try {
      const wrap = await callClaudeJson<TurnResponse>({
        apiKey,
        system: buildInterviewSystemPrompt({
          persona: SARAH,
          targetLevel: calibration.targetLevel,
          mode
        }),
        user: [
          `The candidate is finished. Wrap the interview in one short, warm sentence.`,
          `Set intent="wrapup", ended=true. Do not deliver feedback in this turn.`,
          ``,
          `Their answer transcript:`,
          transcript || "(no audible answer captured)"
        ].join("\n"),
        maxTokens: 200
      });
      speak(wrap.say, {
        onEnd: () => {
          setPhase("scoring");
          setAvatarState("thinking");
          runFeedback();
        }
      });
    } catch (error) {
      console.error(error);
      // Fall through to scoring even if wrap call fails
      setPhase("scoring");
      setAvatarState("thinking");
      runFeedback();
    }
  }

  async function runFeedback() {
    const apiKey = loadKey();
    if (!apiKey) {
      setErrorMsg("Anthropic key missing.");
      setPhase("error");
      return;
    }
    try {
      const result = await callClaudeJson<FeedbackResponse>({
        apiKey,
        system: FEEDBACK_SYSTEM_PROMPT,
        user: [
          `Target level: ${calibration.targetLevel.toUpperCase()}`,
          `Coaching mode during the interview: ${mode}`,
          `Question title: "${question.title}"`,
          `Question prompt: "${question.prompt}"`,
          ``,
          `Candidate answer transcript:`,
          transcript || "(no answer captured)"
        ].join("\n"),
        maxTokens: 900
      });
      setFeedback(result);
      setPhase("done");
      setAvatarState("idle");
      stopSpeaking();
      // Plug into existing mastery state via onComplete
      onComplete({
        total: result.total,
        breakdown: result.breakdown,
        strengths: result.strengths,
        improvements: result.improvements,
        nextAction: result.nextAction,
        updatedConcepts: [] // PrepOSApp re-runs mastery update from total via existing path
      });
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error instanceof Error ? `Scoring failed: ${error.message}` : "Scoring failed."
      );
      setPhase("error");
    }
  }

  function handleSaveKey() {
    const trimmed = keyInput.trim();
    if (!trimmed.startsWith("sk-ant-")) {
      setErrorMsg("That doesn't look like an Anthropic key (sk-ant-…).");
      return;
    }
    saveKey(trimmed);
    setKeyAccepted(true);
    setErrorMsg(null);
  }

  function handleForgetKey() {
    forgetKey();
    setKeyAccepted(false);
    setKeyInput("");
  }

  function handleClose() {
    stopSpeaking();
    stopListening();
    onClose();
  }

  function timer() {
    const m = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const s = String(elapsed % 60).padStart(2, "0");
    return `${m}:${s}`;
  }

  return (
    <div className="sim-overlay" role="dialog" aria-label="PrepOS interview simulator">
      <div className="sim-shell">
        <header className="sim-bar">
          <div className="sim-bar-left">
            <span className="sim-bar-pill">{SARAH.name} · {SARAH.styleTag}</span>
          </div>
          <div className="sim-bar-right">
            {phase === "listening" ? <span className="sim-timer mono">{timer()}</span> : null}
            <button type="button" className="icon-btn" onClick={handleClose} aria-label="Exit interview">
              <X size={16} />
            </button>
          </div>
        </header>

        {phase === "preflight" ? (
          <PreflightStep
            keyInput={keyInput}
            setKeyInput={setKeyInput}
            keyAccepted={keyAccepted}
            errorMsg={errorMsg}
            onSaveKey={handleSaveKey}
            onForgetKey={handleForgetKey}
            onStart={startInterview}
            speechSupported={speechSupported.current}
            question={question}
          />
        ) : null}

        {phase !== "preflight" && phase !== "error" && phase !== "done" ? (
          <RunningStep
            avatarState={avatarState}
            transcript={transcript}
            interim={interim}
            phase={phase}
            onFinish={finishAnswer}
          />
        ) : null}

        {phase === "done" && feedback ? (
          <DoneStep feedback={feedback} transcript={transcript} onClose={handleClose} />
        ) : null}

        {phase === "error" ? (
          <div className="sim-step sim-error">
            <h2>Something went wrong</h2>
            <p>{errorMsg ?? "Unknown error."}</p>
            <button className="btn primary" type="button" onClick={handleClose}>
              Close
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PreflightStep(props: {
  keyInput: string;
  setKeyInput: (next: string) => void;
  keyAccepted: boolean;
  errorMsg: string | null;
  onSaveKey: () => void;
  onForgetKey: () => void;
  onStart: () => void;
  speechSupported: boolean;
  question: Question;
}) {
  return (
    <div className="sim-step sim-preflight">
      <span className="eyebrow">Voice mock · BYO key</span>
      <h2>Run a full interview against {SARAH.name}</h2>
      <p>
        PrepOS uses your own Anthropic key. The key, your audio, and the transcript stay in your
        browser. Nothing is sent to PrepOS infrastructure.
      </p>

      {!props.speechSupported ? (
        <div className="sim-warn">
          Voice mode needs the Web Speech API. It works in Chrome and Edge today; Safari and Firefox
          can&apos;t run this mode yet.
        </div>
      ) : null}

      <div className="sim-prompt-preview">
        <strong>{props.question.title}</strong>
        <p>{props.question.prompt}</p>
      </div>

      <div className="sim-key-row">
        <label htmlFor="sim-key-input">Anthropic API key</label>
        <input
          id="sim-key-input"
          type="password"
          placeholder="sk-ant-…"
          value={props.keyInput}
          onChange={(event) => props.setKeyInput(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="sim-key-actions">
          {props.keyAccepted ? (
            <button type="button" className="btn" onClick={props.onForgetKey}>
              <Trash2 size={14} /> Forget key
            </button>
          ) : (
            <button type="button" className="btn" onClick={props.onSaveKey}>
              Save key
            </button>
          )}
          <span className="sim-key-status">
            {props.keyAccepted ? "Key saved locally" : "Stored in localStorage only"}
          </span>
        </div>
      </div>

      {props.errorMsg ? <div className="sim-warn">{props.errorMsg}</div> : null}

      <div className="sim-cta-row">
        <button
          type="button"
          className="btn primary lg"
          onClick={props.onStart}
          disabled={!props.keyAccepted || !props.speechSupported}
        >
          <Mic size={16} /> Begin interview
        </button>
        <span className="sim-cost-hint">
          ~$0.05 per interview against your Anthropic account · voice via your browser (free)
        </span>
      </div>
    </div>
  );
}

function RunningStep(props: {
  avatarState: AvatarState;
  transcript: string;
  interim: string;
  phase: Phase;
  onFinish: () => void;
}) {
  const showFinish = props.phase === "listening";
  return (
    <div className="sim-step sim-running">
      <SarahAvatar name={SARAH.name} state={props.avatarState} />

      <div className="sim-transcript">
        <span className="eyebrow">Live transcript</span>
        {props.transcript || props.interim ? (
          <p>
            {props.transcript}
            {props.interim ? <em> {props.interim}</em> : null}
          </p>
        ) : (
          <p className="sim-transcript-empty">
            {props.phase === "intro" ? "Sarah is greeting you…" : null}
            {props.phase === "listening" ? "Speak when you're ready." : null}
            {props.phase === "thinking" ? "One second…" : null}
            {props.phase === "wrapup" ? "Wrapping up." : null}
            {props.phase === "scoring" ? "Sarah is scoring your answer." : null}
          </p>
        )}
      </div>

      {showFinish ? (
        <button type="button" className="btn primary lg" onClick={props.onFinish}>
          <MicOff size={16} /> I&apos;m done
        </button>
      ) : null}
    </div>
  );
}

function DoneStep({
  feedback,
  transcript,
  onClose
}: {
  feedback: FeedbackResponse;
  transcript: string;
  onClose: () => void;
}) {
  const rows: Array<[string, number]> = [
    ["Structure", feedback.breakdown.structure],
    ["User insight", feedback.breakdown.userInsight],
    ["Metrics", feedback.breakdown.metrics],
    ["Trade-offs", feedback.breakdown.tradeoffs],
    ["Communication", feedback.breakdown.communication],
    ["Level depth", feedback.breakdown.targetLevelDepth]
  ];
  return (
    <div className="sim-step sim-done">
      <span className="eyebrow">Sarah&apos;s feedback</span>
      <h2>Score: {feedback.total.toFixed(1)}/5</h2>

      <div className="sim-scorecard">
        {rows.map(([label, value]) => (
          <div className="score-row" key={label}>
            <span>{label}</span>
            <div className="bar">
              <span style={{ width: `${(value / 5) * 100}%` }} />
            </div>
            <strong className="mono">{value.toFixed(1)}</strong>
          </div>
        ))}
      </div>

      <div className="sim-feedback-grid">
        <div>
          <h3>What worked</h3>
          <ul>
            {feedback.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Fastest improvement</h3>
          <ul>
            {feedback.improvements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="sim-next-action">{feedback.nextAction}</p>
        </div>
      </div>

      {transcript ? (
        <details className="sim-transcript-archive">
          <summary>Show full transcript</summary>
          <p>{transcript}</p>
        </details>
      ) : null}

      <button className="btn primary" type="button" onClick={onClose}>
        Back to drill room
      </button>
    </div>
  );
}
