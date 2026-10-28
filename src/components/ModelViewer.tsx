// components/ModelViewer.tsx
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Center } from "@react-three/drei";
import { Suspense, useRef, useState, useEffect } from "react";
import { Vector3, DoubleSide, Mesh } from "three";
import type { Mesh as MeshType } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/* ──────────────────────────────────────────────────────────────────────────
   Focus Presets & Coordinates
   Scaled model height is ~3.26 units centered at (0, 0, 0)
   ──────────────────────────────────────────────────────────────────────── */

export interface FocusPreset {
    id: string;
    label: string;
    target: [number, number, number];
    position: [number, number, number];
    view: "front" | "back";
    pinPosition?: [number, number, number];
}

export const FOCUS_PRESETS: Record<string, FocusPreset> = {
    chest: {
        id: "chest",
        label: "Chest",
        target: [0, 0.82, 0],
        position: [0, 0.86, 1.85],
        view: "front",
        pinPosition: [0, 0.85, 0.38],
    },
    shoulders: {
        id: "shoulders",
        label: "Shoulders",
        target: [0, 1.06, 0],
        position: [0, 1.12, 2.0],
        view: "front",
        pinPosition: [0, 1.12, 0.30],
    },
    arms: {
        id: "arms",
        label: "Arms",
        target: [0, 0.72, 0],
        position: [0, 0.76, 2.45],
        view: "front",
        pinPosition: [-0.92, 0.70, 0.16],
    },
    abs: {
        id: "abs",
        label: "Abs",
        target: [0, 0.42, 0],
        position: [0, 0.44, 1.75],
        view: "front",
        pinPosition: [0, 0.42, 0.35],
    },
    back: {
        id: "back",
        label: "Back",
        target: [0, 0.85, 0],
        position: [0, 0.90, -2.15],
        view: "back",
        pinPosition: [0, 0.88, -0.35],
    },
    legs: {
        id: "legs",
        label: "Legs",
        target: [0, -0.45, 0],
        position: [0, -0.40, 2.35],
        view: "front",
        pinPosition: [0, -0.45, 0.32],
    },
    calves: {
        id: "calves",
        label: "Calves",
        target: [0, -1.05, 0],
        position: [0, -1.00, 2.0],
        view: "front",
        pinPosition: [0, -1.05, 0.24],
    },
    flexibility: {
        id: "flexibility",
        label: "Full Body",
        target: [0, 0.15, 0],
        position: [0, 0.2, 4.8],
        view: "front",
        pinPosition: [0, 0.15, 0],
    },
};

function Model() {
    const { scene } = useGLTF("/models/MascularMale.glb");
    return (
        <Center>
            <primitive object={scene} scale={0.15} />
        </Center>
    );
}

// useGLTF.preload removed — the 10.9 MB GLB should only download
// when the ModelViewer component actually mounts (it's already behind next/dynamic).

function Loader() {
    return (
        <div
            style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: "#c8ff00",
                fontFamily: "system-ui, sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "#090909",
                zIndex: 5,
            }}
        >
            <div
                style={{
                    width: 32,
                    height: 32,
                    border: "3px solid rgba(200,255,0,0.15)",
                    borderTopColor: "#c8ff00",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                    marginBottom: 10,
                }}
            />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading 3D Anatomy…
        </div>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   Camera Focus Controller
   Smoothly interpolates camera position and OrbitControls target in spherical
   coordinates with responsive distance adjustment on mobile screens.
   ──────────────────────────────────────────────────────────────────────── */

interface CameraControllerProps {
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
    focusedMuscle?: string | null;
    activeView: "front" | "back";
}

