type State = "idle" | "speaking" | "listening" | "thinking";

type Props = {
  name: string;
  state: State;
  size?: number;
  videoUrl?: string | null;
  onVideoEnded?: () => void;
  portraitUrl?: string | null;
};

export function SarahAvatar({ name, state, size = 220, videoUrl, onVideoEnded, portraitUrl }: Props) {
  const useVideo = !!videoUrl;
  return (
    <div className="sim-avatar" data-state={state} style={{ width: size, height: size }}>
      {useVideo ? (
        <video
          className="sim-avatar-video"
          src={videoUrl ?? undefined}
          autoPlay
          playsInline
          onEnded={onVideoEnded}
          aria-hidden="true"
        />
      ) : portraitUrl ? (
        <img
          className="sim-avatar-portrait"
          src={portraitUrl}
          alt={`${name} portrait`}
        />
      ) : (
        <svg viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <radialGradient id="sim-bg" cx="50%" cy="40%" r="65%">
              <stop offset="0%" stopColor="rgba(15,95,70,0.18)" />
              <stop offset="100%" stopColor="rgba(15,95,70,0)" />
            </radialGradient>
          </defs>

          <circle cx="110" cy="110" r="108" className="sim-avatar-frame" />
          <circle cx="110" cy="110" r="108" fill="url(#sim-bg)" />

          {/* Shoulders */}
          <path
            d="M30 220 C 50 165 80 150 110 150 C 140 150 170 165 190 220 Z"
            className="sim-avatar-shoulders"
          />
          <path
            d="M84 156 C 92 168 100 174 110 174 C 120 174 128 168 136 156 L136 145 L84 145 Z"
            className="sim-avatar-neck"
          />

          {/* Head */}
          <ellipse cx="110" cy="100" rx="46" ry="54" className="sim-avatar-face" />

          {/* Hair (back) */}
          <path
            d="M62 92 C 62 56 84 38 110 38 C 138 38 158 58 158 92 L160 122 C 156 110 152 100 150 95 L150 84 C 150 70 134 58 110 58 C 84 58 70 72 70 86 L70 96 C 68 100 64 110 60 122 Z"
            className="sim-avatar-hair-back"
          />

          {/* Hair fringe */}
          <path
            d="M70 84 C 78 64 96 56 110 56 C 130 56 144 64 150 80 C 142 76 130 74 118 78 C 108 82 98 86 90 86 C 82 86 74 86 70 84 Z"
            className="sim-avatar-hair-front"
          />

          {/* Eyes */}
          <g className="sim-avatar-eyes">
            <ellipse cx="92" cy="104" rx="3.6" ry="4.4" />
            <ellipse cx="128" cy="104" rx="3.6" ry="4.4" />
          </g>

          {/* Brows */}
          <path d="M84 92 q 8 -4 16 0" className="sim-avatar-brow" />
          <path d="M120 92 q 8 -4 16 0" className="sim-avatar-brow" />

          {/* Nose */}
          <path d="M108 110 q -2 8 0 12 q 2 1 4 0" className="sim-avatar-nose" />

          {/* Mouth — animates between closed and open via CSS */}
          <g className="sim-avatar-mouth">
            <ellipse cx="110" cy="130" rx="9" ry="2" className="sim-avatar-mouth-closed" />
            <ellipse cx="110" cy="130" rx="9" ry="6" className="sim-avatar-mouth-open" />
          </g>

          {/* Cheek warmth */}
          <circle cx="84" cy="120" r="5" className="sim-avatar-cheek" />
          <circle cx="136" cy="120" r="5" className="sim-avatar-cheek" />
        </svg>
      )}

      <div className="sim-avatar-status" aria-live="polite">
        <span className="sim-avatar-name">{name}</span>
        <span className="sim-avatar-state">
          {state === "speaking" && "Speaking…"}
          {state === "listening" && "Listening…"}
          {state === "thinking" && "Thinking…"}
          {state === "idle" && "Ready"}
        </span>
      </div>
    </div>
  );
}
