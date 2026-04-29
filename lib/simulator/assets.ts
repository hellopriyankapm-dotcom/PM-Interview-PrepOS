// Hard-coded Sarah portrait. Both paths assume the binary lives at
// `public/sarah-portrait.jpg` in the repo and is served at:
//   - locally / preview: /sarah-portrait.jpg
//   - GitHub Pages:      https://hellopriyankapm-dotcom.github.io/PM-Interview-PrepOS/sarah-portrait.jpg
//
// SARAH_PORTRAIT_LOCAL — used by the <img> fallback inside the simulator UI.
//                        basePath-aware so it works in dev AND on Pages.
// SARAH_PORTRAIT_PUBLIC_URL — sent to D-ID as source_url. D-ID's servers
//                             must be able to fetch this over HTTPS, so we
//                             always point at the deployed origin.

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const deployedOrigin =
  process.env.NEXT_PUBLIC_DEPLOYED_ORIGIN || "https://hellopriyankapm-dotcom.github.io";
const repoSegment = "/PM-Interview-PrepOS";

export const SARAH_PORTRAIT_FILENAME = "sarah-portrait.jpg";

export const SARAH_PORTRAIT_LOCAL = `${basePath}/${SARAH_PORTRAIT_FILENAME}`;

export const SARAH_PORTRAIT_PUBLIC_URL = `${deployedOrigin}${repoSegment}/${SARAH_PORTRAIT_FILENAME}`;
