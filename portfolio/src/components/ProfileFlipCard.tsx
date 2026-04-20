"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import InteractiveTerminal from "./InteractiveTerminal";

export default function ProfileFlipCard() {
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);

    const handleBackKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            setIsTerminalOpen(true);
        }
    };

    return (
        <>
            <div
                className="relative w-72 h-72 sm:w-96 sm:h-96 group [perspective:1000px]"
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
                    className="absolute inset-0 bg-gradient-to-tr from-[#ff3366] to-[#00ccff] rounded-full blur-2xl opacity-40 transition-transform duration-200 ease-out pointer-events-none"
                    style={{
                        transform: 'translate(calc(var(--mouse-x) * 0.2), calc(var(--mouse-y) * 0.2)) scale(1.1)',
                    }}
                />

                {/* 3D Flip Container */}
                <motion.div
                    className="w-full h-full relative [transform-style:preserve-3d] transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    whileHover={{ rotateY: 180 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                >
                    {/* Front Face */}
                    <div className="absolute inset-0 w-full h-full duotone-container shadow-2xl [backface-visibility:hidden]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/profile.jpeg"
                            alt="Suhan Arda Öner"
                            className="w-full h-full object-cover duotone-image"
                        />
                    </div>

                    {/* Back Face */}
                    <div
                        tabIndex={0}
                        role="button"
                        aria-label="Interactive terminal. Press Enter to open."
                        className="absolute inset-0 w-full h-full rounded-full shadow-2xl overflow-hidden bg-[#0a0a0a] border-2 border-white/10 flex flex-col [backface-visibility:hidden] [transform:rotateY(180deg)] focus:outline-none focus:ring-2 focus:ring-[#00ff66]/50 cursor-pointer"
                        onKeyDown={handleBackKeyDown}
                        onClick={() => setIsTerminalOpen(true)}
                    >
                        {/* Mac Buttons */}
                        <div className="absolute top-14 left-16 flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                        </div>

                        {/* Terminal Content */}
                        <div className="flex-1 p-8 sm:p-12 font-mono text-sm sm:text-base flex flex-col justify-center items-start text-[#00ccff] mt-6">
                            <div className="mb-4">
                                <span className="text-[#ff3366]">{">"}</span> whoami
                                <br />
                                <span className="text-gray-100">Suhan Arda Öner</span>
                            </div>
                            <div className="mb-4">
                                <span className="text-[#ff3366]">{">"}</span> role
                                <br />
                                <span className="text-gray-100">Dual-Degree Eng<br className="sm:hidden" /> (CS + Mechatronics)</span>
                            </div>
                            <div>
                                <span className="text-[#ff3366]">{">"}</span> status
                                <br />
                                <span className="text-[#00ffcc]">Ready to deploy... </span>
                                <span className="animate-blink">█</span>
                            </div>
                        </div>

                        {/* Easter Egg Hint */}
                        <div className="absolute bottom-16 left-0 right-0 flex justify-center px-4">
                            <span
                                className="font-mono text-[10px] sm:text-xs text-[#00ff66] animate-pulse text-center leading-tight"
                                style={{ textShadow: '0 0 8px #00ff66, 0 0 16px #00ff6688' }}
                            >
                                {">"} Click &amp; press ENTER to access root...
                            </span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Interactive Terminal Modal */}
            <InteractiveTerminal
                isOpen={isTerminalOpen}
                onClose={() => setIsTerminalOpen(false)}
            />
        </>
    );
}