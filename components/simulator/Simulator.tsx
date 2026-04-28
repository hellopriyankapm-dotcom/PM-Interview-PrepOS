"use client";

import { Mic, MicOff, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SarahAvatar } from "@/components/simulator/Avatar";
import {
  callClaudeChat,
  callClaudeJson,
  forgetKey,
  hasKey,
  loadKey,
  saveKey,
  type ChatMessage
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

const MAX_FOLLOWUP_TURNS = 4;
const MIN_USER_CHARS_PER_TURN = 12;

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
  const [interim, setInterim] = useState("");
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Conversation state — full transcript of both sides
  const [history, setHistory] = useState<ChatMessage[]>([]);
  // The user's currently-being-recorded turn (live transcript that updates as they speak)
  const [currentUserTurn, setCurrentUserTurn] = useState("");
  const [followupCount, setFollowupCount] = useState(0);

  const recognitionRef = useRef<ReturnType<typeof createRecognition>>(null);
  const startedAtRef = useRef<number>(0);
  const speechSupported = useRef(isSpeechSupported());
  const phaseRef = useRef<Phase>("preflight");
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Timer
  useEffect(() => {
    if (phase !== "listening" && phase !== "intro" && phase !== "thinking") {
      return;
    }
    if (startedAtRef.current === 0) {
      startedAtRef.current = Date.now();
    }
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
    setHistory([]);
    setCurrentUserTurn("");
    setFollowupCount(0);
    startedAtRef.current = 0;
    setPhase("intro");
    runGreetingTurn();
  }

  async function runGreetingTurn() {
    setAvatarState("thinking");
    const apiKey = loadKey();
    if (!apiKey) {
      setErrorMsg("Anthropic key missing.");
      setPhase("error");
      return;
    }

    const systemPrompt = buildInterviewSystemPrompt({
      persona: SARAH,
      targetLevel: calibration.targetLevel,
      mode,
      questionTitle: question.title,
      questionPrompt: question.prompt
    });

    try {
      const greeting = await callClaudeChat<TurnResponse>({
        apiKey,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content:
              "Open the interview now: greet the candidate in one warm sentence and read the prompt verbatim. intent='greeting', ended=false."
          }
        ],
        maxTokens: 280
      });
      const next: ChatMessage = { role: "assistant", content: greeting.say };
      setHistory([next]);
      setAvatarState("speaking");
      speak(greeting.say, {
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
    setCurrentUserTurn("");
    setInterim("");
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
        setCurrentUserTurn((prev) => (prev + " " + finalChunk).trim());
        setInterim("");
      } else {
        setInterim(interimChunk);
      }
    };
    recognition.onerror = (event: any) => {
      if (event.error && event.error !== "no-speech") {
        // Surface only if not a benign pause
        console.warn("Mic error:", event.error);
      }
    };
    recognition.onend = () => {
      // Auto-restart if we're still in listening (browsers stop after long silence)
      if (phaseRef.current === "listening") {
        try {
          recognition.start();
        } catch {
          // already running
        }
      }
    };
    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch {
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
    recognitionRef.current = null;
  }

  // User clicks "Sarah's turn" — pass everything to Claude, get follow-up or wrapup
  async function handUserTurnToSarah() {
    if (currentUserTurn.trim().length < MIN_USER_CHARS_PER_TURN) {
      // Prompt them to keep going rather than blocking silently
      return;
    }
    stopListening();
    const turnText = currentUserTurn.trim();
    const nextHistory: ChatMessage[] = [...history, { role: "user", content: turnText }];
    setHistory(nextHistory);
    setCurrentUserTurn("");
    setInterim("");
    setPhase("thinking");
    setAvatarState("thinking");

    const apiKey = loadKey();
    if (!apiKey) {
      setErrorMsg("Anthropic key missing.");
      setPhase("error");
      return;
    }

    const systemPrompt = buildInterviewSystemPrompt({
      persona: SARAH,
      targetLevel: calibration.targetLevel,
      mode,
      questionTitle: question.title,
      questionPrompt: question.prompt
    });

    const turnsRemaining = Math.max(0, MAX_FOLLOWUP_TURNS - followupCount);
    const guidance =
      turnsRemaining <= 1
        ? "You have at most 1 follow-up left, then you must wrap up. Decide what's most useful."
        : `You have at most ${turnsRemaining} follow-ups left. Ask one focused follow-up that quotes or pushes on something specific they just said, OR wrap up if you have enough signal.`;

    try {
      const turn = await callClaudeChat<TurnResponse>({
        apiKey,
        system: systemPrompt,
        messages: [...nextHistory, { role: "user", content: `[INTERVIEWER NOTE]: ${guidance}` }],
        maxTokens: 280
      });

      const updatedHistory: ChatMessage[] = [...nextHistory, { role: "assistant", content: turn.say }];
      setHistory(updatedHistory);

      const isWrapup = turn.ended || turn.intent === "wrapup" || turnsRemaining <= 0;
      setFollowupCount((c) => c + (isWrapup ? 0 : 1));

      setAvatarState("speaking");
      setPhase(isWrapup ? "wrapup" : "intro"); // 'intro' phase reuses the speaking state
      speak(turn.say, {
        onEnd: () => {
          if (isWrapup) {
            setPhase("scoring");
            setAvatarState("thinking");
            runFeedback(updatedHistory);
          } else {
            setPhase("listening");
            setAvatarState("listening");
            startListening();
          }
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

  // User clicks "End interview" — skip remaining followups, go straight to wrapup + scoring
  async function endInterview() {
    stopListening();
    stopSpeaking();
    // If they were mid-turn, fold whatever was captured into history first
    let working = history;
    if (currentUserTurn.trim().length >= MIN_USER_CHARS_PER_TURN) {
      working = [...history, { role: "user", content: currentUserTurn.trim() }];
      setHistory(working);
    }
    setCurrentUserTurn("");
    setInterim("");
    setPhase("wrapup");
    setAvatarState("speaking");

    const apiKey = loadKey();
    if (!apiKey) {
      setErrorMsg("Anthropic key missing.");
      setPhase("error");
      return;
    }

    const systemPrompt = buildInterviewSystemPrompt({
      persona: SARAH,
      targetLevel: calibration.targetLevel,
      mode,
      questionTitle: question.title,
      questionPrompt: question.prompt
    });

    try {
      const wrap = await callClaudeChat<TurnResponse>({
        apiKey,
        system: systemPrompt,
        messages: [
          ...working,
          { role: "user", content: "[INTERVIEWER NOTE]: Wrap up now in one short, warm sentence. intent='wrapup', ended=true." }
        ],
        maxTokens: 200
      });
      const updatedHistory: ChatMessage[] = [...working, { role: "assistant", content: wrap.say }];
      setHistory(updatedHistory);
      speak(wrap.say, {
        onEnd: () => {
          setPhase("scoring");
          setAvatarState("thinking");
          runFeedback(updatedHistory);
        }
      });
    } catch (error) {
      console.error(error);
      // Still try to score even if wrap call failed
      setPhase("scoring");
      setAvatarState("thinking");
      runFeedback(working);
    }
  }

  async function runFeedback(finalHistory: ChatMessage[]) {
    const apiKey = loadKey();
    if (!apiKey) {
      setErrorMsg("Anthropic key missing.");
      setPhase("error");
      return;
    }

    const userTurns = finalHistory
      .filter((m) => m.role === "user")
      .map((m, i) => `Candidate turn ${i + 1}: ${m.content}`)
      .join("\n\n");
    const interviewerTurns = finalHistory
      .filter((m) => m.role === "assistant")
      .map((m, i) => `${SARAH.name} turn ${i + 1}: ${m.content}`)
      .join("\n\n");

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
          `Interviewer turns:`,
          interviewerTurns || "(none)",
          ``,
          `Candidate turns:`,
          userTurns || "(no audible answer captured)"
        ].join("\n"),
        maxTokens: 900
      });
      setFeedback(result);
      setPhase("done");
      setAvatarState("idle");
      stopSpeaking();
      onComplete({
        total: result.total,
        breakdown: result.breakdown,
        strengths: result.strengths,
        improvements: result.improvements,
        nextAction: result.nextAction,
        updatedConcepts: []
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
            {phase !== "preflight" && phase !== "done" && phase !== "error" ? (
              <span className="sim-turn-counter mono">
                Turn {followupCount + 1}/{MAX_FOLLOWUP_TURNS + 1}
              </span>
            ) : null}
          </div>
          <div className="sim-bar-right">
            {phase !== "preflight" && phase !== "done" && phase !== "error" ? (
              <span className="sim-timer mono">{timer()}</span>
            ) : null}
            {(phase === "listening" || phase === "thinking" || phase === "intro") ? (
              <button type="button" className="btn sim-end-btn" onClick={endInterview}>
                End interview
              </button>
            ) : null}
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
            history={history}
            currentUserTurn={currentUserTurn}
            interim={interim}
            phase={phase}
            onSarahTurn={handUserTurnToSarah}
            canHandTurn={currentUserTurn.trim().length >= MIN_USER_CHARS_PER_TURN}
          />
        ) : null}

        {phase === "done" && feedback ? (
          <DoneStep feedback={feedback} history={history} onClose={handleClose} />
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
      <h2>Run a real conversation with {SARAH.name}</h2>
      <p>
        {SARAH.name} reads the prompt, listens to your answer, asks <strong>up to {MAX_FOLLOWUP_TURNS} follow-ups
        based on what you actually said</strong>, then scores you on the standard PrepOS rubric. Your key, audio, and
        transcript stay in your browser.
      </p>

      {!props.speechSupported ? (
        <div className="sim-warn">
          Voice mode needs the Web Speech API. It works in Chrome and Edge today; Safari and Firefox can&apos;t run
          this mode yet.
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
          ~$0.10–0.20 per interview against your Anthropic account · voice via your browser (free)
        </span>
      </div>
    </div>
  );
}

type AvatarState_ = "idle" | "speaking" | "listening" | "thinking";

function RunningStep(props: {
  avatarState: AvatarState_;
  history: ChatMessage[];
  currentUserTurn: string;
  interim: string;
  phase: Phase;
  onSarahTurn: () => void;
  canHandTurn: boolean;
}) {
  const showHandTurn = props.phase === "listening";
  return (
    <div className="sim-step sim-running">
      <SarahAvatar name={SARAH.name} state={props.avatarState} />

      <div className="sim-conversation">
        <span className="eyebrow">Conversation</span>
        {props.history.length === 0 && !props.currentUserTurn && !props.interim ? (
          <p className="sim-transcript-empty">{props.phase === "intro" ? "Sarah is greeting you…" : "Speak when you're ready."}</p>
        ) : (
          <div className="sim-conversation-list">
            {props.history.map((msg, idx) => (
              <div className={`sim-msg sim-msg-${msg.role}`} key={idx}>
                <span className="sim-msg-label">{msg.role === "assistant" ? SARAH.name : "You"}</span>
                <p>{msg.content}</p>
              </div>
            ))}
            {(props.currentUserTurn || props.interim) && props.phase === "listening" ? (
              <div className="sim-msg sim-msg-user sim-msg-live">
                <span className="sim-msg-label">You · live</span>
                <p>
                  {props.currentUserTurn}
                  {props.interim ? <em> {props.interim}</em> : null}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </div>

      {showHandTurn ? (
        <div className="sim-listen-actions">
          <button
            type="button"
            className="btn primary lg"
            onClick={props.onSarahTurn}
            disabled={!props.canHandTurn}
            title={props.canHandTurn ? "Pass the turn to Sarah" : "Speak a bit more first"}
          >
            <MicOff size={16} /> Sarah&apos;s turn
          </button>
          <span className="sim-listen-hint">
            {props.canHandTurn
              ? "Click when you're ready for Sarah to respond"
              : "Speak at least a sentence, then hand back to Sarah"}
          </span>
        </div>
      ) : null}
    </div>
  );
}

function DoneStep({
  feedback,
  history,
  onClose
}: {
  feedback: FeedbackResponse;
  history: ChatMessage[];
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

      {history.length > 0 ? (
        <details className="sim-transcript-archive">
          <summary>Show full transcript</summary>
          <div className="sim-conversation-list">
            {history.map((msg, idx) => (
              <div className={`sim-msg sim-msg-${msg.role}`} key={idx}>
                <span className="sim-msg-label">{msg.role === "assistant" ? SARAH.name : "You"}</span>
                <p>{msg.content}</p>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      <button className="btn primary" type="button" onClick={onClose}>
        Back to drill room
      </button>
    </div>
  );
}
