# Trusted Question Bank Updates

PrepOS can update itself, but not by copying untrusted or unauthorized content.

Allowed source categories:

- `official`: company hiring pages or docs.
- `public`: public articles and blogs with attribution.
- `public_video`: public videos used as trend signals or cited inspiration.
- `community`: candidate submissions with explicit permission.
- `original`: prompts written for PrepOS.
- `synthetic`: AI-generated prompts reviewed by a human.

## Update Loop

1. A source monitor or user submission adds a candidate item to `content/source-inbox/submissions.json`.
2. The item must include source metadata, consent, review status, concepts, target levels, and difficulty.
3. A human reviewer marks it `approved`.
4. `npm run update:questions` publishes approved items into `content/questions/questions.json`.
5. `npm run validate:content` blocks missing source metadata or unreviewed content.
6. The GitHub Action opens a pull request for weekly updates.

YouTube and other public videos should mostly feed trend detection and original prompt creation. PrepOS should cite the video if it materially influenced the prompt, but avoid copying full transcripts or creator-owned answer content.
