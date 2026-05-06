"use client";

import { Mic, MicOff, Sparkles, Trash2, Video, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SarahAvatar } from "@/components/simulator/Avatar";
import { PromoEmailForm } from "@/components/PromoEmailForm";
import {
  forgetElevenKey,
  hasElevenKey,
  loadElevenKey,
  saveElevenKey
} from "@/lib/simulator/elevenlabs";
import {
  forgetDidKey,
  forgetDidPortrait,
  generateTalkVideo,
  hasDid,
  loadDidKey,
  loadDidPortrait,
  loadDidPortraitOverride,
  saveDidKey,
  saveDidPortrait
} from "@/lib/simulator/d-id";
import {
  callLlmChat,
  callLlmJson,
  forgetKeyFor,
  hasKeyFor,
  LLM_KEY_HELP,
  LLM_KEY_PLACEHOLDER,
  LLM_PROVIDER_LABELS,
  loadKeyFor,
  saveKeyFor,
  type ChatMessage,
  type LlmProvider
} from "@/lib/simulator/llm";
import { SARAH, FEEDBACK_SYSTEM_PROMPT, buildInterviewSystemPrompt } from "@/lib/simulator/persona";
import { loadSimPrefs, saveSimPrefs } from "@/lib/simulator/sim-prefs";
import {
  createRecognition,
  isLifelikeVoiceAvailable,
  isSpeechSupported,
  speak,
  stopSpeaking
} from "@/lib/simulator/speech";
import type { Calibration, Evaluation, Question, ScaffoldingMode, ScoreBreakdown } from "@/lib/types";

type Phase =
  | "options"
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
const SILENCE_HANDOVER_MS = 2500;

type Props = {
  question: Question;
  calibration: Calibration;
  mode: ScaffoldingMode;
  onClose: () => void;
  onComplete: (evaluation: Evaluation) => void;
};

