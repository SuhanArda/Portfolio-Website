"use client";

import React, { useEffect, useRef } from "react";
import Webcam from "react-webcam";

declare global {
    interface Window {
        Hands: any;
        Camera: any;
        drawConnectors: any;
        drawLandmarks: any;
        HAND_CONNECTIONS: any;
    }
}

interface HandTrackingBridgeProps {
    onHandCountChange: (count: number) => void;
    onFpsChange: (fps: number) => void;
    onHandLandmarksChange: (landmarks: { x: number; y: number }[][]) => void;
    onPinchStatesChange: (pinches: boolean[]) => void;
}

export default function HandTrackingBridge({
    onHandCountChange,
    onFpsChange,
    onHandLandmarksChange,
    onPinchStatesChange,
}: HandTrackingBridgeProps) {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handsRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const fpsRef = useRef(0);
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(Date.now());

    // ── Scene Normalization ──────────────────────────────────────────────
    const normalizeToScene = (x: number, y: number) => ({
        x: (x - 0.5) * 8,
        y: -(y - 0.5) * 6,
    });

    // ── Pinch Detection (raw MediaPipe indices: thumb=4, index=8) ────────
    const isPinching = (landmarks: any): boolean => {
        const thumb = landmarks?.[4];
        const index = landmarks?.[8];
        if (!thumb || !index) return false;
        const dist = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) + Math.pow(thumb.y - index.y, 2)
        );
        return dist < 0.06;
    };

    // ── MediaPipe Initialization ─────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const initializeMediaPipe = async () => {
            try {
                // Load CDN scripts (MediaPipe npm packages have no ES exports)
                const loadScript = (src: string) =>
                    new Promise<void>((resolve, reject) => {
                        if (document.querySelector(`script[src="${src}"]`)) {
                            resolve();
                            return;
                        }
                        const script = document.createElement("script");
                        script.src = src;
                        script.crossOrigin = "anonymous";
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error(`Failed to load ${src}`));
                        document.head.appendChild(script);
                    });

                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
                await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");

                // ── Wait for ALL globals to be ready ──
                const waitForGlobal = async (name: string, maxAttempts = 50) => {
                    let attempts = 0;
                    while (!(window as any)[name] && attempts < maxAttempts) {
                        await new Promise((r) => setTimeout(r, 100));
                        attempts++;
                    }
                    if (!(window as any)[name]) {
                        throw new Error(`${name} failed to initialize after ${maxAttempts} attempts`);
                    }
                    return (window as any)[name];
                };

                const HandsConstructor = await waitForGlobal("Hands");
                const CameraConstructor = await waitForGlobal("Camera");
                await waitForGlobal("drawConnectors");
                await waitForGlobal("HAND_CONNECTIONS");

                if (cancelled) return;

                const hands = new HandsConstructor({
                    locateFile: (file: string) =>
                        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
                });

                hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                hands.onResults(onResults);

                // Wait for webcam video element
                let webcamAttempts = 0;
                while (!webcamRef.current?.video && webcamAttempts < 100) {
                    await new Promise((r) => setTimeout(r, 50));
                    webcamAttempts++;
                }
                if (!webcamRef.current?.video) throw new Error("Webcam not ready");
                if (cancelled) return;

                const camera = new CameraConstructor(webcamRef.current.video, {
                    onFrame: async () => {
                        if (webcamRef.current?.video) {
                            await hands.send({ image: webcamRef.current.video });
                        }
                    },
                    width: 1280,
                    height: 720,
                });

                cameraRef.current = camera;
                camera.start();
                handsRef.current = hands;

                console.log("[HandTrackingBridge] MediaPipe initialized successfully");
            } catch (error) {
                console.error("[HandTrackingBridge] Error initializing MediaPipe:", error);
            }
        };

        initializeMediaPipe();

        return () => {
            cancelled = true;
            if (cameraRef.current) cameraRef.current.stop();
            if (handsRef.current) handsRef.current.close();
        };
    }, []);

    // ── onResults Callback ───────────────────────────────────────────────
    const onResults = (results: any) => {
        // FPS
        frameCountRef.current++;
        const now = Date.now();
        if (now - lastTimeRef.current >= 1000) {
            fpsRef.current = frameCountRef.current;
            if (typeof onFpsChange === "function") onFpsChange(fpsRef.current);
            frameCountRef.current = 0;
            lastTimeRef.current = now;
        }

        // Canvas drawing
        const canvasElement = canvasRef.current;
        if (!canvasElement) return;
        const ctx = canvasElement.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            if (typeof onHandCountChange === "function")
                onHandCountChange(results.multiHandLandmarks.length);

            const KEY_INDICES = [0, 4, 8, 12, 16, 20];
            const allHands: { x: number; y: number }[][] = [];
            const pinchStates: boolean[] = [];

            results.multiHandLandmarks.forEach((landmarks: any) => {
                // Extract & normalize 6 key positions for physics
                const handPos = KEY_INDICES.map((idx) => {
                    const lm = landmarks?.[idx];
                    if (!lm) return { x: 100, y: 100 };
                    return normalizeToScene(lm.x, lm.y);
                });
                allHands.push(handPos);

                // Pinch detection per hand
                pinchStates.push(isPinching(landmarks));

                // Draw neon green skeleton connectors
                if (window.drawConnectors && window.HAND_CONNECTIONS) {
                    window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
                        color: "#00ff41",
                        lineWidth: 2,
                    });
                }
                // Draw amber landmark dots
                if (window.drawLandmarks) {
                    window.drawLandmarks(ctx, landmarks, {
                        color: "#fbbf24",
                        lineWidth: 1,
                        radius: 3,
                    });
                }
            });

            if (typeof onHandLandmarksChange === "function") onHandLandmarksChange(allHands);
            if (typeof onPinchStatesChange === "function") onPinchStatesChange(pinchStates);
        } else {
            if (typeof onHandCountChange === "function") onHandCountChange(0);
            if (typeof onHandLandmarksChange === "function") onHandLandmarksChange([]);
            if (typeof onPinchStatesChange === "function") onPinchStatesChange([]);
        }
    };

    // ── Render ───────────────────────────────────────────────────────────
    return (
        <>
            <Webcam
                ref={webcamRef}
                mirrored={false}
                videoConstraints={{ facingMode: "user" }}
                onUserMediaError={(err) => console.error("Camera Access Denied:", err)}
                className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                style={{ display: "none" }}
            />
            <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ mixBlendMode: "screen", zIndex: 20 }}
            />
        </>
    );
}