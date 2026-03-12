"use client";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function PCBScrollProgress() {
    const { theme } = useTheme();
    const { scrollYProgress } = useScroll();

    // Smooth out the scroll progress for a fluid "electric" feel
    const springScroll = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // We only show this in hardware mode
    if (theme !== "hardware") return null;

    // The glowing copper color
    const activeColor = "#fbbf24"; // Tailwind amber-400
    const inactiveColor = "rgba(255, 255, 255, 0.1)";

    // Define specific points where "Solder Pads" exist on the path
    // Let's place them at 0%, 33%, 66%, and 100% of the SVG path
    const pad1Active = useTransform(springScroll, [0, 0.05], [inactiveColor, activeColor]);
    const pad2Active = useTransform(springScroll, [0.3, 0.35], [inactiveColor, activeColor]);
    const pad3Active = useTransform(springScroll, [0.65, 0.7], [inactiveColor, activeColor]);
    const pad4Active = useTransform(springScroll, [0.95, 1], [inactiveColor, activeColor]);

    const pad1Scale = useTransform(springScroll, [0, 0.05], [1, 1.5]);
    const pad2Scale = useTransform(springScroll, [0.3, 0.35], [1, 1.5]);
    const pad3Scale = useTransform(springScroll, [0.65, 0.7], [1, 1.5]);
    const pad4Scale = useTransform(springScroll, [0.95, 1], [1, 1.5]);

    return (
        <div className="fixed right-4 top-0 h-full w-12 z-50 pointer-events-none flex items-center justify-center">
            {/* SVG Container wrapping the entire height */}
            <svg
                width="40"
                height="100%"
                viewBox="0 0 40 1000"
                preserveAspectRatio="none"
                className="overflow-visible"
            >
                <defs>
                    <filter id="pcb-glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Track (Inactive) */}
                <path
                    d="M 20 0 
                       L 20 250 
                       L 5 265 
                       L 5 350 
                       L 20 365 
                       L 20 600 
                       L 35 615 
                       L 35 700 
                       L 20 715 
                       L 20 1000"
                    fill="none"
                    stroke={inactiveColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Active Flowing Track (Current) */}
                <motion.path
                    d="M 20 0 
                       L 20 250 
                       L 5 265 
                       L 5 350 
                       L 20 365 
                       L 20 600 
                       L 35 615 
                       L 35 700 
                       L 20 715 
                       L 20 1000"
                    fill="none"
                    stroke={activeColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#pcb-glow)"
                    style={{ pathLength: springScroll }}
                />

                {/* Solder Pads (Nodes) */}
                {/* Pad 1: Start (Top) */}
                <motion.circle
                    cx="20"
                    cy="20"
                    r="4"
                    fill={pad1Active}
                    filter="url(#pcb-glow)"
                    style={{ scale: pad1Scale, transformOrigin: "20px 20px" }}
                    className="transition-colors duration-300"
                />

                {/* Pad 2: First Chamfer Bypass */}
                <motion.circle
                    cx="5"
                    cy="307"
                    r="4"
                    fill={pad2Active}
                    filter="url(#pcb-glow)"
                    style={{ scale: pad2Scale, transformOrigin: "5px 307px" }}
                    className="transition-colors duration-300"
                />

                {/* Pad 3: Second Chamfer Bypass */}
                <motion.circle
                    cx="35"
                    cy="657"
                    r="4"
                    fill={pad3Active}
                    filter="url(#pcb-glow)"
                    style={{ scale: pad3Scale, transformOrigin: "35px 657px" }}
                    className="transition-colors duration-300"
                />

                {/* Pad 4: End (Bottom) */}
                <motion.circle
                    cx="20"
                    cy="980"
                    r="4"
                    fill={pad4Active}
                    filter="url(#pcb-glow)"
                    style={{ scale: pad4Scale, transformOrigin: "20px 980px" }}
                    className="transition-colors duration-300"
                />
            </svg>
        </div>
    );
}