function CameraFocusController({
    controlsRef,
    focusedMuscle,
    activeView,
}: CameraControllerProps) {
    const { camera, size } = useThree();
    const isTransitioning = useRef(false);
    const targetLookAt = useRef(new Vector3(0, 0.15, 0));
    const destPos = useRef(new Vector3(0, 0.2, 4.8));

    // On mobile screens (width < 600px), apply a distance multiplier so the model fits perfectly
    const isMobile = size.width < 600;
    const distScale = isMobile ? 1.25 : 1.0;

    useEffect(() => {
        if (focusedMuscle && FOCUS_PRESETS[focusedMuscle]) {
            const preset = FOCUS_PRESETS[focusedMuscle];
            targetLookAt.current.set(...preset.target);
            destPos.current.set(
                preset.position[0],
                preset.position[1],
                preset.position[2] * distScale
            );
        } else {
            targetLookAt.current.set(0, 0.15, 0);
            const z = (activeView === "back" ? -4.8 : 4.8) * distScale;
            destPos.current.set(0, 0.2, z);
        }
        isTransitioning.current = true;
    }, [focusedMuscle, activeView, distScale]);

    useFrame((_, delta) => {
        if (!isTransitioning.current || !controlsRef.current) return;

        const controls = controlsRef.current;
        const factor = 1 - Math.exp(-Math.min(delta, 0.1) * 6);

        const currentTarget = controls.target;
        currentTarget.lerp(targetLookAt.current, factor);

        const currRel = camera.position.clone().sub(currentTarget);
        const destRel = destPos.current.clone().sub(targetLookAt.current);

        const currRadius = currRel.length();
        const destRadius = destRel.length();

        const currPhi = Math.acos(
            Math.max(-1, Math.min(1, currRel.y / Math.max(0.001, currRadius)))
        );
        const destPhi = Math.acos(
            Math.max(-1, Math.min(1, destRel.y / Math.max(0.001, destRadius)))
        );

        const currTheta = Math.atan2(currRel.x, currRel.z);
        const destTheta = Math.atan2(destRel.x, destRel.z);

        let dTheta = (destTheta - currTheta) % (2 * Math.PI);
        if (dTheta > Math.PI) dTheta -= 2 * Math.PI;
        if (dTheta < -Math.PI) dTheta += 2 * Math.PI;

        const newTheta = currTheta + dTheta * factor;
        const newPhi = currPhi + (destPhi - currPhi) * factor;
        const newRadius = currRadius + (destRadius - currRadius) * factor;

        camera.position.x =
            currentTarget.x + newRadius * Math.sin(newPhi) * Math.sin(newTheta);
        camera.position.y = currentTarget.y + newRadius * Math.cos(newPhi);
        camera.position.z =
            currentTarget.z + newRadius * Math.sin(newPhi) * Math.cos(newTheta);

        controls.update();

        const posDist = camera.position.distanceTo(destPos.current);
        const targetDist = currentTarget.distanceTo(targetLookAt.current);
        if (posDist < 0.005 && targetDist < 0.005) {
            camera.position.copy(destPos.current);
            controls.target.copy(targetLookAt.current);
            controls.update();
            isTransitioning.current = false;
        }
    });

    return null;
}

/* ──────────────────────────────────────────────────────────────────────────
   Native 3D WebGL Target Beacon
   100% pure Three.js geometry — zero DOM Html roots, zero React unmount errors
   ──────────────────────────────────────────────────────────────────────── */

function MuscleTargetBeacon({
    preset,
    isFocused,
    onSelect,
}: {
    preset: FocusPreset;
    isFocused: boolean;
    onSelect: () => void;
}) {
    const ringRef = useRef<MeshType>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(({ clock }) => {
        if (ringRef.current && isFocused) {
            const t = clock.getElapsedTime() * 3.5;
            const s = 1 + (Math.sin(t) * 0.25 + 0.25);
            ringRef.current.scale.set(s, s, s);
        }
    });

    if (!preset.pinPosition) return null;

    return (
        <group position={preset.pinPosition}>
            {/* Interactive Core Marker */}
            <mesh
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                }}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[isFocused ? 0.038 : hovered ? 0.032 : 0.022, 16, 16]} />
                <meshBasicMaterial
                    color={isFocused || hovered ? "#141414ff" : "#363634ff"}
                    transparent
                    opacity={isFocused ? 1 : hovered ? 0.9 : 0.65}
                />
            </mesh>

            {/* Pulsing targeting ring when focused */}
            {isFocused && (
                <mesh ref={ringRef} rotation={[0, preset.view === "back" ? Math.PI : 0, 0]}>
                    <ringGeometry args={[0.055, 0.075, 32]} />
                    <meshBasicMaterial
                        color="#313131ff"
                        side={DoubleSide}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            )}
        </group>
    );
}

