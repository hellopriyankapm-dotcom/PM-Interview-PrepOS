"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

type OpenAppButtonProps = {
  label?: string;
  className?: string;
  source: "hero" | "closing-cta";
};

export function OpenAppButton({
  label = "Start practicing",
  className = "btn-primary lg",
  source
}: OpenAppButtonProps) {
  return (
    <Link
      className={className}
      href="/app"
      onClick={() => trackEvent("Open App", { source })}
    >
      {label} <ArrowRight size={16} />
    </Link>
  );
}
