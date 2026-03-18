"use client";

import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Icosahedron } from "@react-three/drei";
import * as THREE from "three";
import { useTheme } from "@/context/ThemeContext";
import { Terminal, X, Cpu, Send, Bot, User } from "lucide-react";


const ParticleCloud = ({ color, isHovered }: { color: string, isHovered: boolean }) => {
    const pointsRef = useRef<THREE.Points>(null);

    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(400 * 3);
        for (let i = 0; i < 400; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            const r = 1.3 + Math.random() * 0.4;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return positions;
    }, []);

    useFrame((state, delta) => {
        if (pointsRef.current) {
            const speed = isHovered ? 1.5 : 0.2;
            pointsRef.current.rotation.y += delta * speed;
            pointsRef.current.rotation.x += delta * (speed * 0.5);
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[particlesPosition, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.03} color={color} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>
    );
};


const CoreSphere = ({ isHovered, isOpen, hw }: { isHovered: boolean, isOpen: boolean, hw: boolean }) => {
    const groupRef = useRef<THREE.Group>(null);
    const outerRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    const baseColor = hw ? "#d97706" : "#00ccff";
    const hoverColor = hw ? "#fbbf24" : "#00f0ff";
    const activeColor = hw ? "#ef4444" : "#ff3366";

    const coreColor = isOpen ? activeColor : (isHovered ? hoverColor : baseColor);

    useFrame((state, delta) => {
        if (!groupRef.current || !outerRef.current || !innerRef.current) return;

        // Çekirdeğin genel dönüşü
        const rotationSpeed = isHovered || isOpen ? 2 : 0.5;
        groupRef.current.rotation.y += delta * rotationSpeed;
        groupRef.current.rotation.x += delta * (rotationSpeed * 0.5);

        // Organik nefes alma efekti
        const time = state.clock.elapsedTime;
        const scale = 1 + Math.sin(time * 3) * 0.05;
        groupRef.current.scale.set(scale, scale, scale);

        // İç merkezin ters rotasyonu
        innerRef.current.rotation.y -= delta;
    });

    return (
        <group ref={groupRef}>

            <Icosahedron ref={outerRef} args={[1.2, 2]}>
                <meshBasicMaterial color={coreColor} wireframe transparent opacity={0.3} />
            </Icosahedron>

            <Sphere ref={innerRef} args={[0.85, 32, 32]}>
                <meshStandardMaterial
                    color="#000000"
                    emissive={coreColor}
                    emissiveIntensity={isHovered ? 2.5 : 1.5}
                    toneMapped={false}
                />
            </Sphere>

            <ParticleCloud color={coreColor} isHovered={isHovered || isOpen} />

            <pointLight distance={6} intensity={2} color={coreColor} />
        </group>
    );
};


export default function FloatingAICore() {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [messages, setMessages] = useState<{ role: "ai" | "user", text: string }[]>([
        { role: "ai", text: "The neural network is active. I am Suhan's assistant. How can I help you with hardware or software capabilities?" }
    ]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const hw = theme === "hardware";

    const textColor = hw ? "text-[#fbbf24]" : "text-[#00ccff]";
    const borderColor = hw ? "border-[#fbbf24]/40" : "border-[#00ccff]/40";
    const bgColor = hw ? "bg-[#fbbf24]/10" : "bg-[#00ccff]/10";
    const shadowColor = hw ? "shadow-[0_0_30px_rgba(251,191,36,0.15)]" : "shadow-[0_0_30px_rgba(0,204,255,0.15)]";
    const glowColor = hw ? "bg-[#fbbf24]" : "bg-[#00ccff]";
    const userBubbleColor = hw ? "bg-[#fbbf24]/20" : "bg-[#00ccff]/20";

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userText }]);
        setIsLoading(true);
        setTimeout(scrollToBottom, 50);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText })
            });

            const data = await res.json();
            setMessages(prev => [...prev, { role: "ai", text: data.text }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "ai", text: "Hata: Sunucu bağlantısı kurulamadı." }]);
        } finally {
            setIsLoading(false);
            setTimeout(scrollToBottom, 50);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') sendMessage();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

            <div className={`mb-4 w-80 sm:w-96 bg-black/60 backdrop-blur-xl border ${borderColor} rounded-2xl ${shadowColor} overflow-hidden transition-all duration-500 origin-bottom-right ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"}`}>

                <div className={`${bgColor} px-4 py-3 flex items-center justify-between border-b ${borderColor}`}>
                    <div className={`flex items-center gap-2 ${textColor} font-mono text-xs font-bold tracking-widest`}>
                        <Bot className="w-4 h-4 animate-pulse" />
                        AI_ASSISTANT_V1.0
                    </div>
                    <button onClick={() => setIsOpen(false)} className={`${textColor} hover:text-white transition-colors`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 h-72 overflow-y-auto flex flex-col gap-3 custom-scrollbar">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs font-mono leading-relaxed ${msg.role === "user" ? `${userBubbleColor} text-white rounded-br-none border ${borderColor}` : `bg-black/40 text-gray-300 rounded-bl-none border border-gray-800`}`}>
                                {msg.role === "ai" && <Bot className={`w-3 h-3 mb-1 ${textColor}`} />}
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-black/40 border border-gray-800 rounded-2xl rounded-bl-none px-4 py-3">
                                <div className={`flex gap-1 ${textColor}`}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-75" />
                                    <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-150" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className={`p-2 border-t ${borderColor} bg-black/40`}>
                    <div className={`flex items-center gap-2 bg-black/60 rounded-xl px-3 py-2 border border-gray-800 focus-within:${borderColor} transition-colors`}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about Suhan..."
                            className="bg-transparent border-none outline-none text-gray-200 font-mono text-xs w-full placeholder:text-gray-600"
                        />
                        <button onClick={sendMessage} disabled={isLoading || !input.trim()} className={`${textColor} disabled:opacity-30 hover:scale-110 transition-transform`}>
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div
                className="w-24 h-24 sm:w-32 sm:h-32 cursor-pointer relative hover:scale-105 transition-transform duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={`absolute inset-0 ${glowColor} rounded-full blur-2xl transition-opacity duration-500 z-0 ${isHovered || isOpen ? "opacity-30" : "opacity-0"}`} />
                <Canvas camera={{ position: [0, 0, 4] }} className="z-10 relative">
                    <ambientLight intensity={0.5} />
                    <CoreSphere isHovered={isHovered} isOpen={isOpen} hw={hw} />
                </Canvas>
            </div>

        </div>
    );
}