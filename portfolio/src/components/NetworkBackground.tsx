"use client";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

export default function NetworkBackground() {
    const [init, setInit] = useState(false);
    const { theme } = useTheme();

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springConfig = { damping: 40, stiffness: 80, mass: 1 };
    const smoothX = useSpring(mouseX, springConfig);
    const smoothY = useSpring(mouseY, springConfig);

    useEffect(() => {
        initParticlesEngine(async (engine: Engine) => {
            await loadSlim(engine);
        }).then(() => {
            setInit(true);
        });

        const handleMouseMove = (e: MouseEvent) => {
            const offsetX = (window.innerWidth / 2 - e.clientX) / 40;
            const offsetY = (window.innerHeight / 2 - e.clientY) / 40;
            mouseX.set(offsetX);
            mouseY.set(offsetY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [mouseX, mouseY]);

    if (!init) return null;

    const isHardware = theme === "hardware";

    return (
        <motion.div
            className="fixed inset-0 z-[-1] pointer-events-none scale-[1.05]"
            style={{ x: smoothX, y: smoothY }}
        >
            <Particles
                id="tsparticles"
                key={theme}
                options={{
                    fpsLimit: 120,
                    interactivity: {
                        events: {
                            onHover: {
                                enable: true,
                                mode: "grab",
                            },
                        },
                        modes: {
                            grab: {
                                distance: 140,
                                links: {
                                    opacity: 0.8,
                                    color: isHardware ? "#fbbf24" : "#00ccff",
                                },
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: isHardware ? "#d97706" : "#ff3366",
                        },
                        links: {
                            color: isHardware ? "#fbbf2480" : "#ffffff",
                            distance: 150,
                            enable: true,
                            opacity: isHardware ? 0.35 : 0.2,
                            width: isHardware ? 1.5 : 1,
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: {
                                default: "bounce",
                            },
                            random: true,
                            speed: isHardware ? 0.3 : 1,
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                width: 800,
                                height: 800,
                            },
                            value: 80,
                        },
                        opacity: {
                            value: isHardware ? 0.7 : 0.5,
                        },
                        shape: {
                            type: isHardware ? "edge" : "circle",
                        },
                        size: {
                            value: isHardware
                                ? { min: 1.5, max: 3.5 }
                                : { min: 1, max: 3 },
                        },
                    },
                    detectRetina: true,
                }}
            />
        </motion.div>
    );
}
