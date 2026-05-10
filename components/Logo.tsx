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
          d="M14 7 C 14 11, 15 14, 22 15 C 15 16, 14 19, 14 23 C 14 19, 13 16, 6 15 C 13 14, 14 11, 14 7 Z"
          className="logo-mark"
        />
        <path
          d="M24 17 C 24 19, 24.5 20, 27 20.5 C 24.5 21, 24 22, 24 24 C 24 22, 23.5 21, 21 20.5 C 23.5 20, 24 19, 24 17 Z"
          className="logo-mark"
        />
      </svg>
      {withWordmark ? <span className="logo-wordmark">PrepOS</span> : null}
    </span>
  );
}
