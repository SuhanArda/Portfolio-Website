"use client";

import React, { useEffect, useRef, useState } from "react";
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

export default function GhostHandHMI() {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handsRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const [loading, setLoading] = useState(true);
    const [handCount, setHandCount] = useState(0);

    useEffect(() => {
        const initializeMediaPipe = async () => {
            try {
                // Load MediaPipe scripts dynamically
                const loadScript = (src: string) => {
                    return new Promise<void>((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = src;
                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error(`Failed to load ${src}`));
                        document.head.appendChild(script);
                    });
                };

                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js');
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');

                // Wait for global objects to be available
                let attempts = 0;
                while (!window.Hands && attempts < 50) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }

                if (!window.Hands) {
                    throw new Error('MediaPipe Hands failed to load');
                }

                const hands = new window.Hands({
                    locateFile: (file: string) => {
                        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
                    },
                });

                hands.setOptions({
                    maxNumHands: 2,
                    modelComplexity: 1,
                    minDetectionConfidence: 0.5,
                    minTrackingConfidence: 0.5,
                });

                hands.onResults(onResults);

                // Wait for webcam to be ready
                let webcamAttempts = 0;
                while (!webcamRef.current?.video && webcamAttempts < 100) {
                    await new Promise(resolve => setTimeout(resolve, 50));
                    webcamAttempts++;
                }

                if (!webcamRef.current?.video) {
                    throw new Error('Webcam not ready');
                }

                const camera = new window.Camera(webcamRef.current.video, {
                    onFrame: async () => {
                        if (webcamRef.current?.video) {
                            await hands.send({
                                image: webcamRef.current.video,
                            });
                        }
                    },
                    width: 1280,
                    height: 720,
                });

                cameraRef.current = camera;
                camera.start();
                handsRef.current = hands;
                setLoading(false);
            } catch (error) {
                console.error("Error initializing MediaPipe:", error);
                setLoading(false);
            }
        };

        initializeMediaPipe();

        return () => {
            if (cameraRef.current) {
                cameraRef.current.stop();
            }
            if (handsRef.current) {
                handsRef.current.close();
            }
        };
    }, []);

    const onResults = (results: any) => {
        const canvasElement = canvasRef.current;
        if (!canvasElement) return;

        const ctx = canvasElement.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

        // Draw landmarks and connectors
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            setHandCount(results.multiHandLandmarks.length);

            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const landmarks = results.multiHandLandmarks[i];

                // Draw connectors (green lines)
                if (window.drawConnectors && window.HAND_CONNECTIONS) {
                    window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
                        color: "#00ff41",
                        lineWidth: 2,
                    });
                }

                // Draw landmarks (amber dots)
                if (window.drawLandmarks) {
                    window.drawLandmarks(ctx, landmarks, {
                        color: "#fbbf24",
                        lineWidth: 1,
                        radius: 3,
                    });
                }
            }
        } else {
            setHandCount(0);
        }
    };

    return (
        <div className="relative w-full bg-black/40 rounded-xl overflow-hidden border border-[#fbbf24]/40 shadow-[0_0_30px_rgba(251,191,36,0.15)]">
            {/* Loading Overlay */}
            {loading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 border-2 border-transparent border-t-[#fbbf24] border-r-[#fbbf24] rounded-full animate-spin"></div>
                        </div>
                        <p className="text-[#fbbf24] font-mono text-sm tracking-widest animate-pulse">
                            LOADING NEURAL VISION...
                        </p>
                    </div>
                </div>
            )}

            {/* Webcam Container */}
            <div className="relative w-full aspect-video bg-black">
                <Webcam
                    ref={webcamRef}
                    videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: "user",
                    }}
                    className="absolute inset-0 w-full h-full opacity-40"
                    style={{
                        filter: "grayscale(100%)",
                    }}
                />

                {/* Canvas Overlay */}
                <canvas
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    className="absolute inset-0 w-full h-full"
                    style={{
                        display: "block",
                    }}
                />

                {/* Stats Overlay */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur border border-[#fbbf24]/50 px-4 py-2 rounded font-mono text-xs text-[#fbbf24]">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#fbbf24] rounded-full animate-pulse"></span>
                        <span>HANDS DETECTED: {handCount}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                        FPS: TRACKING
                    </div>
                </div>

                {/* Center Guide */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="flex gap-8">
                        <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-[#fbbf24] to-transparent opacity-30"></div>
                        <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-[#fbbf24] to-transparent opacity-30"></div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-black/60 backdrop-blur border-t border-[#fbbf24]/30 px-4 py-3 font-mono text-xs text-gray-400">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="text-[#fbbf24]">●</span>
                        Hand Tracking Active
                    </span>
                    <span className="text-[#fbbf24]">REAL-TIME HMI OVERLAY</span>
                </div>
            </div>
        </div>
    );
}
