"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowRight, Github, Linkedin, Instagram, Building2, Activity, Cpu, Info, Hand, Brain, Monitor, Rocket } from "lucide-react";
import ProfileFlipCard from "./ProfileFlipCard";
import { useTheme } from "@/context/ThemeContext";
import GradientText from "./GradientText";

export default function Hero() {
    const { theme } = useTheme();
    const hw = theme === "hardware";

    const [isSimRunning, setIsSimRunning] = useState(false);
    const [lambda, setLambda] = useState(4.2);
    const [mu, setMu] = useState(5.0);
    useEffect(() => {
        if (!isSimRunning) return;
        const interval = setInterval(() => {
            setLambda(prev => Math.max(2.0, Math.min(4.8, prev + (Math.random() - 0.5) * 0.8)));
        }, 1000);
        return () => clearInterval(interval);
    }, [isSimRunning]);

    const rho = lambda / mu; // Sistem Kullanım Oranı (ρ)
    const lq = (rho * rho) / (1 - rho); // Kuyruktaki ortalama iş (Lq)
    const wq = lq / lambda; // Kuyrukta ortalama bekleme (Wq)
    const p0 = 1 - rho; // Boş kalma olasılığı (P0)

    return (
        <section className="min-h-screen flex items-center justify-center pt-20 pb-12 px-6 sm:px-12 relative z-10">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Text Area */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="flex flex-col gap-6"
                >
                    <div
                        className="text-sm md:text-md uppercase tracking-widest font-semibold transition-colors duration-500"
                        style={{ color: hw ? "#fbbf24" : "#00ccff" }}
                    >
                        {hw ? "Portfolio" : "Portfolio"}
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                        I am{" "}

                        <GradientText
                            colors={
                                hw
                                    ? ["#d97706", "#fbbf24", "#f59e0b"]  // Donanım (Sarı/Turuncu)
                                    : ["#ff3366", "#00ccff", "#b000ff"]  // Yazılım (Pembe/Mavi/Mor)
                            }
                            animationSpeed={4}
                            showBorder={false}
                            className="inline-block pb-2"
                        >
                            Suhan Arda Öner.
                        </GradientText>

                        <br /> A Computer & Mechatronics Engineer
                    </h1>
                    <p className="text-gray-400 text-lg max-w-lg mt-4 leading-relaxed">
                        Innovative Dual‑Degree candidate specialized in bridging software architecture with hardware systems. Proven track record in developing high‑
                        fidelity Haptic Feedback systems and optimizing Human‑Machine Interaction (HMI) protocols. Proficient in Object‑Oriented Programming (Java,
                        C++, C#) and real‑time simulation engines (Unity). Committed to delivering scalable, data‑driven solutions and reducing system latency in complex
                        robotic environments.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-xl">
                        <a
                            href="/cv.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 w-full justify-center text-center px-6 py-3 rounded-full font-medium transition-all duration-500 border border-white/20 text-white"
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = hw ? "#d97706" : "#ff3366";
                                el.style.borderColor = hw ? "#d97706" : "#ff3366";
                                el.style.color = hw ? "#000" : "#fff";
                                el.style.boxShadow = hw
                                    ? "0 0 25px rgba(217, 119, 6, 0.6)"
                                    : "0 0 25px rgba(255, 51, 102, 0.6)";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "";
                                el.style.borderColor = "";
                                el.style.color = "";
                                el.style.boxShadow = "";
                            }}
                        >
                            <FileText size={20} />
                            Download CV
                        </a>
                        <a
                            href="/projects"
                            className="flex items-center gap-2 w-full justify-center text-center px-6 py-3 rounded-full font-medium transition-all duration-500 border border-white/20 text-white"
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = hw ? "#fbbf24" : "#00ccff";
                                el.style.borderColor = hw ? "#fbbf24" : "#00ccff";
                                el.style.color = "#000";
                                el.style.boxShadow = hw
                                    ? "0 0 20px rgba(251, 191, 36, 0.5)"
                                    : "0 0 20px rgba(0, 204, 255, 0.5)";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "";
                                el.style.borderColor = "";
                                el.style.color = "";
                                el.style.boxShadow = "";
                            }}
                        >
                            Explore Work
                            <ArrowRight size={20} />
                        </a>
                        <a
                            href="/github-city"
                            className="flex items-center gap-2 w-full justify-center text-center px-6 py-3 rounded-full font-medium transition-all duration-500 border border-white/20 text-white"
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "rgba(0, 255, 65, 0.15)";
                                el.style.borderColor = "#00ff41";
                                el.style.color = "#00ff41";
                                el.style.boxShadow = "0 0 20px rgba(0, 255, 65, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "";
                                el.style.borderColor = "";
                                el.style.color = "";
                                el.style.boxShadow = "";
                            }}
                        >
                            <Building2 size={20} />
                            My GitHub City
                        </a>

                        <button
                            onClick={() => setIsSimRunning(!isSimRunning)}
                            className="flex items-center gap-2 w-full justify-center text-center px-6 py-3 rounded-full font-medium transition-all duration-500 border cursor-pointer"
                            style={{
                                backgroundColor: isSimRunning ? "rgba(0, 255, 65, 0.15)" : "transparent",
                                borderColor: isSimRunning ? "#00ff41" : "rgba(255, 255, 255, 0.2)",
                                color: isSimRunning ? "#00ff41" : "white",
                                boxShadow: isSimRunning ? "0 0 20px rgba(0, 255, 65, 0.4)" : "none",
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "rgba(0, 255, 65, 0.15)";
                                el.style.borderColor = "#00ff41";
                                el.style.color = "#00ff41";
                                el.style.boxShadow = "0 0 20px rgba(0, 255, 65, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                if (!isSimRunning) {
                                    el.style.backgroundColor = "transparent";
                                    el.style.borderColor = "rgba(255, 255, 255, 0.2)";
                                    el.style.color = "white";
                                    el.style.boxShadow = "none";
                                }
                            }}
                        >
                            <Activity size={20} className={isSimRunning ? "animate-pulse" : ""} />
                            {isSimRunning ? "SYS_SIM: ACTIVE" : "Run M/M/1 Test"}
                        </button>
                        <Link href="/neural-sphere" className="flex items-center gap-2 w-full justify-center text-center px-6 py-3 rounded-full font-medium transition-all duration-500 border border-white/20 text-white"
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "rgba(251, 191, 36, 0.15)";
                                el.style.borderColor = "#fbbf24";
                                el.style.color = "#fbbf24";
                                el.style.boxShadow = "0 0 20px rgba(251, 191, 36, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "transparent";
                                el.style.borderColor = "rgba(255, 255, 255, 0.2)";
                                el.style.color = "white";
                                el.style.boxShadow = "none";
                            }}
                        >
                            <Brain size={20} />
                            Init Neural Sphere
                        </Link>
                        <Link href="/cyber-desk" className="flex items-center gap-2 w-full justify-center text-center px-6 py-3 rounded-full font-medium transition-all duration-500 border border-white/20 text-white"
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "rgba(0, 255, 204, 0.15)";
                                el.style.borderColor = "#00ffcc";
                                el.style.color = "#00ffcc";
                                el.style.boxShadow = "0 0 20px rgba(0, 255, 204, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "transparent";
                                el.style.borderColor = "rgba(255, 255, 255, 0.2)";
                                el.style.color = "white";
                                el.style.boxShadow = "none";
                            }}
                        >
                            <Monitor size={20} />
                            Explore Workspace
                        </Link>
                        <Link href="/missile-sim" className="flex items-center gap-2 w-full justify-center text-center px-6 py-3 rounded-full font-medium transition-all duration-500 border border-white/20 text-white"
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "rgba(255, 69, 0, 0.15)";
                                el.style.borderColor = "#ff4500";
                                el.style.color = "#ff4500";
                                el.style.boxShadow = "0 0 20px rgba(255, 69, 0, 0.4)";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "transparent";
                                el.style.borderColor = "rgba(255, 255, 255, 0.2)";
                                el.style.color = "white";
                                el.style.boxShadow = "none";
                            }}
                        >
                            <Rocket size={20} />
                            Launch Missile Sim
                        </Link>
                    </div>

                    <AnimatePresence>
                        {isSimRunning && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: "auto", y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                transition={{ duration: 0.4, ease: "easeInOut" }}
                                className="w-full mt-2 overflow-visible"
                            >
                                <div className="bg-black/60 backdrop-blur-md border border-[#00ff41]/40 rounded-xl p-5 font-mono text-[#00ff41] shadow-[0_0_30px_rgba(0,255,65,0.15)] relative z-50">
                                    <div className="flex items-center gap-2 mb-3 border-b border-[#00ff41]/30 pb-2">
                                        <Cpu className="w-4 h-4" />
                                        <span className="text-xs font-bold tracking-widest">REAL-TIME M/M/1 QUEUE TELEMETRY</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Performans Barı */}
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                {/* Arrival Tooltip */}
                                                <div className="relative group cursor-help flex items-center gap-1">
                                                    <span>Arrival (λ):</span>
                                                    <Info className="w-3 h-3 text-[#00ff41]/60 group-hover:text-[#00ff41]" />
                                                    <span className="text-white ml-1">{lambda.toFixed(2)} req/s</span>
                                                    <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-black/90 border border-[#00ff41]/50 text-gray-300 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
                                                        <strong className="text-[#00ff41] block mb-1">Arrival Rate</strong>
                                                        Incoming requests or data packets per second (e.g., customers entering a shop).
                                                    </div>
                                                </div>

                                                {/* Service Tooltip */}
                                                <div className="relative group cursor-help flex items-center gap-1">
                                                    <span>Service (μ):</span>
                                                    <Info className="w-3 h-3 text-[#00ff41]/60 group-hover:text-[#00ff41]" />
                                                    <span className="text-white ml-1">{mu.toFixed(2)} req/s</span>
                                                    <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-black/90 border border-[#00ff41]/50 text-gray-300 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
                                                        <strong className="text-[#00ff41] block mb-1">Service Capacity</strong>
                                                        Maximum tasks the processor can handle per second (e.g., a barista's speed).
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="w-full bg-gray-900 h-2 rounded overflow-hidden mt-1">
                                                <div
                                                    className={`h-full transition-all duration-300 ${rho > 0.85 ? 'bg-red-500' : 'bg-[#00ff41]'}`}
                                                    style={{ width: `${Math.min(100, rho * 100)}%` }}
                                                />
                                            </div>

                                            {/* Utilization Tooltip */}
                                            <div className="relative group cursor-help flex items-center gap-1 mt-1 w-fit">
                                                <p className="text-[10px] text-gray-400">Utilization (ρ = λ/μ):</p>
                                                <Info className="w-3 h-3 text-gray-500 group-hover:text-[#00ff41]" />
                                                <span className={`text-[10px] ml-1 ${rho > 0.85 ? 'text-red-500' : 'text-[#00ff41]'}`}>{(rho * 100).toFixed(1)}%</span>
                                                <div className="absolute top-full left-0 mt-2 w-52 p-2 bg-black/90 border border-[#00ff41]/50 text-gray-300 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed">
                                                    <strong className="text-[#00ff41] block mb-1">System Stress Level</strong>
                                                    Server workload percentage. If it reaches 100%, the system bottlenecks and fails.
                                                </div>
                                            </div>
                                        </div>

                                        {/* Matematiksel Metrikler */}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                                            {/* Queue Tooltip */}
                                            <div className="relative group cursor-help flex flex-col w-fit">
                                                <div className="flex items-center gap-1">
                                                    <p className="text-gray-400">Queue (Lq):</p>
                                                    <Info className="w-3 h-3 text-gray-500 group-hover:text-[#00ff41]" />
                                                </div>
                                                <span className="text-white">{Math.max(0, lq).toFixed(2)} items</span>
                                                <div className="absolute bottom-full left-0 mb-2 w-40 p-2 bg-black/90 border border-[#00ff41]/50 text-gray-300 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                                    Average number of packets waiting in line to be processed.
                                                </div>
                                            </div>

                                            {/* Wait Tooltip */}
                                            <div className="relative group cursor-help flex flex-col w-fit">
                                                <div className="flex items-center gap-1">
                                                    <p className="text-gray-400">Wait (Wq):</p>
                                                    <Info className="w-3 h-3 text-gray-500 group-hover:text-[#00ff41]" />
                                                </div>
                                                <span className="text-white">{Math.max(0, wq).toFixed(3)} sec</span>
                                                <div className="absolute bottom-full left-0 mb-2 w-44 p-2 bg-black/90 border border-[#00ff41]/50 text-gray-300 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                                    <strong className="text-[#00ff41] block mb-1">Latency</strong>
                                                    Average time a request spends waiting in the queue before processing begins.
                                                </div>
                                            </div>

                                            {/* Idle Tooltip */}
                                            <div className="relative group cursor-help flex flex-col w-fit">
                                                <div className="flex items-center gap-1">
                                                    <p className="text-gray-400">Idle (P0):</p>
                                                    <Info className="w-3 h-3 text-gray-500 group-hover:text-[#00ff41]" />
                                                </div>
                                                <span className="text-white">{(Math.max(0, p0) * 100).toFixed(1)}%</span>
                                                <div className="absolute bottom-full left-0 mb-2 w-44 p-2 bg-black/90 border border-[#00ff41]/50 text-gray-300 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                                    Percentage of time the server remains completely idle without receiving any requests.
                                                </div>
                                            </div>

                                            {/* Model Tooltip */}
                                            <div className="relative group cursor-help flex flex-col w-fit">
                                                <div className="flex items-center gap-1">
                                                    <p className="text-gray-400">Model:</p>
                                                    <Info className="w-3 h-3 text-gray-500 group-hover:text-[#00ff41]" />
                                                </div>
                                                <span className="text-white">Single-Server</span>
                                                <div className="absolute bottom-full right-0 md:left-0 mb-2 w-44 p-2 bg-black/90 border border-[#00ff41]/50 text-gray-300 text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                                    Indicates a single active server/processor handles the entire system load (M/M/1).
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                </motion.div>

                {/* Image Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex flex-col items-center lg:items-end justify-center gap-8 mt-12 lg:mt-0"
                >
                    <ProfileFlipCard />
                    
                    {/* Social Buttons */}
                    <div className="flex items-center justify-center gap-6 w-72 sm:w-96">
                        <a
                            href="https://github.com/SuhanArda"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-14 h-14 rounded-full border border-white/20 text-white hover:bg-white/10 transition-all hover:scale-110 shadow-lg hover:shadow-white/20"
                            aria-label="GitHub"
                        >
                            <Github size={24} />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/suhan-arda-öner/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-14 h-14 rounded-full border border-white/20 text-white hover:bg-[#0A66C2] hover:border-[#0A66C2] transition-all hover:scale-110 shadow-lg hover:shadow-[#0A66C2]/40"
                            aria-label="LinkedIn"
                        >
                            <Linkedin size={24} />
                        </a>
                        <a
                            href="https://www.instagram.com/suhanarda/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-14 h-14 rounded-full border border-white/20 text-white hover:border-transparent transition-all hover:scale-110 relative overflow-hidden group shadow-lg hover:shadow-[#dc2743]/40"
                            aria-label="Instagram"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <Instagram size={24} className="relative z-10" />
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}