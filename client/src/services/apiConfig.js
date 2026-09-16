// Vite injects this at build time. The fallback preserves local development.
export const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
