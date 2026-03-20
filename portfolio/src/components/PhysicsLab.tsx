"use client";

import React, { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, RigidBody, BallCollider, CuboidCollider } from "@react-three/rapier";
import * as THREE from "three";

// ─── Types ───────────────────────────────────────────────────────────────────
interface PhysicsLabProps {
    gravityEnabled: boolean;
    handLandmarks: { x: number; y: number }[][];
    isGrabbing: boolean;
    grabPosition: { x: number; y: number } | null;
    targetScale: number;
}

// ─── Viewport-Synced Boundary Walls ──────────────────────────────────────────
// Uses useThree().viewport for real camera-projected world-space dimensions.
// Walls auto-update on browser resize because useThree is reactive.
function BoundaryWalls() {
    const { viewport } = useThree();
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    const wallThickness = 0.5; // thick enough to never be tunneled through
    const wallDepth = 2;       // depth along Z to catch any stray movement

    return (
        <>
            {/* Top Wall */}
            <RigidBody type="fixed" position={[0, halfH + wallThickness / 2, 0]} restitution={0.8} friction={0.3}>
                <CuboidCollider args={[halfW + wallThickness, wallThickness / 2, wallDepth]} />
            </RigidBody>
            {/* Bottom Wall */}
            <RigidBody type="fixed" position={[0, -(halfH + wallThickness / 2), 0]} restitution={0.8} friction={0.3}>
                <CuboidCollider args={[halfW + wallThickness, wallThickness / 2, wallDepth]} />
            </RigidBody>
            {/* Left Wall */}
            <RigidBody type="fixed" position={[-(halfW + wallThickness / 2), 0, 0]} restitution={0.8} friction={0.3}>
                <CuboidCollider args={[wallThickness / 2, halfH + wallThickness, wallDepth]} />
            </RigidBody>
            {/* Right Wall */}
            <RigidBody type="fixed" position={[halfW + wallThickness / 2, 0, 0]} restitution={0.8} friction={0.3}>
                <CuboidCollider args={[wallThickness / 2, halfH + wallThickness, wallDepth]} />
            </RigidBody>
            {/* Front Wall (Z = 1) — prevents sphere from flying toward camera */}
            <RigidBody type="fixed" position={[0, 0, 1]} restitution={0.5}>
                <CuboidCollider args={[halfW + wallThickness, halfH + wallThickness, wallThickness / 2]} />
            </RigidBody>
            {/* Back Wall (Z = -1) — prevents sphere from flying away */}
            <RigidBody type="fixed" position={[0, 0, -1]} restitution={0.5}>
                <CuboidCollider args={[halfW + wallThickness, halfH + wallThickness, wallThickness / 2]} />
            </RigidBody>
        </>
    );
}

// ─── Neural Sphere (grab + scale + Z-locked) ────────────────────────────────
function NeuralSphere({
    isGrabbing,
    grabPosition,
    targetScale,
}: {
    isGrabbing: boolean;
    grabPosition: { x: number; y: number } | null;
    targetScale: number;
}) {
    const { viewport } = useThree();
    const meshRef = useRef<THREE.Mesh>(null);
    const bodyRef = useRef<any>(null);
    const currentScale = useRef(0.5);
    const currentPos = useRef(new THREE.Vector3(0, 0, 0));

    // Rescale from HandTrackingBridge [-4,4]×[-3,3] → viewport world-space
    const scaleX = viewport.width / 8;
    const scaleY = viewport.height / 6;

    useFrame(({ clock }) => {
        // Smooth scale LERP
        currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.08);

        if (meshRef.current) {
            meshRef.current.scale.setScalar(currentScale.current / 0.5);
            const pulse = 0.6 + Math.sin(clock.getElapsedTime() * 2) * 0.4;
            (meshRef.current.material as THREE.MeshPhysicalMaterial).emissiveIntensity = pulse;
        }

        // Grab: LERP toward pinch midpoint (viewport-scaled)
        if (isGrabbing && grabPosition && bodyRef.current) {
            const dest = new THREE.Vector3(
                grabPosition.x * scaleX,
                grabPosition.y * scaleY,
                0
            );
            currentPos.current.lerp(dest, 0.15);
            bodyRef.current.setNextKinematicTranslation({
                x: currentPos.current.x,
                y: currentPos.current.y,
                z: 0,
            });
        } else if (bodyRef.current) {
            const t = bodyRef.current.translation();
            if (t) currentPos.current.set(t.x, t.y, t.z);
        }
    });

    return (
        <RigidBody
            ref={bodyRef}
            type={isGrabbing ? "kinematicPosition" : "dynamic"}
            restitution={0.8}
            friction={0.1}
            linearDamping={1}
            angularDamping={0.5}
            position={[0, 0, 0]}
            enabledTranslations={[true, true, false] as any}
            enabledRotations={[false, false, true] as any}
        >
            <BallCollider args={[0.5]} />
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.5, 64, 64]} />
                <meshPhysicalMaterial
                    color="#fbbf24"
                    emissive="#fbbf24"
                    emissiveIntensity={0.8}
                    metalness={0.5}
                    roughness={0.15}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                />
            </mesh>
        </RigidBody>
    );
}

