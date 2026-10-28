"use client";

import dynamic from "next/dynamic";

// Lazy-load ChatbotWidget — it imports motion/react and only appears after scroll,
// so there's no reason to include it in the initial JS bundle.
const ChatbotWidget = dynamic(() => import("@/components/ChatbotWidget"), {
  ssr: false,
});

export default function ChatbotWidgetLazy() {
  return <ChatbotWidget />;
}
