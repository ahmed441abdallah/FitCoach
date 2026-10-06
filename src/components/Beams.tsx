import React from "react";

// Placeholder component for Beams background
export default function Beams(props: any) {
  return (
    <div 
      className="w-full h-full absolute inset-0 opacity-20 pointer-events-none"
      style={{
        background: props.backgroundColor || "transparent",
        backgroundImage: `linear-gradient(45deg, ${props.beamColor || "rgba(255,255,255,0.1)"} 25%, transparent 25%, transparent 50%, ${props.beamColor || "rgba(255,255,255,0.1)"} 50%, ${props.beamColor || "rgba(255,255,255,0.1)"} 75%, transparent 75%, transparent)`
      }}
    />
  );
}
