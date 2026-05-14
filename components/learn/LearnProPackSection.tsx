import { Sparkles } from "lucide-react";
import { PromoEmailForm } from "@/components/PromoEmailForm";

type Props = {
  /** Analytics tag — e.g. "prepos-learn-aipm-hub". */
  source: string;
};

export function LearnProPackSection({ source }: Props) {
  return (
    <section id="early-access" className="learn-promo" aria-label="Pro Pack early access">
      <span className="learn-promo-badge" aria-hidden="true">
        <Sparkles size={14} />
        Pro Pack early access
      </span>
      <h2>Want the full AI PM library?</h2>
      <p>
        These free decks are the starter set. Pro Pack unlocks the complete AI PM terminologies
        and judgment scenarios — plus the AI Coach, the question bank, and the simulator.
      </p>
      <PromoEmailForm source={source} ctaLabel="Join the Pro Pack waitlist" />
    </section>
  );
}
