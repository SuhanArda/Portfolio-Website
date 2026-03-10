"use client";
import React, { useEffect, useRef } from "react";

export default function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        const fontSize = 10; // Smaller font size
        let columns = Math.floor(width / fontSize);
        // Initialize drops off-screen so it starts clean
        let drops: number[] = new Array(columns).fill(Math.floor(height / fontSize) + 1);

        let inactiveFrames = 0;

        // High-tech matrix characters
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|<>?/\\~".split("");

        const draw = () => {
            let anyActive = false;
            for (let i = 0; i < drops.length; i++) {
                if (drops[i] * fontSize <= height) {
                    anyActive = true;
                    break;
                }
            }

            if (!anyActive) {
                if (inactiveFrames > 80) {
                    // Fully clear after system is totally faded out to save CPU
                    ctx.clearRect(0, 0, width, height);
                    return; // Skip drawing to heavily save CPU when idle
                }
                inactiveFrames++;
            } else {
                inactiveFrames = 0;
            }

            // Normal tail fade. We use slightly higher alpha (0.15) so ghosts disappear faster naturally.
            // When inactive for 20 frames, we start smoothly increasing fill block alpha
            // to completely black out ghosts seamlessly without a pop.
            let alpha = 0.15;
            if (inactiveFrames > 20) {
                alpha = Math.min(0.15 + (inactiveFrames - 20) * 0.02, 1);
            }

            // Fade effect to show trails.
            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, width, height);

            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                if (drops[i] * fontSize > height) continue;

                // Drop a random character
                const text = chars[Math.floor(Math.random() * chars.length)];

                // Calculate vertical position percentage (0 = top, 1 = bottom)
                const yPos = drops[i] * fontSize;
                const progress = yPos / height;

                // Fade out characters slowly as they reach the bottom half of the screen
                let textAlpha = 1;
                if (progress > 0.6) {
                    // Start fading out when 60% down
                    textAlpha = Math.max(0, 1 - ((progress - 0.6) / 0.4));
                }

                // Randomly make some characters white or primary color for glitch feel
                if (Math.random() > 0.98) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
                } else if (Math.random() > 0.99) {
                    ctx.fillStyle = `rgba(255, 51, 102, ${textAlpha})`; // #ff3366
                } else {
                    ctx.fillStyle = `rgba(0, 204, 255, ${textAlpha})`;  // #00ccff
                }

                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                drops[i]++;
            }
        };

        const intervalId = setInterval(draw, 33); // ~30 FPS

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            columns = Math.floor(width / fontSize);
            drops = new Array(columns).fill(Math.floor(height / fontSize) + 1);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const col = Math.floor(e.clientX / fontSize);
            if (col >= 0 && col < drops.length) {
                // Set drop to Y position of mouse so it falls downwards from the cursor
                const headY = Math.floor(e.clientY / fontSize);
                drops[col] = headY;

                // Add a trailing splash to adjacent columns
                if (col - 1 >= 0) drops[col - 1] = headY - Math.floor(Math.random() * 4);
                if (col + 1 < drops.length) drops[col + 1] = headY - Math.floor(Math.random() * 4);
                if (col - 2 >= 0) drops[col - 2] = headY - Math.floor(Math.random() * 8) - 2;
                if (col + 2 < drops.length) drops[col + 2] = headY - Math.floor(Math.random() * 8) - 2;
            }
        };

        window.addEventListener("resize", handleResize);
        window.addEventListener("mousemove", handleMouseMove);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[-2] opacity-80 mix-blend-screen"
        />
    );
}
