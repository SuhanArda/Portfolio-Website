"use client";
import React, { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

export default function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { theme } = useTheme();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // If hardware mode, don't draw at all
        if (theme === "hardware") {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);
        const fontSize = 10;
        let columns = Math.floor(width / fontSize);
        let drops: number[] = new Array(columns).fill(Math.floor(height / fontSize) + 1);

        let inactiveFrames = 0;

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
                    ctx.clearRect(0, 0, width, height);
                    return;
                }
                inactiveFrames++;
            } else {
                inactiveFrames = 0;
            }

            let alpha = 0.15;
            if (inactiveFrames > 20) {
                alpha = Math.min(0.15 + (inactiveFrames - 20) * 0.02, 1);
            }

            ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
            ctx.fillRect(0, 0, width, height);

            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                if (drops[i] * fontSize > height) continue;

                const text = chars[Math.floor(Math.random() * chars.length)];

                const yPos = drops[i] * fontSize;
                const progress = yPos / height;

                let textAlpha = 1;
                if (progress > 0.6) {
                    textAlpha = Math.max(0, 1 - ((progress - 0.6) / 0.4));
                }

                if (Math.random() > 0.98) {
                    ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`;
                } else if (Math.random() > 0.99) {
                    ctx.fillStyle = `rgba(255, 51, 102, ${textAlpha})`;
                } else {
                    ctx.fillStyle = `rgba(0, 204, 255, ${textAlpha})`;
                }

                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                drops[i]++;
            }
        };

        const intervalId = setInterval(draw, 33);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            columns = Math.floor(width / fontSize);
            drops = new Array(columns).fill(Math.floor(height / fontSize) + 1);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const col = Math.floor(e.clientX / fontSize);
            if (col >= 0 && col < drops.length) {
                const headY = Math.floor(e.clientY / fontSize);
                drops[col] = headY;

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
    }, [theme]);

    return (
        <div
            className="fixed inset-0 pointer-events-none z-[-2] transition-opacity duration-700"
            style={{ opacity: theme === "hardware" ? 0 : 0.8 }}
        >
            <canvas
                ref={canvasRef}
                className="w-full h-full mix-blend-screen"
            />
        </div>
    );
}
