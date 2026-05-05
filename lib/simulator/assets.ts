// Hard-coded Sarah portrait. The binary lives at `public/sarah-portrait.jpg`
// and is served at:
//   - locally / preview: /sarah-portrait.jpg
//   - production:        https://pmprepos.com/sarah-portrait.jpg
//
// SARAH_PORTRAIT_LOCAL — used by the <img> fallback inside the simulator UI.
//                        basePath is empty on a custom domain; left in place
//                        in case future deploys reintroduce one.
// SARAH_PORTRAIT_PUBLIC_URL — sent to D-ID as source_url. D-ID's servers
//                             must fetch this over HTTPS, so we always point
//                             at the deployed origin.

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const deployedOrigin =
  process.env.NEXT_PUBLIC_DEPLOYED_ORIGIN || "https://pmprepos.com";

export const SARAH_PORTRAIT_FILENAME = "sarah-portrait.jpg";

export const SARAH_PORTRAIT_LOCAL = `${basePath}/${SARAH_PORTRAIT_FILENAME}`;

export const SARAH_PORTRAIT_PUBLIC_URL = `${deployedOrigin}/${SARAH_PORTRAIT_FILENAME}`;
