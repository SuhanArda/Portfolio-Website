"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Hand, Zap, Aperture, ArrowLeft, ToggleLeft, ToggleRight } from "lucide-react";
import PhysicsLab from "@/components/PhysicsLab";
import HandTrackingBridge from "@/components/HandTrackingBridge";

export default function NeuralSpherePage() {
    const [gravityEnabled, setGravityEnabled] = useState(false);
    const [handCount, setHandCount] = useState(0);
    const [fps, setFps] = useState(0);
    const [handLandmarks, setHandLandmarks] = useState<{ x: number; y: number }[][]>([]);
    const [pinchStates, setPinchStates] = useState<boolean[]>([]);

    // ── Total Chatbot Nuke ──────────────────────────────────────────────────
    useEffect(() => {
        const style = document.createElement("style");
        style.textContent = `
            #chatbot-container, .chatbot-wrapper,
            [id^="chatbot"], [class*="chatbot"] {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // ── Grab / Scale Computation ─────────────────────────────────────────────
    // Landmarks per hand: [wrist(0), thumb(1), index(2), middle(3), ring(4), pinky(5)]
    const { isGrabbing, grabPosition, targetScale } = useMemo(() => {
        const oneHandPinch = pinchStates.length === 1 && pinchStates[0];
        const twoHandPinch = pinchStates.length === 2 && pinchStates[0] && pinchStates[1];

        // ── Single-Hand Grab: drag sphere to pinch midpoint ──
        if (oneHandPinch && handLandmarks[0]) {
            const thumb = handLandmarks[0][1]; // thumb tip
            const index = handLandmarks[0][2]; // index tip
            if (thumb && index && typeof thumb.x === "number" && typeof index.x === "number") {
                return {
                    isGrabbing: true,
                    grabPosition: {
                        x: (thumb.x + index.x) / 2,
                        y: (thumb.y + index.y) / 2,
                    },
                    targetScale: 0.5,
                };
            }
        }

        // ── Two-Hand Scale: distance between hand centers → scale ──
        if (twoHandPinch && handLandmarks[0] && handLandmarks[1]) {
            const center0 = getHandCenter(handLandmarks[0]);
            const center1 = getHandCenter(handLandmarks[1]);
            if (center0 && center1) {
                const dist = Math.sqrt(
                    Math.pow(center0.x - center1.x, 2) +
                    Math.pow(center0.y - center1.y, 2)
                );
                // Map distance → scale: 0.2 to 1.5 range
                const scale = Math.max(0.2, Math.min(1.5, dist / 4));
                const midpoint = {
                    x: (center0.x + center1.x) / 2,
                    y: (center0.y + center1.y) / 2,
                };
                return {
                    isGrabbing: true,
                    grabPosition: midpoint,
                    targetScale: scale,
                };
            }
        }

        // ── Default: push mode ──
        return { isGrabbing: false, grabPosition: null, targetScale: 0.5 };
    }, [handLandmarks, pinchStates]);

    return (
        <div className="h-screen w-screen relative bg-black text-white overflow-hidden">

            {/* ═══ Background Grid Overlay ═══ */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    zIndex: 0,
                    backgroundImage: `
                        linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px),
                        linear-gradient(rgba(251,191,36,0.02) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(251,191,36,0.02) 1px, transparent 1px)
                    `,
                    backgroundSize: "60px 60px, 60px 60px, 20px 20px, 20px 20px",
                }}
            />

            {/* ═══ Ambient Glow Effects ═══ */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    zIndex: 0,
                    background: `
                        radial-gradient(ellipse 800px 400px at 30% 80%, rgba(0,255,65,0.04), transparent),
                        radial-gradient(ellipse 600px 300px at 70% 20%, rgba(251,191,36,0.03), transparent)
                    `,
                }}
            />

            {/* ═══ R3F Physics Scene (z-index: 1) ═══ */}
            <PhysicsLab
                gravityEnabled={gravityEnabled}
                handLandmarks={handLandmarks}
                isGrabbing={isGrabbing}
                grabPosition={grabPosition}
                targetScale={targetScale}
            />

            {/* ═══ Hand Tracking Camera + Canvas Overlay (z-index: 20) ═══ */}
            <HandTrackingBridge
                onHandCountChange={setHandCount}
                onFpsChange={setFps}
                onHandLandmarksChange={setHandLandmarks}
                onPinchStatesChange={setPinchStates}
            />

            {/* ═══ Glassmorphic Floating Island HUD (z-index: 50) ═══ */}
            <div
                className="absolute top-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-6xl flex justify-between items-center px-6 py-4 rounded-2xl"
                style={{
                    zIndex: 50,
                    background: "rgba(0, 0, 0, 0.2)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 0 30px rgba(0, 255, 65, 0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
            >
                {/* ─── Left: TERMINATE_LINK ─── */}
                <Link
                    href="/"
                    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-mono text-sm transition-all duration-300"
                    style={{
                        background: "rgba(127, 29, 29, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#f87171",
                        boxShadow: "0 0 12px rgba(239, 68, 68, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(127, 29, 29, 0.35)";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(127, 29, 29, 0.15)";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                        e.currentTarget.style.boxShadow = "0 0 12px rgba(239, 68, 68, 0.1)";
                    }}
                >
                    <ArrowLeft size={15} />
                    TERMINATE_LINK
                </Link>

                {/* ─── Center: Telemetry Grid ─── */}
                <div className="flex items-center gap-6">
                    {/* HANDS */}
                    <div
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                        style={{
                            background: "rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                    >
                        <Hand size={14} color="#00ff41" strokeWidth={2.5} />
                        <div>
                            <div className="text-[10px] tracking-[0.15em] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
                                DETECTING HANDS
                            </div>
                            <div className="text-sm font-bold font-mono" style={{ color: "#00ff41" }}>
                                {handCount} <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400, fontSize: "10px" }}>[max: 2]</span>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <div style={{ width: "1px", height: "32px", background: "rgba(255,255,255,0.1)" }} />

                    {/* FPS */}
                    <div
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                        style={{
                            background: "rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                    >
                        <Zap size={14} color="#00ff41" strokeWidth={2.5} />
                        <div>
                            <div className="text-[10px] tracking-[0.15em] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
                                NEURAL NET FPS
                            </div>
                            <div className="text-sm font-bold font-mono" style={{ color: "#00ff41" }}>
                                {fps}
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <div style={{ width: "1px", height: "32px", background: "rgba(255,255,255,0.1)" }} />

                    {/* PHYSICS STATE */}
                    <div
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                        style={{
                            background: "rgba(0, 0, 0, 0.3)",
                            border: "1px solid rgba(255, 255, 255, 0.08)",
                        }}
                    >
                        <Aperture size={14} color="#00ff41" strokeWidth={2.5} />
                        <div>
                            <div className="text-[10px] tracking-[0.15em] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
                                PHYSICS STATE
                            </div>
                            <div className="text-sm font-bold font-mono" style={{ color: "#00ff41" }}>
                                {isGrabbing ? "Kavrama_Active" : gravityEnabled ? "Active_Gravity" : "Zero_Gravity"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ─── Right: GRAVITY_OVERRIDE ─── */}
                <button
                    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-mono text-sm transition-all duration-300 cursor-pointer"
                    style={{
                        background: "rgba(120, 53, 15, 0.15)",
                        border: "1px solid rgba(251, 191, 36, 0.2)",
                        color: "#fbbf24",
                        boxShadow: "0 0 12px rgba(251, 191, 36, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(120, 53, 15, 0.35)";
                        e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.5)";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(251, 191, 36, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(120, 53, 15, 0.15)";
                        e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.2)";
                        e.currentTarget.style.boxShadow = "0 0 12px rgba(251, 191, 36, 0.1)";
                    }}
                    onClick={() => setGravityEnabled((prev) => !prev)}
                >
                    {gravityEnabled ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                    GRAVITY_OVERRIDE
                </button>
            </div>

            {/* ═══ Bottom Status Ticker ═══ */}
            <div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] px-4 py-1.5 rounded-full"
                style={{
                    zIndex: 50,
                    color: "rgba(0, 255, 65, 0.4)",
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid rgba(0, 255, 65, 0.08)",
                }}
            >
                NEURAL_SPHERE_ENGINE v2.0 • HAND_PHYSICS_ACTIVE • {handCount > 0 ? "TRACKING" : "STANDBY"}
            </div>
        </div>
    );
}

// ── Helper: compute average center of 6 landmarks ───────────────────────────
function getHandCenter(landmarks: { x: number; y: number }[]): { x: number; y: number } | null {
    if (!landmarks || landmarks.length === 0) return null;
    let sumX = 0;
    let sumY = 0;
    let count = 0;
    for (const lm of landmarks) {
        if (lm && typeof lm.x === "number" && typeof lm.y === "number" && lm.x < 50) {
            sumX += lm.x;
            sumY += lm.y;
            count++;
        }
    }
    if (count === 0) return null;
    return { x: sumX / count, y: sumY / count };
}