export function Simulator({ question, calibration, mode, onClose, onComplete }: Props) {
  const initialPrefs = loadSimPrefs();
  const initialPhase: Phase = initialPrefs.optionsCompleted ? "preflight" : "options";

  const [phase, setPhase] = useState<Phase>(initialPhase);
  const [provider, setProvider] = useState<LlmProvider>(initialPrefs.provider);
  const [wantsLifelikeVoice, setWantsLifelikeVoice] = useState(initialPrefs.wantVoice);
  const [wantsVideo, setWantsVideo] = useState(initialPrefs.wantVideo);
  const [keyInput, setKeyInput] = useState(loadKeyFor(initialPrefs.provider) ?? "");
  const [keyAccepted, setKeyAccepted] = useState(hasKeyFor(initialPrefs.provider));
  const [elevenKeyInput, setElevenKeyInput] = useState(loadElevenKey() ?? "");
  const [elevenAccepted, setElevenAccepted] = useState(hasElevenKey());
  const [didKeyInput, setDidKeyInput] = useState(loadDidKey() ?? "");
  const [didPortraitInput, setDidPortraitInput] = useState(loadDidPortraitOverride() ?? "");
  const [didAccepted, setDidAccepted] = useState(hasDid());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [didNotice, setDidNotice] = useState<string | null>(null);
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
  const phaseRef = useRef<Phase>(initialPhase);
  const currentUserTurnRef = useRef<string>("");
  const silenceTimerRef = useRef<number | null>(null);
  const handingOverRef = useRef<boolean>(false);
  const videoEndedResolverRef = useRef<(() => void) | null>(null);
  const videoErrorResolverRef = useRef<((errMsg: string) => void) | null>(null);

  function handleVideoEnded() {
    setVideoUrl(null);
    videoErrorResolverRef.current = null;
    const resolve = videoEndedResolverRef.current;
    videoEndedResolverRef.current = null;
    resolve?.();
  }

  function handleVideoError(errMsg: string) {
    setVideoUrl(null);
    const errResolve = videoErrorResolverRef.current;
    videoErrorResolverRef.current = null;
    videoEndedResolverRef.current = null;
    errResolve?.(errMsg);
  }
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    currentUserTurnRef.current = currentUserTurn;
  }, [currentUserTurn]);

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
      setErrorMsg(`Add a ${LLM_PROVIDER_LABELS[provider]} API key first.`);
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
    const apiKey = loadKeyFor(provider);
    if (!apiKey) {
      setErrorMsg(`${LLM_PROVIDER_LABELS[provider]} key missing.`);
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
      const greeting = await callLlmChat<TurnResponse>({
        provider,
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
      await playResponse(greeting.say);
      setPhase("listening");
      setAvatarState("listening");
      startListening();
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error instanceof Error ? `${LLM_PROVIDER_LABELS[provider]} call failed: ${error.message}` : `${LLM_PROVIDER_LABELS[provider]} call failed.`
      );
      setPhase("error");
    }
  }

  function clearSilenceTimer() {
    if (silenceTimerRef.current !== null) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }

  function scheduleAutoHandover() {
    clearSilenceTimer();
    silenceTimerRef.current = window.setTimeout(() => {
      silenceTimerRef.current = null;
      if (
        phaseRef.current === "listening" &&
        !handingOverRef.current &&
        currentUserTurnRef.current.trim().length >= MIN_USER_CHARS_PER_TURN
      ) {
        handUserTurnToSarah();
      }
    }, SILENCE_HANDOVER_MS);
  }

  function startListening() {
    setCurrentUserTurn("");
    setInterim("");
    handingOverRef.current = false;
    clearSilenceTimer();
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
      // Reset the silence countdown on every new transcript activity
      scheduleAutoHandover();
    };
    recognition.onspeechstart = () => {
      // User resumed talking — cancel pending auto-handover
      clearSilenceTimer();
    };
    recognition.onspeechend = () => {
      // Browser thinks the user paused — start the countdown
      scheduleAutoHandover();
    };
    recognition.onerror = (event: any) => {
      if (event.error && event.error !== "no-speech") {
        console.warn("Mic error:", event.error);
      }
    };
    recognition.onend = () => {
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
    clearSilenceTimer();
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
  }

  // User clicks "Sarah's turn" OR auto-triggered after silence — pass everything to Claude
  async function handUserTurnToSarah() {
    const userText = currentUserTurnRef.current.trim();
    if (userText.length < MIN_USER_CHARS_PER_TURN) return;
    if (handingOverRef.current) return;
    handingOverRef.current = true;
    stopListening();
    const turnText = userText;
    const nextHistory: ChatMessage[] = [...history, { role: "user", content: turnText }];
    setHistory(nextHistory);
    setCurrentUserTurn("");
    setInterim("");
    setPhase("thinking");
    setAvatarState("thinking");

    const apiKey = loadKeyFor(provider);
    if (!apiKey) {
      setErrorMsg(`${LLM_PROVIDER_LABELS[provider]} key missing.`);
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
      const turn = await callLlmChat<TurnResponse>({
        provider,
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
      await playResponse(turn.say);
      if (isWrapup) {
        setPhase("scoring");
        setAvatarState("thinking");
        runFeedback(updatedHistory);
      } else {
        setPhase("listening");
        setAvatarState("listening");
        startListening();
      }
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error instanceof Error ? `${LLM_PROVIDER_LABELS[provider]} call failed: ${error.message}` : `${LLM_PROVIDER_LABELS[provider]} call failed.`
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

    const apiKey = loadKeyFor(provider);
    if (!apiKey) {
      setErrorMsg(`${LLM_PROVIDER_LABELS[provider]} key missing.`);
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
      const wrap = await callLlmChat<TurnResponse>({
        provider,
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
      await playResponse(wrap.say);
      setPhase("scoring");
      setAvatarState("thinking");
      runFeedback(updatedHistory);
    } catch (error) {
      console.error(error);
      // Still try to score even if wrap call failed
      setPhase("scoring");
      setAvatarState("thinking");
      runFeedback(working);
    }
  }

  async function runFeedback(finalHistory: ChatMessage[]) {
    const apiKey = loadKeyFor(provider);
    if (!apiKey) {
      setErrorMsg(`${LLM_PROVIDER_LABELS[provider]} key missing.`);
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
      const result = await callLlmJson<FeedbackResponse>({
        provider,
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
    const expected = LLM_KEY_PLACEHOLDER[provider];
    const looksValid =
      provider === "anthropic" ? trimmed.startsWith("sk-ant-") : trimmed.startsWith("sk-");
    if (!looksValid || trimmed.length < 20) {
      setErrorMsg(`That doesn't look like a ${LLM_PROVIDER_LABELS[provider]} key (${expected}).`);
      return;
    }
    saveKeyFor(provider, trimmed);
    setKeyAccepted(true);
    setErrorMsg(null);
  }

  function handleForgetKey() {
    forgetKeyFor(provider);
    setKeyAccepted(false);
    setKeyInput("");
  }

  function handleSaveElevenKey() {
    const trimmed = elevenKeyInput.trim();
    if (trimmed.length < 20) {
      setErrorMsg("That doesn't look like an ElevenLabs key.");
      return;
    }
    saveElevenKey(trimmed);
    setElevenAccepted(true);
    setErrorMsg(null);
  }

  function handleForgetElevenKey() {
    forgetElevenKey();
    setElevenAccepted(false);
    setElevenKeyInput("");
  }

  function handleSaveDidKey() {
    const trimmedKey = didKeyInput.trim();
    const trimmedPortrait = didPortraitInput.trim();
    if (trimmedKey.length < 10) {
      setErrorMsg("That doesn't look like a D-ID key.");
      return;
    }
    if (trimmedPortrait && !trimmedPortrait.startsWith("https://")) {
      setErrorMsg("If you provide a portrait URL it must start with https://");
      return;
    }
    saveDidKey(trimmedKey);
    if (trimmedPortrait) {
      saveDidPortrait(trimmedPortrait);
    } else {
      // Clear any previous override so the bundled Sarah portrait is used
      forgetDidPortrait();
    }
    setDidAccepted(true);
    setErrorMsg(null);
  }

  function handleForgetDidKey() {
    forgetDidKey();
    forgetDidPortrait();
    setDidAccepted(false);
    setDidKeyInput("");
    setDidPortraitInput("");
  }

  /**
   * Speak `text` to the candidate, awaiting completion.
   * - With D-ID key: generate a lipsync video, play it, resolve onended.
   * - Otherwise: speak() (ElevenLabs if keyed, else browser TTS), resolve onEnd.
   */
  function playResponse(text: string): Promise<void> {
    if (hasDid()) {
      return playResponseAsVideo(text);
    }
    return new Promise<void>((resolve) => {
      void speak(text, { onEnd: () => resolve() });
    });
  }

  async function playResponseAsVideo(text: string): Promise<void> {
    const apiKey = loadDidKey();
    const portraitUrl = loadDidPortrait();
    if (!apiKey || !portraitUrl) {
      setDidNotice("D-ID key or portrait missing — using voice-only fallback.");
      return new Promise<void>((resolve) => {
        void speak(text, { onEnd: () => resolve() });
      });
    }
    try {
      setDidNotice(null);
      const url = await generateTalkVideo({ apiKey, portraitUrl, text });
      return await new Promise<void>((resolve, reject) => {
        videoEndedResolverRef.current = resolve;
        videoErrorResolverRef.current = (errMsg: string) => {
          setDidNotice(`Video playback failed (${errMsg}). Using voice-only for this turn.`);
          // Speak the line via TTS so the conversation continues
          void speak(text, { onEnd: () => resolve() });
        };
        setVideoUrl(url);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn("D-ID failed, falling back to TTS:", error);
      setDidNotice(`D-ID error: ${message.slice(0, 200)}`);
      return new Promise<void>((resolve) => {
        void speak(text, { onEnd: () => resolve() });
      });
    }
  }

  function handleClose() {
    stopSpeaking();
    stopListening();
    onClose();
  }

  function handleProviderChange(next: LlmProvider) {
    setProvider(next);
    setKeyInput(loadKeyFor(next) ?? "");
    setKeyAccepted(hasKeyFor(next));
    setErrorMsg(null);
  }

  function handleOptionsContinue() {
    saveSimPrefs({
      provider,
      wantVoice: wantsLifelikeVoice,
      wantVideo: wantsVideo,
      optionsCompleted: true
    });
    setPhase("preflight");
  }

  function handleBackToOptions() {
    setPhase("options");
    setErrorMsg(null);
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
            {didAccepted ? (
              <span className="sim-voice-pill">
                <Sparkles size={12} /> Real video
              </span>
            ) : isLifelikeVoiceAvailable() ? (
              <span className="sim-voice-pill">
                <Sparkles size={12} /> Lifelike voice
              </span>
            ) : null}
            {phase !== "options" && phase !== "preflight" && phase !== "done" && phase !== "error" ? (
              <span className="sim-turn-counter mono">
                Turn {followupCount + 1}/{MAX_FOLLOWUP_TURNS + 1}
              </span>
            ) : null}
          </div>
          <div className="sim-bar-right">
            {phase !== "options" && phase !== "preflight" && phase !== "done" && phase !== "error" ? (
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

        {phase === "options" ? (
          <OptionsStep
            provider={provider}
            onProviderChange={handleProviderChange}
            wantsLifelikeVoice={wantsLifelikeVoice}
            setWantsLifelikeVoice={setWantsLifelikeVoice}
            wantsVideo={wantsVideo}
            setWantsVideo={setWantsVideo}
            onContinue={handleOptionsContinue}
            speechSupported={speechSupported.current}
          />
        ) : null}

        {phase === "preflight" ? (
          <PreflightStep
            provider={provider}
            wantsLifelikeVoice={wantsLifelikeVoice}
            wantsVideo={wantsVideo}
            keyInput={keyInput}
            setKeyInput={setKeyInput}
            keyAccepted={keyAccepted}
            elevenKeyInput={elevenKeyInput}
            setElevenKeyInput={setElevenKeyInput}
            elevenAccepted={elevenAccepted}
            didKeyInput={didKeyInput}
            setDidKeyInput={setDidKeyInput}
            didPortraitInput={didPortraitInput}
            setDidPortraitInput={setDidPortraitInput}
            didAccepted={didAccepted}
            errorMsg={errorMsg}
            onSaveKey={handleSaveKey}
            onForgetKey={handleForgetKey}
            onSaveElevenKey={handleSaveElevenKey}
            onForgetElevenKey={handleForgetElevenKey}
            onSaveDidKey={handleSaveDidKey}
            onForgetDidKey={handleForgetDidKey}
            onStart={startInterview}
            onBackToOptions={handleBackToOptions}
            speechSupported={speechSupported.current}
            question={question}
          />
        ) : null}

        {phase !== "preflight" && phase !== "error" && phase !== "done" ? (
          <>
            {didNotice ? (
              <div className="sim-notice-bar" role="status">
                <span>{didNotice}</span>
              </div>
            ) : null}
            <RunningStep
              avatarState={avatarState}
              history={history}
              currentUserTurn={currentUserTurn}
              interim={interim}
              phase={phase}
              onSarahTurn={handUserTurnToSarah}
              canHandTurn={currentUserTurn.trim().length >= MIN_USER_CHARS_PER_TURN}
              videoUrl={videoUrl}
              onVideoEnded={handleVideoEnded}
              onVideoError={handleVideoError}
              portraitUrl={didAccepted ? loadDidPortrait() : null}
            />
          </>
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
  provider: LlmProvider;
  wantsLifelikeVoice: boolean;
  wantsVideo: boolean;
  keyInput: string;
  setKeyInput: (next: string) => void;
  keyAccepted: boolean;
  elevenKeyInput: string;
  setElevenKeyInput: (next: string) => void;
  elevenAccepted: boolean;
  didKeyInput: string;
  setDidKeyInput: (next: string) => void;
  didPortraitInput: string;
  setDidPortraitInput: (next: string) => void;
  didAccepted: boolean;
  errorMsg: string | null;
  onSaveKey: () => void;
  onForgetKey: () => void;
  onSaveElevenKey: () => void;
  onForgetElevenKey: () => void;
  onSaveDidKey: () => void;
  onForgetDidKey: () => void;
  onStart: () => void;
  onBackToOptions: () => void;
  speechSupported: boolean;
  question: Question;
}) {
  const lifelike = props.elevenAccepted && props.wantsLifelikeVoice;
  const realVideo = props.didAccepted && props.wantsVideo;
  const llmLabel = LLM_PROVIDER_LABELS[props.provider];

  return (
    <div className="sim-step sim-preflight">
      <div className="sim-preflight-head">
        <span className="eyebrow">Voice mock · BYO keys</span>
        <button type="button" className="link-btn" onClick={props.onBackToOptions}>
          ← Change settings
        </button>
      </div>
      <h2>Run a real conversation with {SARAH.name}</h2>
      <p>
        {SARAH.name} reads the prompt, listens to your answer, asks <strong>up to {MAX_FOLLOWUP_TURNS} follow-ups
        based on what you actually said</strong>, then scores you on the standard PrepOS rubric. Pause for ~2.5s when
        you&apos;re done speaking and she&apos;ll respond automatically. Your keys, audio, and transcript stay in your
        browser.
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
        <label htmlFor="sim-key-input">{llmLabel} API key (required)</label>
        <input
          id="sim-key-input"
          type="password"
          placeholder={LLM_KEY_PLACEHOLDER[props.provider]}
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
            {props.keyAccepted ? "Key saved locally" : LLM_KEY_HELP[props.provider]}
          </span>
        </div>
      </div>

      {props.wantsLifelikeVoice ? (
      <div className="sim-key-row">
        <label htmlFor="sim-eleven-input">
          ElevenLabs API key <em>(for lifelike voice)</em>
        </label>
        <input
          id="sim-eleven-input"
          type="password"
          placeholder="sk_…"
          value={props.elevenKeyInput}
          onChange={(event) => props.setElevenKeyInput(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="sim-key-actions">
          {props.elevenAccepted ? (
            <button type="button" className="btn" onClick={props.onForgetElevenKey}>
              <Trash2 size={14} /> Forget key
            </button>
          ) : (
            <button type="button" className="btn" onClick={props.onSaveElevenKey}>
              Save key
            </button>
          )}
          <span className={`sim-key-status ${lifelike ? "lifelike" : ""}`}>
            {lifelike ? (
              <>
                <Sparkles size={12} /> Lifelike voice on (~$0.30 per interview)
              </>
            ) : (
              "Without it, Sarah uses your browser's robotic TTS for free."
            )}
          </span>
        </div>
      </div>
      ) : null}

      {props.wantsVideo ? (
      <div className="sim-key-row">
        <label htmlFor="sim-did-input">
          D-ID API key <em>(for real-video Sarah)</em>
        </label>
        <input
          id="sim-did-input"
          type="password"
          placeholder="D-ID API key"
          value={props.didKeyInput}
          onChange={(event) => props.setDidKeyInput(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <input
          id="sim-did-portrait"
          type="url"
          placeholder="Custom portrait URL (optional — leave blank to use the bundled Sarah)"
          value={props.didPortraitInput}
          onChange={(event) => props.setDidPortraitInput(event.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        <div className="sim-key-actions">
          {props.didAccepted ? (
            <button type="button" className="btn" onClick={props.onForgetDidKey}>
              <Trash2 size={14} /> Forget D-ID
            </button>
          ) : (
            <button type="button" className="btn" onClick={props.onSaveDidKey}>
              Save D-ID
            </button>
          )}
          <span className={`sim-key-status ${realVideo ? "lifelike" : ""}`}>
            {realVideo ? (
              <>
                <Sparkles size={12} /> Real-video Sarah enabled
              </>
            ) : (
              <>
                Without it, you&apos;ll see Sarah as an illustrated portrait. Get a key + portrait URL at studio.d-id.com.
              </>
            )}
          </span>
        </div>
      </div>
      ) : null}

      <div className="sim-pro-card">
        <div className="sim-pro-card-head">
          <Sparkles size={14} />
          <strong>Pro Pack — coming soon</strong>
        </div>
        <p>
          Skip BYO keys. PrepOS handles the {llmLabel} calls, the lifelike voice, and the real-video persona on
          your behalf for one monthly price. Drop your email to be first in line:
        </p>
        <PromoEmailForm source="prepos-simulator" ctaLabel="Notify me" />
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
          {realVideo
            ? `~$0.10–0.20 ${llmLabel} + ~$0.30 ElevenLabs + ~$3–8 D-ID per interview, billed to your accounts`
            : lifelike
              ? `~$0.10–0.20 ${llmLabel} + ~$0.30 ElevenLabs per interview, billed to your accounts`
              : `~$0.10–0.20 per interview against your ${llmLabel} account`}
        </span>
      </div>
    </div>
  );
}

function OptionsStep(props: {
  provider: LlmProvider;
  onProviderChange: (next: LlmProvider) => void;
  wantsLifelikeVoice: boolean;
  setWantsLifelikeVoice: (next: boolean) => void;
  wantsVideo: boolean;
  setWantsVideo: (next: boolean) => void;
  onContinue: () => void;
  speechSupported: boolean;
}) {
  return (
    <div className="sim-step sim-options">
      <span className="eyebrow">Voice mock · Set up</span>
      <h2>Pick your voice-mock setup</h2>
      <p>
        These choices control which API keys you&apos;ll need. You can change them any time from the
        next screen.
      </p>

      {!props.speechSupported ? (
        <div className="sim-warn">
          Voice mode needs the Web Speech API (Chrome or Edge). Safari and Firefox aren&apos;t supported yet.
        </div>
      ) : null}

      <fieldset className="sim-option-group">
        <legend>Which model should run the interviewer?</legend>
        {(["anthropic", "openai"] as LlmProvider[]).map((p) => (
          <label
            key={p}
            className={`sim-option-card ${props.provider === p ? "active" : ""}`}
          >
            <input
              type="radio"
              name="sim-llm"
              value={p}
              checked={props.provider === p}
              onChange={() => props.onProviderChange(p)}
            />
            <span className="sim-option-card-body">
              <strong>{LLM_PROVIDER_LABELS[p]}</strong>
              <span className="sim-option-card-hint">
                {p === "anthropic"
                  ? "Claude Sonnet 4.5. Strong reasoning, warm interviewer voice."
                  : "GPT-4o-mini. Fast, lower per-call cost, JSON-mode native."}
              </span>
            </span>
          </label>
        ))}
      </fieldset>

      <fieldset className="sim-option-group">
        <legend>Add-ons</legend>

        <label
          className={`sim-toggle-card ${props.wantsLifelikeVoice ? "active" : ""}`}
        >
          <input
            type="checkbox"
            checked={props.wantsLifelikeVoice}
            onChange={(e) => props.setWantsLifelikeVoice(e.target.checked)}
          />
          <span className="sim-toggle-card-icon" aria-hidden="true">
            <Volume2 size={18} />
          </span>
          <span className="sim-toggle-card-body">
            <strong>Lifelike real-person voice</strong>
            <span className="sim-toggle-card-hint">
              ElevenLabs voice instead of the browser&apos;s robotic TTS. ~$0.30 per interview.
            </span>
          </span>
        </label>

        <label
          className={`sim-toggle-card ${props.wantsVideo ? "active" : ""}`}
        >
          <input
            type="checkbox"
            checked={props.wantsVideo}
            onChange={(e) => props.setWantsVideo(e.target.checked)}
          />
          <span className="sim-toggle-card-icon" aria-hidden="true">
            <Video size={18} />
          </span>
          <span className="sim-toggle-card-body">
            <strong>Real-video Teams-style simulation</strong>
            <span className="sim-toggle-card-hint">
              D-ID renders Sarah as a lipsynced video. ~$3–8 per interview.
            </span>
          </span>
        </label>
      </fieldset>

      <div className="sim-cta-row">
        <button
          type="button"
          className="btn primary lg"
          onClick={props.onContinue}
          disabled={!props.speechSupported}
        >
          Continue → enter API keys
        </button>
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
  videoUrl: string | null;
  onVideoEnded: () => void;
  onVideoError: (errMsg: string) => void;
  portraitUrl: string | null;
}) {
  const showHandTurn = props.phase === "listening";
  return (
    <div className="sim-step sim-running">
      <SarahAvatar
        name={SARAH.name}
        state={props.avatarState}
        videoUrl={props.videoUrl}
        onVideoEnded={props.onVideoEnded}
        onVideoError={props.onVideoError}
        portraitUrl={props.portraitUrl}
      />

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
              ? "Pause for ~2.5s and Sarah responds automatically — or click to skip the wait"
              : "Speak at least a sentence; Sarah will pick up when you pause"}
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
