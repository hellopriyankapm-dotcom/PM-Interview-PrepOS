# Question Bank Changelog

## 2026-04-28 — PR D: bank reaches 250

Added 48 prompts (16 AI product judgment + 16 technical collaboration
+ 16 strategy) and cleared the standing concept-coverage warning.

AI judgment (16): evals (search, generated UI), trust patterns,
fallbacks (image gen, agent undo), cost (router, caching, quality cuts),
hallucination (legal cites, uncertainty UX, label vs watermark),
synthetic data, beta + sunset, moderation edge cases, 200M-user onboarding.

Technical collaboration (16): 6 api_contracts (versioning, breaking
changes, GraphQL vs REST, internal vs partner, webhooks, pagination),
5 engineering alignment, 5 reliability/data/platform.

Strategy (16): acquire vs build community, open-source decision,
feature-to-platform, international sequencing, vertical variant,
unbundle, loyalty, monetize free distribution, build ecosystem,
defend against OS clone, positioning pivot, disrupt incumbent,
PLG vs sales-led, prosumer-to-enterprise, declining product line,
distribution partnership.

Concept fix: technical_collaboration.api_contracts 2 → 8 (validator
warning that has been outstanding since PR A is now resolved).

Final bank: **250 questions, 0 warnings, 0 near-duplicates.**
Difficulty: D2 29 / D3 97 / D4 106 / D5 18.
Every concept now has ≥ 8 questions.

## 2026-04-28 — PR C: bank expansion to 202

Added 45 behavioral-leadership and estimation-prioritization prompts.

Behavioral (28): 5 influence, 6 conflict-handling, 4 failure/learning,
4 customer-voice, 4 organizational, 3 communication, 3 risk/judgment,
3 leadership in ambiguity. Boosted under-covered concepts:
behavioral.conflict_handling 4 → 16, behavioral.star_arc_structure 9 → 34.

Estimation (17): 6 market sizing (NYC coffee, gym memberships, SF rides,
airport flights, holiday SMS, TV ad revenue), 3 technical sizing
(video bandwidth, AI compute cost, social-feed read volume), 6 priority
calls (3 customers same ask, tech-debt vs deadline, board override,
shared platform dependency, early-stage quarterly priority, backlog
trim), 2 effort estimates (analytics dashboard, multi-region launch).

Distribution shifts: D2 entry 17 → 28, APM-tagged 20 → 31, behavioral
category 18 → 48, estimation category 9 → 26.

Also removed two near-duplicate execution prompts identified by Jaccard
audit (exec-diag-001, exec-power-002).

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
