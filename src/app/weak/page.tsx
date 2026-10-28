// app/weak/page.tsx
"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

// Lazy-load the 59 KB modal — it only opens on user action, not on first paint.
const WeakMusclePlanModal = dynamic(
  () => import("@/components/WeakMusclePlanModal"),
  { ssr: false }
);

const ModelViewer = dynamic(() => import("@/components/ModelViewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        width: "100%",
        height: "100%",
        minHeight: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#090909",
        borderRadius: 20,
        color: "#444",
        fontSize: 13,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 28,
            height: 28,
            border: "2px solid rgba(200,255,0,0.15)",
            borderTopColor: "#c8ff00",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            margin: "0 auto 10px",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Loading 3D Anatomy…
      </div>
    </div>
  ),
});

/* ──────────────────────────────────────────────────────────────────────────
   Muscle data
   ──────────────────────────────────────────────────────────────────────── */

interface MuscleOption {
  id: string;
  label: string;
  subtitle: string;
  view: "front" | "back";
}

const MUSCLE_AREAS: MuscleOption[] = [
  { id: "chest", label: "Chest", subtitle: "Pectorals & Upper Body", view: "front" },
  { id: "shoulders", label: "Shoulders", subtitle: "Deltoids & Rotators", view: "front" },
  { id: "arms", label: "Arms", subtitle: "Biceps, Triceps & Forearms", view: "front" },
  { id: "abs", label: "Abs", subtitle: "Core, Obliques & Lower Abs", view: "front" },
  { id: "back", label: "Back", subtitle: "Lats, Rhomboids & Traps", view: "back" },
  { id: "legs", label: "Legs", subtitle: "Quadriceps & Hamstrings", view: "front" },
  { id: "calves", label: "Calves", subtitle: "Lower Legs & Calves", view: "front" },
  { id: "flexibility", label: "Flexibility", subtitle: "Mobility & Joint Range", view: "front" },
];

/* ──────────────────────────────────────────────────────────────────────────
   Page Component (Single Selection Apple-Style + Mobile Responsive)
   ──────────────────────────────────────────────────────────────────────── */

