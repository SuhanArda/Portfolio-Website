"use client";

import React, { Suspense, useRef, useState, useCallback, useMemo, useEffect } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Text, RoundedBox, useGLTF, Float, Html, ContactShadows, Stars, Environment, useProgress } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import * as THREE from "three";

/* ═══════════════════════════════════════════════════════════════════════════
   CYBER BOOT LOADER — full-screen HTML overlay hiding canvas until ready
   ═══════════════════════════════════════════════════════════════════════════ */
function CyberBootLoader() {
    const { active, progress } = useProgress();
    const [visible, setVisible] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        if (progress >= 100 && !active) {
            const t1 = setTimeout(() => setFadeOut(true), 400);
            const t2 = setTimeout(() => setVisible(false), 1200);
            return () => { clearTimeout(t1); clearTimeout(t2); };
        }
    }, [progress, active]);

    if (!visible) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                zIndex: 100,
                background: "#05050a",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Courier New', Courier, monospace",
                transition: "opacity 0.8s ease-out",
                opacity: fadeOut ? 0 : 1,
                pointerEvents: fadeOut ? "none" : "auto",
            }}
        >
            {/* Animated spinner ring */}
            <div style={{
                width: 64, height: 64,
                borderRadius: "50%",
                border: "3px solid rgba(0, 255, 204, 0.08)",
                borderTopColor: "#00ffcc",
                borderRightColor: "rgba(0, 255, 204, 0.3)",
                animation: "cyberSpin 1s linear infinite",
                boxShadow: "0 0 24px rgba(0, 255, 204, 0.25), inset 0 0 12px rgba(0, 255, 204, 0.08)",
                marginBottom: 32,
            }} />

            {/* Progress bar track */}
            <div style={{
                width: 260, height: 3,
                background: "rgba(0, 255, 204, 0.06)",
                borderRadius: 2,
                overflow: "hidden",
                marginBottom: 24,
                border: "1px solid rgba(0, 255, 204, 0.1)",
            }}>
                <div style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, #00ffcc, #00e6ff)",
                    borderRadius: 2,
                    transition: "width 0.3s ease-out",
                    boxShadow: "0 0 12px rgba(0, 255, 204, 0.5)",
                }} />
            </div>

            {/* Terminal text lines */}
            <p style={{
                color: "rgba(0, 255, 204, 0.35)",
                fontSize: 11,
                letterSpacing: "0.18em",
                marginBottom: 8,
                textTransform: "uppercase",
            }}>
                {">"}  INITIATING_SYSTEM_BOOT...
            </p>
            <p style={{
                color: "#00ffcc",
                fontSize: 13,
                letterSpacing: "0.15em",
                fontWeight: 600,
                textShadow: "0 0 8px rgba(0, 255, 204, 0.5)",
            }}>
                {">"}  LOADING_ASSETS: {progress.toFixed(0)}%
            </p>

            {/* Scanline overlay */}
            <div style={{
                position: "absolute", inset: 0,
                background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 204, 0.015) 2px, rgba(0, 255, 204, 0.015) 4px)",
                pointerEvents: "none",
            }} />

            <style>{`
                @keyframes cyberSpin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   DIEGETIC TOOLTIP — glowing amber monospace text floating above objects
   ═══════════════════════════════════════════════════════════════════════════ */
function DiegeticTooltip({
    text,
    visible,
    position,
}: {
    text: string;
    visible: boolean;
    position: [number, number, number];
}) {
    const ref = useRef<THREE.Group>(null);
    const matRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame(({ clock }) => {
        if (!ref.current || !matRef.current) return;
        const t = clock.getElapsedTime();
        ref.current.position.y = position[1] + Math.sin(t * 2) * 0.03;
        matRef.current.opacity = visible ? 0.75 + Math.sin(t * 3) * 0.25 : 0;
        const target = visible ? 1 : 0;
        ref.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
    });

    return (
        <group ref={ref} position={position} scale={0}>
            <Text fontSize={0.12} anchorX="center" anchorY="middle" letterSpacing={0.08}>
                {`> ${text}_`}
                <meshBasicMaterial ref={matRef} color="#ffb300" transparent opacity={0} toneMapped={false} />
            </Text>
            <mesh position={[0, -0.1, 0]}>
                <planeGeometry args={[text.length * 0.08 + 0.3, 0.008]} />
                <meshBasicMaterial color="#ffb300" transparent opacity={0.5} toneMapped={false} />
            </mesh>
        </group>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INTERACTIVE DESK OBJECT — hover/click logic wrapper with cursor fix
   ═══════════════════════════════════════════════════════════════════════════ */
function InteractiveObject({
    children,
    position,
    tooltipText,
    tooltipOffset = [0, 0.6, 0],
    onAction,
}: {
    children: React.ReactNode;
    position: [number, number, number];
    tooltipText: string;
    tooltipOffset?: [number, number, number];
    onAction: () => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (!groupRef.current) return;
        const s = hovered ? 1.08 : 1;
        groupRef.current.scale.lerp(new THREE.Vector3(s, s, s), 0.1);
    });

    const handlePointerOver = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.setProperty('cursor', 'pointer', 'important');
    }, []);

    const handlePointerOut = useCallback(() => {
        setHovered(false);
        document.body.style.setProperty('cursor', 'default', 'important');
    }, []);

    const handleClick = useCallback(
        (e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            onAction();
        },
        [onAction]
    );

    return (
        <group ref={groupRef} position={position}>
            <group
                onClick={handleClick}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                {children}
            </group>
            <DiegeticTooltip text={tooltipText} visible={hovered} position={tooltipOffset} />
        </group>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MACBOOK GLB MODEL — /models/mac.glb + emissive code lines overlay
   ═══════════════════════════════════════════════════════════════════════════ */
function MacBookGLB({ hovered }: { hovered?: boolean }) {
    const { scene } = useGLTF("/models/mac.glb");
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useFrame(() => {
        clonedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (mat && mat.emissive) {
                    mat.emissiveIntensity = THREE.MathUtils.lerp(
                        mat.emissiveIntensity, hovered ? 0.35 : 0, 0.08
                    );
                    if (hovered) mat.emissive.set("#00ffcc");
                }
            }
        });
    });

    return (
        <group rotation={[0, -0.3, 0]}>
            <primitive object={clonedScene} scale={3} position={[0, 0.08, 0]} castShadow />
            {/* ── Emissive code-lines overlay on screen area ── */}
            <group position={[0, 0.5, -0.25]} rotation={[-0.28, 0, 0]}>
                {[0.1, 0.065, 0.03, -0.005, -0.04, -0.075].map((y, i) => (
                    <mesh key={i} position={[0, y, 0.001]}>
                        <planeGeometry args={[0.25 + (i % 3) * 0.06, 0.02]} />
                        <meshBasicMaterial
                            color={i % 3 === 0 ? "#00ff41" : i % 3 === 1 ? "#00ccff" : "#b080ff"}
                            transparent
                            opacity={hovered ? 0.85 : 0.5}
                            toneMapped={false}
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
}

useGLTF.preload("/models/mac.glb");

/* ═══════════════════════════════════════════════════════════════════════════
   PRIMITIVE NOTEBOOK — procedurally generated open notebook (restored)
   ═══════════════════════════════════════════════════════════════════════════ */
function NotebookModel({ hovered }: { hovered?: boolean }) {
    const emissiveIntensity = hovered ? 0.5 : 0;
    return (
        <group rotation={[0, -0.3, 0]}>
            {/* Left page */}
            <RoundedBox args={[0.6, 0.02, 0.8]} radius={0.01} position={[-0.32, 0.09, 0]} castShadow>
                <meshStandardMaterial
                    color="#f5f0e8"
                    roughness={0.9}
                    emissive="#ffb300"
                    emissiveIntensity={emissiveIntensity}
                />
            </RoundedBox>
            {/* Right page */}
            <RoundedBox args={[0.6, 0.02, 0.8]} radius={0.01} position={[0.32, 0.09, 0]} castShadow>
                <meshStandardMaterial
                    color="#f5f0e8"
                    roughness={0.9}
                    emissive="#ffb300"
                    emissiveIntensity={emissiveIntensity}
                />
            </RoundedBox>
            {/* Spine */}
            <mesh position={[0, 0.085, 0]} castShadow>
                <boxGeometry args={[0.04, 0.03, 0.82]} />
                <meshStandardMaterial color="#8b4513" roughness={0.7} />
            </mesh>
            {/* Diagram lines on left page */}
            {[-0.15, -0.05, 0.05, 0.15].map((z, i) => (
                <mesh key={`l${i}`} position={[-0.32, 0.101, z]}>
                    <planeGeometry args={[0.45, 0.008]} />
                    <meshBasicMaterial color="#333" transparent opacity={0.4} />
                </mesh>
            ))}
            {/* Blue circle diagram on right page */}
            <mesh position={[0.32, 0.101, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.08, 0.1, 32]} />
                <meshBasicMaterial color="#2563eb" transparent opacity={0.6} />
            </mesh>
            {/* Red hexagon diagram on right page */}
            <mesh position={[0.32, 0.101, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.05, 0.065, 6]} />
                <meshBasicMaterial color="#dc2626" transparent opacity={0.5} />
            </mesh>
        </group>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   IPHONE GLB MODEL — /models/iphone.glb (between notebook and PCB)
   ═══════════════════════════════════════════════════════════════════════════ */
function IPhoneGLB({ hovered }: { hovered?: boolean }) {
    const { scene } = useGLTF("/models/iphone.glb");
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useFrame(() => {
        clonedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (mat && mat.emissive) {
                    mat.emissiveIntensity = THREE.MathUtils.lerp(
                        mat.emissiveIntensity, hovered ? 0.35 : 0, 0.08
                    );
                    if (hovered) mat.emissive.set("#00ffcc");
                }
            }
        });
    });

    return (
        <group>
            <primitive object={clonedScene} scale={0.007} position={[0, 0.1, -0.5]} rotation={[-1.5, 0, 0]} castShadow receiveShadow />
        </group>
    );
}

useGLTF.preload("/models/iphone.glb");

/* ═══════════════════════════════════════════════════════════════════════════
   PCB GLB MODEL — /models/pcb.glb (right side)
   ═══════════════════════════════════════════════════════════════════════════ */
function PcbModel({ hovered }: { hovered?: boolean }) {
    const { scene } = useGLTF("/models/pcb.glb");
    const clonedScene = useMemo(() => scene.clone(), [scene]);

    useFrame(() => {
        clonedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                if (mat && mat.emissive) {
                    mat.emissiveIntensity = THREE.MathUtils.lerp(
                        mat.emissiveIntensity, hovered ? 0.4 : 0, 0.08
                    );
                    if (hovered) mat.emissive.set("#00ffcc");
                }
            }
        });
    });

    return (
        <Float speed={2} rotationIntensity={0.08} floatIntensity={0.15}>
            <group>
                <primitive
                    object={clonedScene}
                    scale={1}
                    position={[0.75, 2, -3]}
                    rotation={[0, 0.5, 1.5]}
                    castShadow
                />
                {/* Orange accent light to illuminate PCB details */}
                <pointLight
                    position={[0, 0.3, 0]}
                    intensity={0.5}
                    distance={2}
                    color="#ff8800"
                />
            </group>
        </Float>
    );
}

useGLTF.preload("/models/pcb.glb");

/* ═══════════════════════════════════════════════════════════════════════════
   REAL DESK — /models table from supabase (or fallback primitive)
   ═══════════════════════════════════════════════════════════════════════════ */
const DESK_URL =
    "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/table-wood/model.gltf";

function RealDesk() {
    const { scene } = useGLTF(DESK_URL);
    return <primitive object={scene} position={[0, -1, 0]} scale={2} receiveShadow />;
}

function DeskFallback() {
    return (
        <group>
            <mesh position={[0, 0, 0]} receiveShadow>
                <boxGeometry args={[6, 0.15, 3]} />
                <meshStandardMaterial color="#3a2518" roughness={0.75} metalness={0.05} />
            </mesh>
            <mesh position={[0, -0.01, 1.505]}>
                <boxGeometry args={[6.02, 0.08, 0.02]} />
                <meshStandardMaterial color="#666" metalness={0.9} roughness={0.2} />
            </mesh>
            {([[-2.7, -0.9, 1.2], [2.7, -0.9, 1.2], [-2.7, -0.9, -1.2], [2.7, -0.9, -1.2]] as [number, number, number][]).map((pos, i) => (
                <mesh key={i} position={pos}>
                    <cylinderGeometry args={[0.06, 0.06, 1.65, 8]} />
                    <meshStandardMaterial color="#2a1a0e" roughness={0.8} />
                </mesh>
            ))}
        </group>
    );
}

useGLTF.preload(DESK_URL);

/* ── ErrorBoundary for desk GLTF ── */
class DeskErrorBoundary extends React.Component<
    { children: React.ReactNode; fallback: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   LIGHTNING STORM — dramatic directional flashes from the distant sky
   ═══════════════════════════════════════════════════════════════════════════ */
function LightningStorm() {
    const lightRef = useRef<THREE.DirectionalLight>(null);
    const flashColor = useRef(new THREE.Color("#00e6ff"));

    useFrame(() => {
        if (!lightRef.current) return;
        if (Math.random() > 0.988) {
            flashColor.current.set(Math.random() > 0.5 ? "#a855f7" : "#00e6ff");
            lightRef.current.color.copy(flashColor.current);
            lightRef.current.intensity = 4 + Math.random() * 6;
        } else {
            lightRef.current.intensity = THREE.MathUtils.lerp(lightRef.current.intensity, 0, 0.12);
        }
    });

    return (
        <directionalLight
            ref={lightRef}
            position={[0, 30, -50]}
            intensity={0}
        />
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PENTHOUSE ROOM — structural pillars, ceiling, floor (NO glass pane)
   ═══════════════════════════════════════════════════════════════════════════ */
function PenthouseRoom() {
    return (
        <group>
            {/* ── Floor (dark polished concrete) ── */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]} receiveShadow>
                <planeGeometry args={[16, 16]} />
                <meshStandardMaterial color="#080810" roughness={0.5} metalness={0.35} />
            </mesh>

            {/* ── Neon grid lines on the floor ── */}
            {Array.from({ length: 21 }, (_, i) => i - 10).map((offset) => (
                <React.Fragment key={offset}>
                    <mesh position={[offset, -1.749, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[0.005, 20]} />
                        <meshBasicMaterial color="#00ffcc" transparent opacity={0.04} toneMapped={false} />
                    </mesh>
                    <mesh position={[0, -1.749, offset]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
                        <planeGeometry args={[0.005, 20]} />
                        <meshBasicMaterial color="#00ffcc" transparent opacity={0.04} toneMapped={false} />
                    </mesh>
                </React.Fragment>
            ))}

            {/* ── Ceiling ── */}
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, -2]}>
                <planeGeometry args={[16, 16]} />
                <meshStandardMaterial color="#050508" roughness={0.95} metalness={0.1} />
            </mesh>

            {/* ── Left pillar ── */}
            <mesh position={[-6.5, 2.1, -3]}>
                <boxGeometry args={[0.6, 8, 0.6]} />
                <meshStandardMaterial color="#111118" roughness={0.25} metalness={0.95} />
            </mesh>
            <mesh position={[-6.2, 2.1, -2.69]}>
                <boxGeometry args={[0.02, 8, 0.02]} />
                <meshBasicMaterial color="#00ffcc" toneMapped={false} />
            </mesh>

            {/* ── Right pillar ── */}
            <mesh position={[6.5, 2.1, -3]}>
                <boxGeometry args={[0.6, 8, 0.6]} />
                <meshStandardMaterial color="#111118" roughness={0.25} metalness={0.95} />
            </mesh>
            <mesh position={[6.2, 2.1, -2.69]}>
                <boxGeometry args={[0.02, 8, 0.02]} />
                <meshBasicMaterial color="#ff0066" toneMapped={false} />
            </mesh>

            {/* ── Additional center pillars for depth ── */}
            <mesh position={[-3, 2.1, -4.8]}>
                <boxGeometry args={[0.15, 8, 0.15]} />
                <meshStandardMaterial color="#111118" roughness={0.25} metalness={0.95} />
            </mesh>
            <mesh position={[3, 2.1, -4.8]}>
                <boxGeometry args={[0.15, 8, 0.15]} />
                <meshStandardMaterial color="#111118" roughness={0.25} metalness={0.95} />
            </mesh>

            {/* ── Side walls (left) ── */}
            <mesh position={[-7, 2.1, 2]} rotation={[0, Math.PI / 2, 0]}>
                <planeGeometry args={[14, 8]} />
                <meshStandardMaterial color="#08080c" roughness={0.8} metalness={0.4} side={THREE.DoubleSide} />
            </mesh>

            {/* ── Side walls (right) ── */}
            <mesh position={[7, 2.1, 2]} rotation={[0, -Math.PI / 2, 0]}>
                <planeGeometry args={[14, 8]} />
                <meshStandardMaterial color="#08080c" roughness={0.8} metalness={0.4} side={THREE.DoubleSide} />
            </mesh>

            {/* ── Window frame (top beam) ── */}
            <mesh position={[0, 6.1, -5]}>
                <boxGeometry args={[14, 0.2, 0.15]} />
                <meshStandardMaterial color="#1a1a22" roughness={0.2} metalness={0.9} />
            </mesh>
            <mesh position={[0, 6.2, -4.92]}>
                <boxGeometry args={[13.6, 0.04, 0.02]} />
                <meshBasicMaterial color="#00ffcc" toneMapped={false} />
            </mesh>

            {/* ── Window frame (bottom sill) ── */}
            <mesh position={[0, -1.75, -5]}>
                <boxGeometry args={[14, 0.3, 0.2]} />
                <meshStandardMaterial color="#1a1a22" roughness={0.2} metalness={0.9} />
            </mesh>

            {/* ── Window vertical dividers (thin structural bars) ── */}
            {[-6.5, -3, 0, 3, 6.5].map((x, i) => (
                <mesh key={`wd-${i}`} position={[x, 2.1, -4.97]}>
                    <boxGeometry args={[0.06, 8, 0.06]} />
                    <meshStandardMaterial color="#1a1a22" roughness={0.3} metalness={0.9} />
                </mesh>
            ))}

            {/* ── Ceiling neon strip accents ── */}
            <mesh position={[-3, 5.98, 0]}>
                <boxGeometry args={[0.03, 0.03, 10]} />
                <meshBasicMaterial color="#00ffcc" transparent opacity={0.6} toneMapped={false} />
            </mesh>
            <mesh position={[3, 5.98, 0]}>
                <boxGeometry args={[0.03, 0.03, 10]} />
                <meshBasicMaterial color="#ff0066" transparent opacity={0.6} toneMapped={false} />
            </mesh>
        </group>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   FAR-OFF BUILDINGS — 3D depth beyond the HDRI background
   ═══════════════════════════════════════════════════════════════════════════ */
const FAR_BUILDINGS = Array.from({ length: 30 }, (_, i) => {
    const angle = (i / 30) * Math.PI * 1.2 - Math.PI * 0.6; // spread across back
    const dist = 25 + Math.abs(Math.sin(i * 3.7)) * 30;
    return {
        x: Math.sin(angle) * dist,
        z: -15 - Math.cos(angle) * dist * 0.6,
        height: 40 + Math.abs(Math.sin(i * 2.3)) * 60,
        width: 2 + Math.abs(Math.cos(i * 4.1)) * 5,
        depth: 2 + Math.abs(Math.sin(i * 5.7)) * 5,
        neon: ["#00ffcc", "#ff0066", "#a855f7", "#00e6ff", "#ffb300", "#00ff41"][i % 6],
        winRows: 8 + Math.floor(Math.abs(Math.sin(i * 1.3)) * 16),
    };
});

function FarOffBuildings() {
    return (
        <group>
            {FAR_BUILDINGS.map((b, i) => (
                <group key={`fb-${i}`} position={[b.x, b.height / 2 - 30, b.z]}>
                    {/* Dark building body */}
                    <mesh>
                        <boxGeometry args={[b.width, b.height, b.depth]} />
                        <meshStandardMaterial color="#060609" roughness={0.8} metalness={0.7} />
                    </mesh>

                    {/* Faint wireframe */}
                    <mesh>
                        <boxGeometry args={[b.width * 1.003, b.height * 1.003, b.depth * 1.003]} />
                        <meshBasicMaterial color={b.neon} wireframe transparent opacity={0.04} />
                    </mesh>

                    {/* Neon crown */}
                    <mesh position={[0, b.height / 2 - 0.05, 0]}>
                        <boxGeometry args={[b.width + 0.15, 0.08, b.depth + 0.15]} />
                        <meshBasicMaterial color={b.neon} transparent opacity={0.85} toneMapped={false} />
                    </mesh>

                    {/* Scattered window rows — emissive planes on front face */}
                    {Array.from({ length: b.winRows }, (_, r) => {
                        const wy = -b.height / 2 + (r + 1) * (b.height / (b.winRows + 1));
                        // Randomly vary window strip width for realism
                        const wWidth = b.width * (0.3 + Math.abs(Math.sin(i * 3 + r * 2)) * 0.5);
                        return (
                            <mesh key={`fw-${i}-${r}`} position={[0, wy, b.depth / 2 + 0.02]}>
                                <planeGeometry args={[wWidth, 0.15]} />
                                <meshBasicMaterial
                                    color={r % 4 === 0 ? "#00ffcc" : r % 4 === 1 ? "#ff0066" : r % 4 === 2 ? "#a855f7" : "#ffb300"}
                                    transparent
                                    opacity={0.15 + Math.abs(Math.sin(i + r)) * 0.45}
                                    toneMapped={false}
                                />
                            </mesh>
                        );
                    })}

                    {/* Side neon strip */}
                    <mesh position={[b.width / 2 + 0.02, 0, 0]}>
                        <planeGeometry args={[0.06, b.height * 0.7]} />
                        <meshBasicMaterial color={b.neon} transparent opacity={0.4} toneMapped={false} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   RAIN PARTICLES — subtle vertical streaks outside the window
   ═══════════════════════════════════════════════════════════════════════════ */
function RainEffect() {
    const rainRef = useRef<THREE.Points>(null);
    const count = 1200;

    const positions = useMemo(() => {
        const arr = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            arr[i * 3]     = (Math.random() - 0.5) * 40;
            arr[i * 3 + 1] = Math.random() * 25 - 2;
            arr[i * 3 + 2] = -6 - Math.random() * 45;
        }
        return arr;
    }, []);

    useFrame(() => {
        if (!rainRef.current) return;
        const pos = rainRef.current.geometry.attributes.position;
        for (let i = 0; i < count; i++) {
            let y = (pos as THREE.BufferAttribute).getY(i);
            y -= 0.18;
            if (y < -3) y = 22;
            (pos as THREE.BufferAttribute).setY(i, y);
        }
        pos.needsUpdate = true;
    });

    const geom = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        return g;
    }, [positions]);

    return (
        <points ref={rainRef} geometry={geom}>
            <pointsMaterial
                color="#6699cc"
                size={0.035}
                transparent
                opacity={0.35}
                sizeAttenuation
            />
        </points>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCENE — assembles everything inside the Canvas
   ═══════════════════════════════════════════════════════════════════════════ */
function Scene() {
    const router = useRouter();

    return (
        <>
            {/* ── 360° Environment (HDRI preset background) ── */}
            <Environment preset="night" background backgroundBlurriness={0.6} />
            <fog attach="fog" args={["#020208", 10, 60]} />
            <Stars radius={80} depth={50} count={4000} factor={3} saturation={0.2} fade speed={0.8} />

            {/* ── Storm & Rain ── */}
            <LightningStorm />
            <RainEffect />

            {/* ── Penthouse Interior (open window — no glass) ── */}
            <PenthouseRoom />

            {/* ── Far-off 3D Buildings for depth ── */}
            <FarOffBuildings />

            {/* ── Core Lighting (reduced ambient for moody cyberpunk) ── */}
            <ambientLight intensity={0.8} color="#c8d0ff" />
            <spotLight
                position={[0, 5.8, 1]}
                angle={0.65}
                penumbra={0.5}
                intensity={2.2}
                color="#eef8ff"
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
            />
            <pointLight position={[-3, 4, 3]} intensity={0.6} color="#ffffff" />
            <pointLight position={[3, 3, -2]} intensity={0.4} color="#3366ff" />
            <pointLight position={[0, 2, 4]} intensity={0.5} color="#ff6600" />

            {/* ── City neon reflections on desk surfaces ── */}
            <pointLight position={[-5, 1, -4]} intensity={0.6} distance={12} color="#00ffcc" />
            <pointLight position={[5, 1, -4]} intensity={0.6} distance={12} color="#ff0066" />
            <pointLight position={[0, 0.5, -5]} intensity={0.4} distance={10} color="#a855f7" />
            <pointLight position={[-6, 4, -3]} intensity={0.35} distance={10} color="#00e6ff" />
            <pointLight position={[6, 4, -3]} intensity={0.35} distance={10} color="#ff0066" />



            {/* ── Desk (remote GLTF with primitive fallback) ── */}
            <DeskErrorBoundary fallback={<DeskFallback />}>
                <Suspense fallback={<DeskFallback />}>
                    <RealDesk />
                </Suspense>
            </DeskErrorBoundary>

            {/* ── ContactShadows for realistic object grounding ── */}
            <ContactShadows
                position={[0, -0.09, 0]}
                opacity={0.8}
                scale={15}
                blur={2}
                far={3}
            />

            {/* ── MacBook (Left side) ── */}
            <InteractiveObject
                position={[-1.8, 0.08, -0.2]}
                tooltipText="GITHUB"
                tooltipOffset={[0, 0.9, 0]}
                onAction={() => window.open("https://github.com/SuhanArda", "_blank")}
            >
                <MacBookGLB />
            </InteractiveObject>

            {/* ── Primitive Notebook (Center) ── */}
            <InteractiveObject
                position={[0.3, 0.01, 0.2]}
                tooltipText="CV"
                tooltipOffset={[0, 0.7, 0]}
                onAction={() => window.open("/cv.pdf", "_blank")}
            >
                <NotebookModel />
            </InteractiveObject>

            {/* ── iPhone (Center-Right) ── */}
            <InteractiveObject
                position={[1.3, 0.01, 0.1]}
                tooltipText="LINKEDIN"
                tooltipOffset={[0, 0.8, 0]}
                onAction={() => window.open("https://linkedin.com/in/suhan-arda-\u00f6ner", "_blank")}
            >
                <IPhoneGLB />
            </InteractiveObject>

            {/* ── PCB Board (Right side) ── */}
            <InteractiveObject
                position={[2, 0.01, -0.1]}
                tooltipText="PROJECTS"
                tooltipOffset={[0, 0.8, 0]}
                onAction={() => router.push("/projects")}
            >
                <PcbModel />
            </InteractiveObject>

            {/* ── Camera Controls ── */}
            <OrbitControls
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.3}
                minAzimuthAngle={-Math.PI / 4}
                maxAzimuthAngle={Math.PI / 4}
                minDistance={3}
                maxDistance={10}
                enablePan={false}
                target={[0, 0.2, 0]}
            />

            {/* ── Post-processing ── */}
            <EffectComposer>
                <Bloom
                    intensity={0.4}
                    luminanceThreshold={0.8}
                    luminanceSmoothing={0.5}
                    mipmapBlur
                />
            </EffectComposer>
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE — full-screen canvas + HUD overlay + cursor fix
   ═══════════════════════════════════════════════════════════════════════════ */
export default function CyberDeskPage() {
    /* Fix 3: force OS cursor visible globally */
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            * { cursor: default !important; }
            canvas { cursor: default !important; }
        `;
        document.head.appendChild(style);

        return () => { document.head.removeChild(style); };
    }, []);

    return (
        <div className="h-screen w-screen relative bg-[#0a0a0f] text-white overflow-hidden">
            {/* ═══ R3F Canvas ═══ */}
            {/* ═══ Cyber Boot Loader (HTML overlay — sibling of Canvas) ═══ */}
            <CyberBootLoader />

            {/* ═══ R3F Canvas ═══ */}
            <Canvas
                camera={{ position: [0, 3, 5], fov: 50 }}
                gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
                style={{ position: "absolute", inset: 0 }}
            >
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>

            {/* ═══ HUD: Back Button ═══ */}
            <div className="absolute top-6 left-6" style={{ zIndex: 50 }}>
                <Link
                    href="/"
                    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-mono text-sm transition-all duration-300"
                    style={{
                        background: "rgba(127, 29, 29, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#f87171",
                        boxShadow: "0 0 12px rgba(239, 68, 68, 0.1)",
                        backdropFilter: "blur(12px)",
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
            </div>

            {/* ═══ Bottom Status Bar ═══ */}
            <div
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] px-4 py-1.5 rounded-full"
                style={{
                    zIndex: 50,
                    color: "rgba(0, 255, 204, 0.4)",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(0, 255, 204, 0.08)",
                    backdropFilter: "blur(12px)",
                }}
            >
                CYBER_DESK_ENGINE v1.0 • DIEGETIC_UI_ACTIVE • INTERACT_TO_NAVIGATE
            </div>
        </div>
    );
}
