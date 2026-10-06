import "server-only";

export function getFitcoachApiUrl() {
  const configuredApiUrl = process.env.FITCOACH_API_URL;

  if (!configuredApiUrl) {
    throw new Error("FITCOACH_API_URL must be set on the server.");
  }

  return configuredApiUrl.replace(/\/$/, "");
}
