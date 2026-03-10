"use client";
import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Smooth follow for the outer circle
    const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
    const smoothX = useSpring(cursorX, springConfig);
    const smoothY = useSpring(cursorY, springConfig);

    useEffect(() => {
        // Hide cursor on touch devices or show it
        setIsVisible(true);

        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleMouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName.toLowerCase() === "a" ||
                target.tagName.toLowerCase() === "button" ||
                target.closest("a") ||
                target.closest("button") ||
                target.closest(".glass-card") ||
                getComputedStyle(target).cursor === "pointer"
            ) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener("mousemove", moveCursor);
        window.addEventListener("mouseover", handleMouseOver);
        return () => {
            window.removeEventListener("mousemove", moveCursor);
            window.removeEventListener("mouseover", handleMouseOver);
        };
    }, [cursorX, cursorY]);

    if (!isVisible) return null;

    return (
        <>
            {/* Center sharp dot */}
            <motion.div
                className="fixed top-0 left-0 w-[6px] h-[6px] bg-[#ff3366] rounded-full pointer-events-none z-[9999]"
                style={{
                    x: cursorX,
                    y: cursorY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            />

            {/* Outer rotating circle with spring delay */}
            <motion.div
                className="fixed top-0 left-0 w-10 h-10 pointer-events-none z-[9998]"
                style={{
                    x: smoothX,
                    y: smoothY,
                    translateX: "-50%",
                    translateY: "-50%",
                }}
            >
                <motion.div
                    className="w-full h-full rounded-full border-[1.5px] border-[#00ccff]/50"
                    animate={{
                        rotate: 360,
                        scale: isHovered ? 1.6 : 1,
                        backgroundColor: isHovered ? "rgba(0, 204, 255, 0.1)" : "rgba(0, 204, 255, 0)",
                        borderColor: isHovered ? "rgba(0, 204, 255, 0.8)" : "rgba(0, 204, 255, 0.5)",
                    }}
                    transition={{
                        rotate: { duration: 10, ease: "linear", repeat: Infinity },
                        scale: { type: "spring", stiffness: 300, damping: 20 },
                        backgroundColor: { duration: 0.2 },
                    }}
                    style={{
                        transformOrigin: "center center",
                    }}
                >
                    {/* Add tiny decorations to circle to make rotation visible */}
                    <div className="absolute top-[-2px] left-1/2 w-1 h-1 bg-[#00ccff] rounded-full -translate-x-1/2" />
                    <div className="absolute bottom-[-2px] left-1/2 w-1 h-1 bg-[#00ccff] rounded-full -translate-x-1/2" />
                </motion.div>
            </motion.div>
        </>
    );
}
