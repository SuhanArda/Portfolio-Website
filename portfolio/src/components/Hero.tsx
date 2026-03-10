"use client";
import { motion } from "framer-motion";
import { FileText, ArrowRight, Github, Linkedin, Instagram } from "lucide-react";

export default function Hero() {
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
                    <div className="text-sm md:text-md uppercase tracking-widest text-[#00ccff] font-semibold">
                        Portfolyo
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-bold leading-tight">
                        I am{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3366] to-[#00ccff]">
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
                            className="flex items-center gap-2 bg-[#ff3366] hover:bg-[#ff1a53] text-white px-6 py-3 rounded-full font-medium transition-all shadow-[0_0_15px_rgba(255,51,102,0.3)] hover:shadow-[0_0_25px_rgba(255,51,102,0.6)]"
                        >
                            <FileText size={20} />
                            Download CV
                        </a>
                        <a
                            href="/projects"
                            className="flex items-center gap-2 border border-[#00ccff] text-[#00ccff] hover:bg-[#00ccff] hover:text-black px-6 py-3 rounded-full font-medium transition-all"
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
                            href="https://www.linkedin.com/in/suhan-arda-%C3%B6ner-57826924b/"
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
                    <div
                        className="relative w-72 h-72 sm:w-96 sm:h-96 group"
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left - rect.width / 2;
                            const y = e.clientY - rect.top - rect.height / 2;
                            e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                            e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.setProperty('--mouse-x', `0px`);
                            e.currentTarget.style.setProperty('--mouse-y', `0px`);
                        }}
                        style={{ '--mouse-x': '0px', '--mouse-y': '0px' } as React.CSSProperties}
                    >
                        {/* Glowing Background that follows mouse */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-tr from-[#ff3366] to-[#00ccff] rounded-full blur-2xl opacity-40 transition-transform duration-200 ease-out"
                            style={{
                                transform: 'translate(calc(var(--mouse-x) * 0.2), calc(var(--mouse-y) * 0.2)) scale(1.1)',
                            }}
                        />

                        <div className="w-full h-full duotone-container shadow-2xl relative z-10 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src="/profile.jpeg"
                                alt="Suhan Arda Öner"
                                className="w-full h-full object-cover duotone-image"
                            />
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
