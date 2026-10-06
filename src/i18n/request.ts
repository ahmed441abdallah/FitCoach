import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

// Static imports — Turbopack cannot resolve dynamic template-literal paths for JSON.
// Pre-import all locales so the bundler can statically analyse them.
import en from "../../messages/en.json";
import ar from "../../messages/ar.json";

const messages = { en, ar } as const;
type Locale = keyof typeof messages;
const supported: Locale[] = ["en", "ar"];

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const raw = cookieStore.get("NEXT_LOCALE")?.value ?? "en";
  const locale: Locale = supported.includes(raw as Locale) ? (raw as Locale) : "en";

  return {
    locale,
    messages: messages[locale],
  };
});
