# Question Bank Changelog

## 2026-04-28 — PR B: bank expansion to 159

Added 45 execution / analytics / experimentation prompts:
- North Star choice: 6
- Input metrics: 4
- Funnel diagnosis: 3
- A/B test design: 5
- Experiment readouts: 4
- Power / sample size: 2
- Causal inference: 2
- Cohort analysis: 3
- Metric trade-offs: 4
- Diagnose drops: 5
- Dashboards / monitoring / attribution / instrumentation / segmentation: 7

Distribution shifts: execution_metrics 25 → 69, D2 entry-level 8 → 17,
APM-tagged 11 → 20, execution.north_star_metrics 5 → 14.

## 2026-04-28 — PR A: bank expansion to 115

Added 45 product_sense prompts across archetypes:
- Greenfield design: 13
- Improve metric/journey: 8
- Diagnose churn / drop-off: 6
- Wedge segment / niche: 5
- Marketplace / two-sided: 4
- Accessibility / inclusion: 3
- AI-native variants: 4
- Monetization: 2

All sourceType=original, companyClaim=null, reviewer 'PrepOS seed'.
Also extended scripts/validate-content.mjs with duplicate-id detection,
prompt length bounds (60-800 chars), unknown-concept detection, and
warnings when any concept has fewer than 3 questions.

## 2026-04-28 — Bank expansion to 70

Added 64 new PrepOS-original prompts across all categories. Distribution:
- Product sense: 13
- Execution metrics + analytics: 13
- AI product judgment: 11
- Strategy: 9
- Behavioral / leadership: 11
- Technical collaboration: 7
- Estimation / prioritization: 6

All entries are `sourceType: original`, `companyClaim: null`, reviewer
`PrepOS seed`. No fabricated company claims.

## Initial seed

Seeded MVP1 question bank with original prompts across product sense, execution, AI product judgment, behavioral, strategy, and technical collaboration.
