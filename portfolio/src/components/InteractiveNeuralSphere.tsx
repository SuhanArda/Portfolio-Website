"use client";

import React, { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
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

interface NeuralSphereProps {
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: number;
}

function NeuralSphere({ position, rotation, scale }: NeuralSphereProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            // Smooth interpolation for magnetic effect
            meshRef.current.position.lerp(position, delta * 3);
            meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, rotation.x, delta * 2);
            meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, rotation.y, delta * 2);
            meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, rotation.z, delta * 2);
            meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), delta * 2);
        }
    });

    return (
        <Sphere ref={meshRef} args={[1, 32, 32]}>
            <meshPhysicalMaterial
                color="#fbbf24"
                emissive="#fbbf24"
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.1}
                transmission={0.8}
                thickness={0.5}
                ior={1.5}
                clearcoat={1}
                clearcoatRoughness={0.1}
            />
        </Sphere>
    );
}

export default function InteractiveNeuralSphere() {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const handsRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);

    const [loading, setLoading] = useState(true);
    const [spherePosition, setSpherePosition] = useState(new THREE.Vector3(0, 0, 0));
    const [sphereRotation, setSphereRotation] = useState(new THREE.Euler(0, 0, 0));
    const [sphereScale, setSphereScale] = useState(1);

    // Gesture states
    const [leftHandPinching, setLeftHandPinching] = useState(false);
    const [rightHandPinching, setRightHandPinching] = useState(false);
    const [leftHandCenter, setLeftHandCenter] = useState(new THREE.Vector3());
    const [rightHandCenter, setRightHandCenter] = useState(new THREE.Vector3());
    const [leftHandOrientation, setLeftHandOrientation] = useState(new THREE.Vector3());
    const [rightHandOrientation, setRightHandOrientation] = useState(new THREE.Vector3());

    const calculateHandCenter = (landmarks: any) => {
        const center = new THREE.Vector3();
        for (let i = 0; i < landmarks.length; i++) {
            center.x += landmarks[i].x;
            center.y += landmarks[i].y;
            center.z += landmarks[i].z;
        }
        center.divideScalar(landmarks.length);
        return center;
    };

    const calculateHandOrientation = (landmarks: any) => {
        const wrist = new THREE.Vector3(landmarks[0].x, landmarks[0].y, landmarks[0].z);
        const middleMCP = new THREE.Vector3(landmarks[9].x, landmarks[9].y, landmarks[9].z);
        return middleMCP.sub(wrist).normalize();
    };

    const isPinching = (landmarks: any) => {
        const thumbTip = new THREE.Vector3(landmarks[4].x, landmarks[4].y, landmarks[4].z);
        const indexTip = new THREE.Vector3(landmarks[8].x, landmarks[8].y, landmarks[8].z);
        return thumbTip.distanceTo(indexTip) < 0.05;
    };

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

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvasElement.width, canvasElement.height);

        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            let leftHand = null;
            let rightHand = null;

            // Separate hands by handedness
            for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                const handedness = results.multiHandedness[i].label;
                if (handedness === "Left") {
                    leftHand = results.multiHandLandmarks[i];
                } else {
                    rightHand = results.multiHandLandmarks[i];
                }
            }

            // Process left hand
            if (leftHand) {
                const pinching = isPinching(leftHand);
                setLeftHandPinching(pinching);
                setLeftHandCenter(calculateHandCenter(leftHand));
                setLeftHandOrientation(calculateHandOrientation(leftHand));

                if (window.drawConnectors && window.HAND_CONNECTIONS) {
                    window.drawConnectors(ctx, leftHand, window.HAND_CONNECTIONS, {
                        color: "#00ff41",
                        lineWidth: 2,
                    });
                }
                if (window.drawLandmarks) {
                    window.drawLandmarks(ctx, leftHand, {
                        color: "#fbbf24",
                        lineWidth: 1,
                        radius: 3,
                    });
                }
            }

            // Process right hand
            if (rightHand) {
                const pinching = isPinching(rightHand);
                setRightHandPinching(pinching);
                setRightHandCenter(calculateHandCenter(rightHand));
                setRightHandOrientation(calculateHandOrientation(rightHand));

                if (window.drawConnectors && window.HAND_CONNECTIONS) {
                    window.drawConnectors(ctx, rightHand, window.HAND_CONNECTIONS, {
                        color: "#00ff41",
                        lineWidth: 2,
                    });
                }
                if (window.drawLandmarks) {
                    window.drawLandmarks(ctx, rightHand, {
                        color: "#fbbf24",
                        lineWidth: 1,
                        radius: 3,
                    });
                }
            }
        } else {
            setLeftHandPinching(false);
            setRightHandPinching(false);
        }
    };

    // Update sphere based on gestures
    useEffect(() => {
        // Single hand translation (follow hand position)
        if (leftHandPinching && !rightHandPinching) {
            const screenX = (leftHandCenter.x - 0.5) * 4; // Map to -2 to 2 range
            const screenY = -(leftHandCenter.y - 0.5) * 4; // Map to -2 to 2 range
            setSpherePosition(new THREE.Vector3(screenX, screenY, 0));
        } else if (rightHandPinching && !leftHandPinching) {
            const screenX = (rightHandCenter.x - 0.5) * 4; // Map to -2 to 2 range
            const screenY = -(rightHandCenter.y - 0.5) * 4; // Map to -2 to 2 range
            setSpherePosition(new THREE.Vector3(screenX, screenY, 0));
        }

        // Single hand rotation (when pinching)
        if (leftHandPinching && !rightHandPinching) {
            const orientation = leftHandOrientation;
            const rotationX = Math.atan2(orientation.y, orientation.z);
            const rotationY = Math.atan2(orientation.x, orientation.z);
            setSphereRotation(new THREE.Euler(rotationX, rotationY, 0));
        } else if (rightHandPinching && !leftHandPinching) {
            const orientation = rightHandOrientation;
            const rotationX = Math.atan2(orientation.y, orientation.z);
            const rotationY = Math.atan2(orientation.x, orientation.z);
            setSphereRotation(new THREE.Euler(rotationX, rotationY, 0));
        }

        // Two hand scaling
        if (leftHandPinching && rightHandPinching) {
            const distance = leftHandCenter.distanceTo(rightHandCenter);
            const scale = Math.max(0.3, Math.min(3, distance * 5)); // Scale between 0.3 and 3
            setSphereScale(scale);
        }
    }, [leftHandPinching, rightHandPinching, leftHandCenter, rightHandCenter, leftHandOrientation, rightHandOrientation]);

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
                    mirrored={false}
                    videoConstraints={{
                        width: 1280,
                        height: 720,
                        facingMode: "user",
                    }}
                    className="absolute inset-0 w-full h-full opacity-0"
                    style={{
                        display: "none",
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

                {/* 3D Scene Overlay */}
                <div className="absolute inset-0">
                    <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                        <ambientLight intensity={0.2} />
                        <directionalLight position={[5, 5, 5]} intensity={1} />
                        <NeuralSphere
                            position={spherePosition}
                            rotation={sphereRotation}
                            scale={sphereScale}
                        />
                    </Canvas>
                </div>

                {/* Stats Overlay */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur border border-[#fbbf24]/50 px-4 py-2 rounded font-mono text-xs text-[#fbbf24]">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#fbbf24] rounded-full animate-pulse"></span>
                        <span>NEURAL SPHERE ACTIVE</span>
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">
                        L: {leftHandPinching ? 'PINCH' : 'OPEN'} | R: {rightHandPinching ? 'PINCH' : 'OPEN'}
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
                        Neural Sphere Control
                    </span>
                    <span className="text-[#fbbf24]">ADVANCED HMI INTERFACE</span>
                </div>
            </div>
        </div>
    );
}