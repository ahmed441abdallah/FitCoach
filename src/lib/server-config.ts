import "server-only";

const configuredApiUrl = process.env.FITCOACH_API_URL;

if (!configuredApiUrl) {
  throw new Error("FITCOACH_API_URL must be set on the server.");
}

export const FITCOACH_API_URL = configuredApiUrl.replace(/\/$/, "");
