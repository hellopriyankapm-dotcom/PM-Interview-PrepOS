import { Sparkles } from "lucide-react";

type LogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

export function Logo({ size = 28, withWordmark = false, className }: LogoProps) {
  const inner = Math.round(size * 0.62);
  return (
    <span className={`logo ${className ?? ""}`.trim()}>
      <span
        className="logo-tile"
        style={{ width: size, height: size, borderRadius: Math.round(size * 0.22) }}
        aria-hidden="true"
      >
        <Sparkles size={inner} strokeWidth={2.2} />
      </span>
      {withWordmark ? <span className="logo-wordmark">PrepOS</span> : null}
    </span>
  );
}
