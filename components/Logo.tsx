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
        <path
          d="M11 23 V9 H17.5 a4.5 4.5 0 0 1 0 9 H13"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="logo-mark"
        />
        <path
          d="M21.5 7.5 a8 8 0 0 1 3.2 6.5"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
          className="logo-mark"
        />
        <circle cx="25" cy="14.4" r="1.7" fill="white" className="logo-mark" />
      </svg>
      {withWordmark ? <span className="logo-wordmark">PrepOS</span> : null}
    </span>
  );
}