/* ──────────────────────────────────────────────────────────────────────────
   ModelViewer Component
   ──────────────────────────────────────────────────────────────────────── */

interface ModelViewerProps {
    height?: string | number;
    minHeight?: string | number;
    activeView?: "front" | "back";
    onViewChange?: (view: "front" | "back") => void;
    focusedMuscle?: string | null;
    onSelectMuscle?: (muscleId: string) => void;
    onResetFocus?: () => void;
    selectedMuscle?: string | null;
}

export default function ModelViewer({
    height = "100%",
    minHeight = "100%",
    activeView = "front",
    onViewChange,
    focusedMuscle,
    onSelectMuscle,
    onResetFocus,
}: ModelViewerProps) {
    const [internalView, setInternalView] = useState<"front" | "back">("front");
    const [autoRotate, setAutoRotate] = useState(false);
    const [showBeacons, setShowBeacons] = useState(true);
    const controlsRef = useRef<OrbitControlsImpl>(null);

    const currentView = activeView || internalView;

    const handleViewSwitch = (v: "front" | "back") => {
        setInternalView(v);
        onViewChange?.(v);
    };

    const handleReset = () => {
        onResetFocus?.();
        setInternalView("front");
        onViewChange?.("front");
    };

    const activePreset = focusedMuscle ? FOCUS_PRESETS[focusedMuscle] : null;

    return (
        <div
            style={{
                width: "100%",
                height,
                minHeight,
                background: "#090909",
                position: "relative",
                borderRadius: "20px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.08)",
                touchAction: "none",
            }}
        >
            <Suspense fallback={<Loader />}>
                <Canvas
                    camera={{ position: [0, 0.2, 4.8], fov: 45 }}
                    dpr={[1, 1.5]}
                    gl={{ antialias: true }}
                    style={{ touchAction: "none" }}
                >
                    {/* Studio Lights */}
                    <ambientLight intensity={0.9} />
                    <hemisphereLight args={["#ffffff", "#1a1a1a", 0.9]} />
                    <directionalLight position={[4, 8, 5]} intensity={1.8} />
                    <directionalLight position={[-4, 4, -4]} intensity={1.0} color="#e8e4dd" />
                    <directionalLight position={[0, -4, 4]} intensity={0.4} />

                    <Model />

                    {/* Native 3D Target Beacons */}
                    {showBeacons &&
                        Object.values(FOCUS_PRESETS).map((preset) => (
                            <MuscleTargetBeacon
                                key={preset.id}
                                preset={preset}
                                isFocused={focusedMuscle === preset.id}
                                onSelect={() => onSelectMuscle?.(preset.id)}
                            />
                        ))}

                    <CameraFocusController
                        controlsRef={controlsRef}
                        focusedMuscle={focusedMuscle}
                        activeView={currentView}
                    />

                    <OrbitControls
                        ref={controlsRef}
                        enableDamping
                        dampingFactor={0.05}
                        enablePan={false}
                        minDistance={1.3}
                        maxDistance={8.5}
                        target={[0, 0.15, 0]}
                        autoRotate={autoRotate}
                        autoRotateSpeed={1.5}
                    />
                </Canvas>
            </Suspense>

            {/* Top Left: Navigation Hint */}
            <div
                style={{
                    position: "absolute",
                    top: 12,
                    left: 14,
                    fontSize: "10px",
                    color: "rgba(255, 255, 255, 0.4)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    pointerEvents: "none",
                    fontWeight: 600,
                }}
            >
                3D Body · Drag to rotate
            </div>

            {/* Top Right: Focus Status Badge */}
            {activePreset && (
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(9, 9, 9, 0.88)",
                        border: "1px solid rgba(200, 255, 0, 0.35)",
                        borderRadius: 10,
                        padding: "4px 10px",
                        backdropFilter: "blur(12px)",
                        zIndex: 10,
                        boxShadow: "0 4px 18px rgba(0, 0, 0, 0.5)",
                        maxWidth: "calc(100% - 24px)",
                    }}
                >
                    <div
                        style={{
                            width: 7,
                            height: 7,
                            borderRadius: "50%",
                            background: "#40403fff",
                            boxShadow: "0 0 8px #333332ff",
                            flexShrink: 0,
                        }}
                    />
                    <span
                        style={{
                            fontSize: 10.5,
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#e1e3e1ff",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {activePreset.label}
                    </span>
                    <button
                        type="button"
                        onClick={handleReset}
                        style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            border: "none",
                            color: "#ddd",
                            fontSize: 9.5,
                            fontWeight: 700,
                            padding: "3px 7px",
                            borderRadius: 6,
                            cursor: "pointer",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginLeft: 2,
                            transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = "#090909";
                            e.currentTarget.style.background = "#2f2f2eff";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = "#ddd";
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                        }}
                    >
                        Reset
                    </button>
                </div>
            )}

            {/* Floating View Controls (Mobile Optimized) */}
            <div
                style={{
                    position: "absolute",
                    bottom: 12,
                    left: "50%",
                    transform: "translateX(-50%)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(9, 9, 9, 0.88)",
                    backdropFilter: "blur(14px)",
                    padding: "4px 6px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    zIndex: 10,
                    maxWidth: "calc(100% - 20px)",
                }}
            >
                <button
                    type="button"
                    onClick={() => handleViewSwitch("front")}
                    style={{
                        padding: "5px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        borderRadius: "7px",
                        border: "none",
                        cursor: "pointer",
                        background: currentView === "front" ? "#5e5e5cff" : "transparent",
                        color: currentView === "front" ? "#0a0c10" : "#999",
                        transition: "all 0.2s ease",
                    }}
                >
                    Front
                </button>
                <button
                    type="button"
                    onClick={() => handleViewSwitch("back")}
                    style={{
                        padding: "5px 12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        borderRadius: "7px",
                        border: "none",
                        cursor: "pointer",
                        background: currentView === "back" ? "#c8ff00" : "transparent",
                        color: currentView === "back" ? "#0a0c10" : "#999",
                        transition: "all 0.2s ease",
                    }}
                >
                    Back
                </button>
                <div
                    style={{
                        width: 1,
                        height: 14,
                        background: "rgba(255,255,255,0.15)",
                        margin: "0 1px",
                    }}
                />
                <button
                    type="button"
                    onClick={() => setShowBeacons(!showBeacons)}
                    style={{
                        padding: "5px 10px",
                        fontSize: "10.5px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        borderRadius: "7px",
                        border: "none",
                        cursor: "pointer",
                        background: showBeacons ? "rgba(200, 255, 0, 0.15)" : "transparent",
                        color: showBeacons ? "#c8ff00" : "#888",
                        transition: "all 0.2s ease",
                    }}
                >
                    Points
                </button>
                <button
                    type="button"
                    onClick={() => setAutoRotate(!autoRotate)}
                    style={{
                        padding: "5px 10px",
                        fontSize: "10.5px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        borderRadius: "7px",
                        border: "none",
                        cursor: "pointer",
                        background: autoRotate ? "rgba(200, 255, 0, 0.2)" : "transparent",
                        color: autoRotate ? "#c8ff00" : "#888",
                        transition: "all 0.2s ease",
                    }}
                >
                    {autoRotate ? "Pause" : "Spin"}
                </button>
                <button
                    type="button"
                    onClick={handleReset}
                    style={{
                        padding: "5px 9px",
                        fontSize: "10.5px",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        borderRadius: "7px",
                        border: "none",
                        cursor: "pointer",
                        background: "transparent",
                        color: "#888",
                        transition: "all 0.2s ease",
                    }}
                >
                    Reset
                </button>
            </div>
        </div>
    );
}