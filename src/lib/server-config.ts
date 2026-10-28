import "server-only";

export function getFitcoachApiUrl() {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!configuredApiUrl) {
    throw new Error("NEXT_PUBLIC_API_URL must be set on the server.");
  }

  return configuredApiUrl.replace(/\/$/, "");
}
