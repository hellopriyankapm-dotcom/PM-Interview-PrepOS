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
              width="56"
              height="56"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 23 V9 H17.5 a4.5 4.5 0 0 1 0 9 H13"
                stroke="#0a4a36"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M21.5 7.5 a8 8 0 0 1 3.2 6.5"
                stroke="#0a4a36"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                opacity="0.85"
              />
              <circle cx="25" cy="14.4" r="1.7" fill="#0a4a36" />
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
