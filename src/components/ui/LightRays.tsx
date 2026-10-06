import React from "react";

// Placeholder component for LightRays WebGL background
export default function LightRays(props: any) {
  return (
    <div
      className="w-full h-full absolute inset-0 opacity-10 pointer-events-none"
      style={{
        background: `radial-gradient(circle at top center, ${props.raysColor || "rgba(255,255,255,0.2)"} 0%, transparent 70%)`
      }}
    />
  );
}
