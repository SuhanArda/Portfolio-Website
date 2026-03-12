"use client";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Github, Linkedin, Instagram } from "lucide-react";
import ProfileFlipCard from "./ProfileFlipCard";
import { useTheme } from "@/context/ThemeContext";

export default function Hero() {
    const { theme } = useTheme();
    const hw = theme === "hardware";

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
                        <span
                            className="inline-block whitespace-nowrap text-transparent bg-clip-text transition-all duration-500"
                            style={{
                                backgroundImage: hw
                                    ? "linear-gradient(to right, #d97706, #fbbf24)"
                                    : "linear-gradient(to right, #ff3366, #00ccff)",
                            }}
                        >
                            Suhan Arda Öner.
                        </span>
                        <br /> A Computer & Mechatronics Engineer
                    </h1>
                    <p className="text-gray-400 text-lg max-w-lg mt-4 leading-relaxed">
                        Innovative Dual‑Degree candidate specialized in bridging software architecture with hardware systems. Proven track record in developing high‑
                        fidelity Haptic Feedback systems and optimizing Human‑Machine Interaction (HMI) protocols. Proficient in Object‑Oriented Programming (Java,
                        C++, C#) and real‑time simulation engines (Unity). Committed to delivering scalable, data‑driven solutions and reducing system latency in complex
                        robotic environments.
                    </p>

                    <div className="flex flex-wrap gap-4 mt-8">
                        <a
                            href="/cv.pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-500 border"
                            style={{
                                borderColor: hw ? "#d97706" : "#ff3366",
                                color: hw ? "#d97706" : "#ff3366",
                                boxShadow: hw
                                    ? "0 0 15px rgba(217, 119, 6, 0.3)"
                                    : "0 0 15px rgba(255, 51, 102, 0.3)",
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = hw ? "#d97706" : "#ff3366";
                                el.style.color = hw ? "#000" : "#fff";
                                el.style.boxShadow = hw
                                    ? "0 0 25px rgba(217, 119, 6, 0.6)"
                                    : "0 0 25px rgba(255, 51, 102, 0.6)";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "transparent";
                                el.style.color = hw ? "#d97706" : "#ff3366";
                                el.style.boxShadow = hw
                                    ? "0 0 15px rgba(217, 119, 6, 0.3)"
                                    : "0 0 15px rgba(255, 51, 102, 0.3)";
                            }}
                        >
                            <FileText size={20} />
                            Download CV
                        </a>
                        <a
                            href="/projects"
                            className="flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-500 border"
                            style={{
                                borderColor: hw ? "#fbbf24" : "#00ccff",
                                color: hw ? "#fbbf24" : "#00ccff",
                            }}
                            onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = hw ? "#fbbf24" : "#00ccff";
                                el.style.color = hw ? "#000" : "#000";
                            }}
                            onMouseLeave={(e) => {
                                const el = e.currentTarget;
                                el.style.backgroundColor = "transparent";
                                el.style.color = hw ? "#fbbf24" : "#00ccff";
                            }}
                        >
                            Explore Work
                            <ArrowRight size={20} />
                        </a>
                        <a
                            href="https://github.com/SuhanArda"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 px-6 py-3 rounded-full font-medium transition-all"
                        >
                            <Github size={20} />
                            GitHub
                        </a>
                        <a
                            href="https://www.linkedin.com/in/suhan-arda-öner/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-white/20 text-white hover:bg-[#0A66C2] border-transparent hover:border-[#0A66C2] px-6 py-3 rounded-full font-medium transition-all"
                        >
                            <Linkedin size={20} />
                            LinkedIn
                        </a>
                        <a
                            href="https://www.instagram.com/suhanarda/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 border border-white/20 text-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] border-transparent hover:border-transparent px-6 py-3 rounded-full font-medium transition-all"
                        >
                            <Instagram size={20} />
                            Instagram
                        </a>
                    </div>
                </motion.div>

                {/* Image Area */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex justify-center lg:justify-end"
                >
                    <ProfileFlipCard />
                </motion.div>
            </div>
        </section>
    );
}
