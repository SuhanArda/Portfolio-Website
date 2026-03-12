"use client";
import { motion } from "framer-motion";
import { Terminal, Cpu } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeSwitcher() {
    const { theme, toggleTheme } = useTheme();
    const isHardware = theme === "hardware";

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="fixed top-5 right-5 z-[100] flex items-center gap-3"
        >
            {/* Label */}
            <motion.span
                key={theme}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="text-[10px] font-mono tracking-[0.25em] uppercase select-none"
                style={{
                    color: isHardware ? "#fbbf24" : "#00ccff",
                    textShadow: isHardware
                        ? "0 0 8px rgba(251, 191, 36, 0.4)"
                        : "0 0 8px rgba(0, 204, 255, 0.4)",
                }}
            >
                {isHardware ? "HARDWARE" : "SOFTWARE"}
            </motion.span>

            {/* Toggle Pill */}
            <button
                onClick={toggleTheme}
                aria-label={`Switch to ${isHardware ? "software" : "hardware"} mode`}
                className="relative w-[68px] h-[34px] rounded-full p-[3px] transition-all duration-500 outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                style={{
                    background: isHardware
                        ? "linear-gradient(135deg, #92400e, #d97706)"
                        : "linear-gradient(135deg, #0e4f6e, #00ccff)",
                    boxShadow: isHardware
                        ? "0 0 20px rgba(217, 119, 6, 0.4), inset 0 1px 2px rgba(0,0,0,0.3)"
                        : "0 0 20px rgba(0, 204, 255, 0.4), inset 0 1px 2px rgba(0,0,0,0.3)",
                }}
            >
                {/* Track background pattern */}
                <div
                    className="absolute inset-[3px] rounded-full overflow-hidden opacity-20"
                    style={{
                        backgroundImage: isHardware
                            ? "repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 4px)"
                            : "repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,255,255,0.3) 4px, rgba(0,255,255,0.3) 5px)",
                    }}
                />

                {/* Sliding Knob */}
                <motion.div
                    layout
                    transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                    }}
                    className="relative w-[28px] h-[28px] rounded-full flex items-center justify-center shadow-lg"
                    style={{
                        marginLeft: isHardware ? "auto" : "0",
                        background: isHardware
                            ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
                            : "linear-gradient(135deg, #00eeff, #00bbdd)",
                        boxShadow: isHardware
                            ? "0 0 12px rgba(251, 191, 36, 0.6)"
                            : "0 0 12px rgba(0, 204, 255, 0.6)",
                    }}
                >
                    <motion.div
                        initial={false}
                        animate={{ rotate: isHardware ? 180 : 0, scale: [0.8, 1] }}
                        transition={{ duration: 0.3 }}
                    >
                        {isHardware ? (
                            <Cpu className="w-[14px] h-[14px] text-[#451a03]" />
                        ) : (
                            <Terminal className="w-[14px] h-[14px] text-[#042f3d]" />
                        )}
                    </motion.div>
                </motion.div>
            </button>
        </motion.div>
    );
}