// ─── Invisible Finger Collider (LERP-driven kinematic) ───────────────────────
const OFF_SCREEN = new THREE.Vector3(100, 100, 0);

function InvisibleFingerCollider({ target }: { target: { x: number; y: number } | null }) {
    const bodyRef = useRef<any>(null);
    const currentPos = useRef(new THREE.Vector3(100, 100, 0));

    useFrame(() => {
        if (!bodyRef.current) return;

        if (!target || typeof target.x !== "number" || typeof target.y !== "number") {
            currentPos.current.lerp(OFF_SCREEN, 0.3);
        } else {
            const dest = new THREE.Vector3(target.x, target.y, 0);
            currentPos.current.lerp(dest, 0.25);
        }

        bodyRef.current.setNextKinematicTranslation({
            x: currentPos.current.x,
            y: currentPos.current.y,
            z: 0,
        });
    });

    return (
        <RigidBody
            ref={bodyRef}
            type="kinematicPosition"
            position={[100, 100, 0]}
        >
            <BallCollider args={[0.12]} />
        </RigidBody>
    );
}

// ─── Hand Collider Group (6 invisible points per hand) ───────────────────────
// Landmarks: [wrist(0), thumb(1), index(2), middle(3), ring(4), pinky(5)]
function HandColliderGroup({ landmarks }: { landmarks: { x: number; y: number }[] | null }) {
    return (
        <>
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <InvisibleFingerCollider key={i} target={landmarks?.[i] ?? null} />
            ))}
        </>
    );
}

// ─── Viewport-Aware Normalization Sync Layer ─────────────────────────────────
// HandTrackingBridge normalizes to [-4, 4] x [-3, 3] (8 × 6 world units).
// We need to rescale those coordinates to match the actual viewport dimensions.
function HandColliderGroupScaled({
    landmarks,
}: {
    landmarks: { x: number; y: number }[] | null;
}) {
    const { viewport } = useThree();
    // HandTrackingBridge outputs in range [-4, 4] x [-3, 3]
    // Actual viewport range is [-viewport.width/2, viewport.width/2] x [-viewport.height/2, viewport.height/2]
    const scaleX = viewport.width / 8;  // 8 = total HandTracking range width
    const scaleY = viewport.height / 6; // 6 = total HandTracking range height

    const scaled = landmarks
        ? landmarks.map((lm) => {
              if (!lm || typeof lm.x !== "number") return null;
              return { x: lm.x * scaleX, y: lm.y * scaleY };
          })
        : null;

    return (
        <>
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <InvisibleFingerCollider key={i} target={scaled?.[i] ?? null} />
            ))}
        </>
    );
}

// ─── Main PhysicsLab Export ──────────────────────────────────────────────────
export default function PhysicsLab({
    gravityEnabled,
    handLandmarks,
    isGrabbing,
    grabPosition,
    targetScale,
}: PhysicsLabProps) {
    const hand0 =
        handLandmarks && handLandmarks.length > 0 && Array.isArray(handLandmarks[0])
            ? handLandmarks[0]
            : null;
    const hand1 =
        handLandmarks && handLandmarks.length > 1 && Array.isArray(handLandmarks[1])
            ? handLandmarks[1]
            : null;

    return (
        <Canvas
            camera={{ position: [0, 0, 10], fov: 50 }}
            className="h-full w-full"
            style={{ position: "absolute", inset: 0, zIndex: 1 }}
        >
            <color attach="background" args={["#000000"]} />

            {/* Lighting */}
            <ambientLight intensity={0.3} />
            <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
            <pointLight position={[-3, 3, 3]} intensity={0.6} color="#00ff41" />
            <pointLight position={[3, -2, 2]} intensity={0.4} color="#fbbf24" />

            <Physics gravity={[0, gravityEnabled ? -9.81 : 0, 0]}>
                <BoundaryWalls />
                <NeuralSphere
                    isGrabbing={isGrabbing}
                    grabPosition={grabPosition}
                    targetScale={targetScale}
                />

                {/* 6 invisible kinematic colliders per hand, viewport-scaled */}
                <HandColliderGroupScaled landmarks={hand0} />
                <HandColliderGroupScaled landmarks={hand1} />
            </Physics>
        </Canvas>
    );
}