import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "PrepOS — Adaptive PM Interview Prep";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px 90px",
          color: "white",
          background: "linear-gradient(135deg, #0a4a36 0%, #0f5f46 60%, #34d399 200%)",
          position: "relative",
          fontFamily: "sans-serif"
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 560,
            height: 560,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(52,211,153,0.45) 0%, rgba(52,211,153,0) 70%)",
            display: "flex"
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -160,
            left: -160,
            width: 480,
            height: 480,
            borderRadius: 9999,
            background:
              "radial-gradient(circle, rgba(56,189,248,0.25) 0%, rgba(56,189,248,0) 70%)",
            display: "flex"
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 36,
            fontWeight: 800,
            letterSpacing: "-0.02em"
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0a4a36"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              <path d="M20 3v4" />
              <path d="M22 5h-4" />
              <path d="M4 17v2" />
              <path d="M5 18H3" />
            </svg>
          </div>
          <span style={{ display: "flex" }}>PrepOS</span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 92,
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: "-0.03em",
            marginTop: 70,
            maxWidth: 980
          }}
        >
          Adaptive PM Interview Prep
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 36,
            fontWeight: 500,
            lineHeight: 1.35,
            color: "rgba(255,255,255,0.82)",
            marginTop: 28,
            maxWidth: 980
          }}
        >
          Practice the rep that moves your readiness — not just any question.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            fontSize: 26,
            fontWeight: 600,
            color: "rgba(255,255,255,0.65)"
          }}
        >
          <span style={{ display: "flex" }}>pmprepos.com</span>
          <span
            style={{
              display: "flex",
              padding: "10px 18px",
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.35)",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.02em"
            }}
          >
            APM · PM · Senior · Staff · AI PM · PM-T
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
