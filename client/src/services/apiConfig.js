// Vite injects this at build time. In production, the API is served by the
// same Render service, so relative URLs keep the browser on the current host.
const configuredApiUrl = import.meta.env.VITE_API_URL;
const fallbackApiUrl = import.meta.env.PROD ? "" : "http://localhost:5000";

export const API_ORIGIN = (configuredApiUrl ?? fallbackApiUrl).replace(/\/$/, "");
