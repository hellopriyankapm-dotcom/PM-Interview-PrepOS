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
        <rect x="1" y="1" width="30" height="30" rx="8" className="logo-bg" />
        <path
          d="M10 22V10h5.2c2.65 0 4.4 1.62 4.4 4.05 0 2.43-1.75 4.05-4.4 4.05H12.6V22H10Zm2.6-6.05h2.35c1.3 0 2.05-.75 2.05-2 0-1.25-.75-2-2.05-2H12.6v4Z"
          className="logo-fg"
        />
        <circle cx="22.5" cy="11" r="2.2" className="logo-accent" />
      </svg>
      {withWordmark ? <span className="logo-wordmark">PrepOS</span> : null}
    </span>
  );
}
