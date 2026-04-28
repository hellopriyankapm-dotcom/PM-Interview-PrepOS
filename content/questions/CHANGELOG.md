# Question Bank Changelog

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