export default function WeakPointsPage() {
  // Single selection: only one primary muscle is selected at a time
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"front" | "back">("front");
  const [showPlan, setShowPlan] = useState(false);

  // Single select: toggles off if clicking same, or switches to the new muscle
  const handleSelectMuscle = useCallback(
    (id: string, view: "front" | "back") => {
      if (selectedMuscle === id) {
        setSelectedMuscle(null);
      } else {
        setSelectedMuscle(id);
        setActiveView(view);
      }
    },
    [selectedMuscle]
  );

  // When clicking a 3D beacon directly on the model
  const handleModelSelectMuscle = useCallback(
    (id: string) => {
      const area = MUSCLE_AREAS.find((m) => m.id === id);
      if (selectedMuscle === id) {
        setSelectedMuscle(null);
      } else {
        setSelectedMuscle(id);
        if (area) setActiveView(area.view);
      }
    },
    [selectedMuscle]
  );

  const handleReset = useCallback(() => {
    setSelectedMuscle(null);
    setActiveView("front");
  }, []);

  const activeOption = MUSCLE_AREAS.find((m) => m.id === selectedMuscle);

  return (
    <div
      style={{
        height: "100dvh",
        maxHeight: "100dvh",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        background: "#090909",
        color: "#f1ede5",
        fontFamily: "var(--font-barlow-condensed), system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ── 100vh Non-Scroll Locked Styles ──────────────────────────────── */}
      <style>{`
        html, body {
          overflow: hidden !important;
          height: 100% !important;
          max-height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .weak-page-header {
          flex-shrink: 0;
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
          padding: 10px 24px 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .weak-layout-grid {
          flex: 1;
          min-height: 0;
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
          padding: 4px 24px 12px;
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 14px;
          align-items: stretch;
          overflow: hidden;
        }

        .model-column {
          height: 100%;
          min-height: 0;
          position: relative;
          overflow: hidden;
          border-radius: 16px;
        }

        .selector-card {
          height: 100%;
          min-height: 0;
          background: #111111;
          border-radius: 16px;
          border: 1px solid #1e1e1e;
          padding: 14px 14px 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .muscle-item-btn {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          padding: 9px 12px;
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s ease;
          position: relative;
          width: 100%;
          flex-shrink: 0;
        }

        /* Mobile & Tablet Responsive Rules */
        @media (max-width: 960px) {
          .weak-page-header {
            padding: 8px 12px 4px;
          }
          .weak-header-desc {
            display: none;
          }
          .weak-layout-grid {
            padding: 2px 10px 8px;
            grid-template-columns: 1fr;
            grid-template-rows: 42% 58%;
            gap: 8px;
          }
          .selector-card {
            padding: 10px 10px 8px;
            border-radius: 14px;
          }
          .muscle-item-btn {
            padding: 8px 10px;
            border-radius: 10px;
          }
        }
      `}</style>

      {/* ── Top Bar ────────────────────────────────────────────────────── */}
      <header className="weak-page-header">
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#c8ff00",
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            Priority Target
          </div>
          <h1
            style={{
              fontSize: "clamp(1.15rem, 2.2vw, 1.55rem)",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Select <span style={{ color: "#c8ff00" }}>One</span> Weak Muscle
          </h1>
          <p
            className="weak-header-desc"
            style={{
              margin: "2px 0 0",
              color: "#666",
              fontSize: 12,
              letterSpacing: "0.01em",
            }}
          >
            Pick one primary focus area. The 3D model automatically zeros in to analyze it.
          </p>
        </div>

        {/* Selected badge + reset */}
        {selectedMuscle && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginTop: 4,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 800,
                padding: "5px 12px",
                borderRadius: 20,
                background: "rgba(40, 38, 38, 0.12)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {activeOption?.label || selectedMuscle} Focus
            </span>
            <button
              type="button"
              onClick={handleReset}
              style={{
                background: "transparent",
                border: "1px solid #272727",
                color: "#777",
                padding: "5px 10px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 4,
                transition: "color 0.2s",
              }}
            >
              Reset
            </button>
          </div>
        )}
      </header>

      {/* ── Main Layout Grid ───────────────────────────────────────────── */}
      <section className="weak-layout-grid">
        {/* Left: 3D Model with Focus & Responsive Sizing */}
        <div className="model-column">
          <ModelViewer
            height="100%"
            minHeight="0"
            activeView={activeView}
            onViewChange={setActiveView}
            focusedMuscle={selectedMuscle}
            onSelectMuscle={handleModelSelectMuscle}
            onResetFocus={handleReset}
          />
        </div>

        {/* Right: Apple-Style Single Selection Panel */}
        <div className="selector-card">
          {/* Panel Header */}
          <div
            style={{
              borderBottom: "1px solid #1e1e1e",
              paddingBottom: 8,
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: 0,
                  color: "#f1ede5",
                }}
              >
                Muscle Priority
              </h2>
              <span
                style={{
                  fontSize: 10.5,
                  color: "#555",
                  letterSpacing: "0.02em",
                }}
              >
                Select 1 muscle to target
              </span>
            </div>

            <span
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: selectedMuscle ? "#c8ff00" : "#555",
                letterSpacing: "0.1em",
                background: selectedMuscle
                  ? "rgba(200, 255, 0, 0.1)"
                  : "transparent",
                padding: "2px 7px",
                borderRadius: 6,
                border: selectedMuscle
                  ? "1px solid rgba(200, 255, 0, 0.2)"
                  : "none",
              }}
            >
              {selectedMuscle ? "1 Selected" : "0/1 Selected"}
            </span>
          </div>

          {/* Muscle List (Single Select Radio Cards) */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              paddingRight: 3,
            }}
          >
            {MUSCLE_AREAS.map((m) => {
              const isSelected = selectedMuscle === m.id;

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSelectMuscle(m.id, m.view)}
                  className="muscle-item-btn"
                  style={{
                    border: isSelected
                      ? "1px solid #c8ff00"
                      : "1px solid #1a1a1a",
                    background: isSelected
                      ? "#161616"
                      : "#0d0d0d",
                    boxShadow: "none",
                  }}
                >

                  {/* Muscle Label & Subtitle */}
                  <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          color: isSelected ? "#c8ff00" : "#ddd",
                          lineHeight: 1.2,
                        }}
                      >
                        {m.label}
                      </span>
                      {isSelected && (
                        <span
                          style={{
                            fontSize: 9,
                            fontWeight: 800,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: "#c8ff00",
                            color: "#090909",
                          }}
                        >
                          Target
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: isSelected
                          ? "rgba(200,255,0,0.75)"
                          : "#555",
                        letterSpacing: "0.02em",
                        marginTop: 2,
                      }}
                    >
                      {m.subtitle}
                    </div>
                  </div>

                  {/* Apple-Style Radio Indicator */}
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: "50%",
                      border: isSelected
                        ? "2px solid #c8ff00"
                        : "1.5px solid #2a2a2a",
                      background: isSelected
                        ? "rgba(200,255,0,0.12)"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {isSelected && (
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: "#c8ff00",
                        }}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Action Footer (Always Pinned at bottom) */}
          <div
            style={{
              borderTop: "1px solid #1e1e1e",
              paddingTop: 8,
              marginTop: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#666",
                letterSpacing: "0.02em",
              }}
            >
              {selectedMuscle ? (
                <span>
                  Target:{" "}
                  <strong style={{ color: "#c8ff00", fontWeight: 700 }}>
                    {activeOption?.label}
                  </strong>
                </span>
              ) : (
                "Choose 1 muscle"
              )}
            </div>

            <button
              type="button"
              disabled={!selectedMuscle}
              onClick={() => {
                if (selectedMuscle) setShowPlan(true);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 18px",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                border: "none",
                cursor: !selectedMuscle ? "not-allowed" : "pointer",
                background: !selectedMuscle ? "#181818" : "#c8ff00",
                color: !selectedMuscle ? "#555" : "#090909",
                transition: "all 0.2s ease",
                boxShadow: "none",
              }}
            >
              Generate Plan
            </button>
          </div>
        </div>
      </section>
      {showPlan && selectedMuscle && (
        <WeakMusclePlanModal
          muscleId={selectedMuscle}
          onClose={() => setShowPlan(false)}
        />
      )}
    </div>
  );
}