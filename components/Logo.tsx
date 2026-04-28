type LogoProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

export function Logo({ size = 28, withWordmark = false, className }: LogoProps) {
  return (
    <span className={`logo ${className ?? ""}`.trim()}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect x="0" y="0" width="32" height="32" rx="7" className="logo-bg" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          className="logo-mark"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontWeight="700"
          fontSize="16"
          letterSpacing="-0.5"
        >
          PD
        </text>
      </svg>
      {withWordmark ? <span className="logo-wordmark">PrepOS</span> : null}
    </span>
  );
}
