import type { Metadata } from "next";
import PrepOSApp from "@/components/PrepOSApp";

export const metadata: Metadata = {
  title: "Practice — Adaptive PM Interview Simulator",
  description:
    "PM interview practice simulator. Calibrate your target level and practice the highest-impact PM interview questions first, with open rubrics and an adaptive queue. Free, runs in your browser.",
  alternates: { canonical: "/app" },
  openGraph: {
    title: "Practice — Adaptive PM Interview Simulator",
    description:
      "Practice PM interview questions adaptively. Calibrated for APM, PM, Senior, Staff, AI PM, and PM-T."
  }
};

export default function AppPage() {
  return <PrepOSApp />;
}
