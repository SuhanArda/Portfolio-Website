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

const FILTER_MAP: Record<string, string> = {
    THERMAL_SCAN: "saturate(3) sepia(1) hue-rotate(-30deg) contrast(1.3)",
    MATRIX_VISION: "saturate(0.5) brightness(1.3) hue-rotate(70deg)",
    NOIR_MODE: "grayscale(1) contrast(1.6) brightness(1.1)",
    NEON_FLUX: "saturate(4) contrast(1.4) brightness(1.2)",
    GLITCH: "hue-rotate(180deg) contrast(2)",
    X_RAY: "invert(1) brightness(1.5) contrast(1.2)",
};

export const AVAILABLE_FILTERS = Object.keys(FILTER_MAP);

interface HandTrackingBridgeProps {
    onHandCountChange: (count: number) => void;
    onFpsChange: (fps: number) => void;
    onHandLandmarksChange: (landmarks: { x: number; y: number }[][]) => void;
    onPinchStatesChange: (pinches: boolean[]) => void;
    filterMode?: boolean;
    activeFilter?: string;
    onFrameDetectedChange?: (detected: boolean) => void;
}

export default function HandTrackingBridge({
    onHandCountChange,
    onFpsChange,
    onHandLandmarksChange,
    onPinchStatesChange,
    filterMode = false,
    activeFilter = "THERMAL_SCAN",
    onFrameDetectedChange,
}: HandTrackingBridgeProps) {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const filterCanvasRef = useRef<HTMLCanvasElement>(null);
    const handsRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const fpsRef = useRef(0);
    const frameCountRef = useRef(0);
    const lastTimeRef = useRef(Date.now());

    const filterModeRef = useRef(filterMode);
    const activeFilterRef = useRef(activeFilter);
    const onFrameDetectedChangeRef = useRef(onFrameDetectedChange);
    const prevFrameDetectedRef = useRef(false);

    useEffect(() => { filterModeRef.current = filterMode; }, [filterMode]);
    useEffect(() => { activeFilterRef.current = activeFilter; }, [activeFilter]);
    useEffect(() => { onFrameDetectedChangeRef.current = onFrameDetectedChange; }, [onFrameDetectedChange]);

    // ── Scene Normalization ──────────────────────────────────────────────
    const normalizeToScene = (x: number, y: number) => ({
        x: (0.5 - x) * 8,
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

    // ── Sort 4 points clockwise around their centroid ────────────────────
    const sortCornersCW = (points: { x: number; y: number }[]) => {
        const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
        const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
        return [...points].sort(
            (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
        );
    };

    // ── Quadrilateral area via Shoelace formula ──────────────────────────
    const quadArea = (pts: { x: number; y: number }[]) => {
        let area = 0;
        for (let i = 0; i < pts.length; i++) {
            const j = (i + 1) % pts.length;
            area += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
        }
        return Math.abs(area) / 2;
    };

    // ── Build and stroke a quad path helper ──────────────────────────────
    const traceQuad = (ctx: CanvasRenderingContext2D, corners: { x: number; y: number }[]) => {
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        for (let i = 1; i < corners.length; i++) ctx.lineTo(corners[i].x, corners[i].y);
        ctx.closePath();
    };

    // ── Reality Lens: clipped + filtered video inside hand frame ─────────
    const drawRealityLens = (results: any, W: number, H: number) => {
        const fCanvas = filterCanvasRef.current;
        if (!fCanvas) return;
        const fCtx = fCanvas.getContext("2d");
        if (!fCtx) return;
        fCtx.clearRect(0, 0, W, H);

        if (
            !filterModeRef.current ||
            !results.multiHandLandmarks ||
            results.multiHandLandmarks.length < 2
        ) {
            if (prevFrameDetectedRef.current) {
                prevFrameDetectedRef.current = false;
                onFrameDetectedChangeRef.current?.(false);
            }
            return;
        }

        const hand0 = results.multiHandLandmarks[0];
        const hand1 = results.multiHandLandmarks[1];

        const rawCorners = [
            { x: hand0[4].x * W, y: hand0[4].y * H },
            { x: hand0[8].x * W, y: hand0[8].y * H },
            { x: hand1[4].x * W, y: hand1[4].y * H },
            { x: hand1[8].x * W, y: hand1[8].y * H },
        ];

        const corners = sortCornersCW(rawCorners);
        const area = quadArea(corners);

        if (area < W * H * 0.015) {
            if (prevFrameDetectedRef.current) {
                prevFrameDetectedRef.current = false;
                onFrameDetectedChangeRef.current?.(false);
            }
            return;
        }

        if (!prevFrameDetectedRef.current) {
            prevFrameDetectedRef.current = true;
            onFrameDetectedChangeRef.current?.(true);
        }

        const video = webcamRef.current?.video;
        if (!video) return;

        const filterStr = FILTER_MAP[activeFilterRef.current] || FILTER_MAP.THERMAL_SCAN;

        // ── Clipped + filtered video ──
        fCtx.save();
        traceQuad(fCtx, corners);
        fCtx.clip();

        fCtx.filter = filterStr;
        fCtx.drawImage(video, 0, 0, W, H);
        fCtx.filter = "none";

        if (activeFilterRef.current === "MATRIX_VISION") {
            fCtx.fillStyle = "rgba(0, 255, 65, 0.04)";
            for (let y = 0; y < H; y += 3) {
                fCtx.fillRect(0, y, W, 1);
            }
        }

        if (activeFilterRef.current === "GLITCH") {
            fCtx.globalCompositeOperation = "lighter";
            fCtx.globalAlpha = 0.15;
            fCtx.filter = "hue-rotate(90deg) saturate(3)";
            fCtx.drawImage(video, 6, 0, W, H);
            fCtx.filter = "hue-rotate(-90deg) saturate(3)";
            fCtx.drawImage(video, -6, 0, W, H);
            fCtx.globalAlpha = 1;
            fCtx.globalCompositeOperation = "source-over";
            fCtx.filter = "none";
        }

        // ── Scanning line animation (inside clip) ──
        const time = Date.now() / 1000;
        const minY = Math.min(...corners.map((c) => c.y));
        const maxY = Math.max(...corners.map((c) => c.y));
        const frameH = maxY - minY;
        if (frameH > 10) {
            const scanProgress = ((time * 60) % frameH);
            const scanY = minY + scanProgress;
            const grad = fCtx.createLinearGradient(0, scanY - 3, 0, scanY + 3);
            grad.addColorStop(0, "rgba(0, 255, 65, 0)");
            grad.addColorStop(0.5, "rgba(0, 255, 65, 0.35)");
            grad.addColorStop(1, "rgba(0, 255, 65, 0)");
            fCtx.fillStyle = grad;
            fCtx.fillRect(0, scanY - 3, W, 6);
        }

        fCtx.restore();

        // ── Neon glow border (outside clip) ──
        const pulseAlpha = 0.6 + Math.sin(time * 3) * 0.4;

        fCtx.save();
        traceQuad(fCtx, corners);
        fCtx.strokeStyle = `rgba(0, 255, 65, ${pulseAlpha * 0.4})`;
        fCtx.lineWidth = 8;
        fCtx.shadowColor = "#00ff41";
        fCtx.shadowBlur = 40;
        fCtx.stroke();

        traceQuad(fCtx, corners);
        fCtx.strokeStyle = `rgba(0, 255, 65, ${pulseAlpha})`;
        fCtx.lineWidth = 2;
        fCtx.shadowBlur = 15;
        fCtx.stroke();
        fCtx.restore();

        // ── Corner brackets ──
        fCtx.save();
        fCtx.strokeStyle = "#fbbf24";
        fCtx.lineWidth = 2.5;
        fCtx.shadowColor = "#fbbf24";
        fCtx.shadowBlur = 10;
        const bracketLen = 18;
        corners.forEach((c, i) => {
            const prev = corners[(i + corners.length - 1) % corners.length];
            const next = corners[(i + 1) % corners.length];
            const dPrev = Math.hypot(prev.x - c.x, prev.y - c.y);
            const dNext = Math.hypot(next.x - c.x, next.y - c.y);
            if (dPrev < 1 || dNext < 1) return;
            fCtx.beginPath();
            fCtx.moveTo(c.x + ((prev.x - c.x) / dPrev) * bracketLen, c.y + ((prev.y - c.y) / dPrev) * bracketLen);
            fCtx.lineTo(c.x, c.y);
            fCtx.lineTo(c.x + ((next.x - c.x) / dNext) * bracketLen, c.y + ((next.y - c.y) / dNext) * bracketLen);
            fCtx.stroke();
        });
        fCtx.restore();

        // ── Filter label above frame (pre-flipped to counter CSS scaleX(-1)) ──
        const cx = corners.reduce((s, c) => s + c.x, 0) / 4;
        fCtx.save();
        fCtx.translate(cx, minY - 14);
        fCtx.scale(-1, 1);
        fCtx.font = "bold 12px monospace";
        fCtx.textAlign = "center";
        fCtx.fillStyle = `rgba(0, 255, 65, ${pulseAlpha})`;
        fCtx.shadowColor = "#00ff41";
        fCtx.shadowBlur = 8;
        fCtx.fillText(`[ ${activeFilterRef.current} ]`, 0, 0);
        fCtx.restore();
    };

    // ── MediaPipe Initialization ─────────────────────────────────────────
    useEffect(() => {
        let cancelled = false;

        const initializeMediaPipe = async () => {
            try {
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
        frameCountRef.current++;
        const now = Date.now();
        if (now - lastTimeRef.current >= 1000) {
            fpsRef.current = frameCountRef.current;
            if (typeof onFpsChange === "function") onFpsChange(fpsRef.current);
            frameCountRef.current = 0;
            lastTimeRef.current = now;
        }

        const canvasElement = canvasRef.current;
        if (!canvasElement) return;
        const ctx = canvasElement.getContext("2d");
        if (!ctx) return;
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        // Reality Lens rendering (on separate canvas)
        drawRealityLens(results, 1280, 720);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            if (typeof onHandCountChange === "function")
                onHandCountChange(results.multiHandLandmarks.length);

            const KEY_INDICES = [0, 4, 8, 12, 16, 20];
            const allHands: { x: number; y: number }[][] = [];
            const pinchStates: boolean[] = [];

            results.multiHandLandmarks.forEach((landmarks: any) => {
                const handPos = KEY_INDICES.map((idx) => {
                    const lm = landmarks?.[idx];
                    if (!lm) return { x: 100, y: 100 };
                    return normalizeToScene(lm.x, lm.y);
                });
                allHands.push(handPos);
                pinchStates.push(isPinching(landmarks));

                if (window.drawConnectors && window.HAND_CONNECTIONS) {
                    window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
                        color: "#00ff41",
                        lineWidth: 2,
                    });
                }
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
            {/* Reality Lens filter canvas (z-index: 15, between physics and skeleton) */}
            <canvas
                ref={filterCanvasRef}
                width={1280}
                height={720}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 15, transform: "scaleX(-1)" }}
            />
            {/* Hand skeleton canvas */}
            <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ mixBlendMode: "screen", zIndex: 20, transform: "scaleX(-1)" }}
            />
        </>
    );
}
