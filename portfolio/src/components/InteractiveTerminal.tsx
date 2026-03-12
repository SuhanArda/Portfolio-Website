"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TerminalLine {
    type: "input" | "output" | "system";
    content: string;
}

interface InteractiveTerminalProps {
    isOpen: boolean;
    onClose: () => void;
}

const BOOT_SEQUENCE = [
    "Initializing root shell...",
    "Loading kernel modules... [OK]",
    "Mounting filesystem... [OK]",
    "Type 'help' to see available commands.",
    "─────────────────────────────────────────",
];

export default function InteractiveTerminal({ isOpen, onClose }: InteractiveTerminalProps) {
    const [history, setHistory] = useState<TerminalLine[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [booted, setBooted] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Boot sequence on open
    useEffect(() => {
        if (!isOpen) {
            setHistory([]);
            setBooted(false);
            setInputValue("");
            return;
        }

        let i = 0;
        setHistory([]);
        setBooted(false);

        const interval = setInterval(() => {
            if (i < BOOT_SEQUENCE.length) {
                const line = BOOT_SEQUENCE[i];
                setHistory(prev => [...prev, { type: "system", content: line }]);
                i++;
            } else {
                clearInterval(interval);
                setBooted(true);
            }
        }, 180);

        return () => clearInterval(interval);
    }, [isOpen]);

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    // Auto-focus input
    useEffect(() => {
        if (booted && inputRef.current) {
            inputRef.current.focus();
        }
    }, [booted]);

    const processCommand = useCallback((cmd: string) => {
        const trimmed = cmd.trim().toLowerCase();

        const newLines: TerminalLine[] = [
            { type: "input", content: cmd },
        ];

        switch (trimmed) {
            case "help":
                newLines.push({
                    type: "output",
                    content: [
                        "Available commands:",
                        "  whoami     — Identity information",
                        "  education  — Academic background",
                        "  projects   — Featured projects",
                        "  clear      — Clear terminal screen",
                        "  exit       — Close this terminal",
                    ].join("\n"),
                });
                break;
            case "whoami":
                newLines.push({
                    type: "output",
                    content: "Suhan Arda Öner. Dual-Degree Engineer (CS + Mechatronics).\nBridging software architecture with hardware logic.",
                });
                break;
            case "education":
                newLines.push({
                    type: "output",
                    content: "Kadir Has University — 3rd Year.\nComputer Engineering & Mechatronics Engineering.",
                });
                break;
            case "projects":
                newLines.push({
                    type: "output",
                    content: [
                        "1. AI-Powered Dance App      (Python/Gemini API)",
                        "2. RBAC Management System    (Java/OOP)",
                        "3. Local Greengrocer Inventory & Sales System (Java)",
                        "4. Interactive Java Console Application (Java)",
                        "5. SenseGlove-Cube-Triangle-Controller (C#/Unity/SenseGlove API)",
                        "6. Portfolio-Website (Next.js/TypeScript/Tailwind CSS/Framer Motion)",
                        "7. Interactive Terminal (Next.js/TypeScript/React)",
                    ].join("\n"),
                });
                break;
            case "clear":
                setHistory([]);
                setInputValue("");
                setTimeout(() => inputRef.current?.focus(), 0);
                return;
            case "exit":
                onClose();
                return;
            case "":
                break;
            default:
                newLines.push({
                    type: "output",
                    content: `bash: ${trimmed}: command not found. Type 'help' for available commands.`,
                });
        }

        setHistory(prev => [...prev, ...newLines]);
        setInputValue("");
        setTimeout(() => inputRef.current?.focus(), 0);
    }, [onClose]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            processCommand(inputValue);
        }
        if (e.key === "Escape") {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
                >
                    {/* Blurred backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

                    {/* Terminal Window */}
                    <motion.div
                        className="relative w-full max-w-2xl mx-4 rounded-xl overflow-hidden shadow-[0_0_80px_rgba(0,255,100,0.15)] border border-[#00ff6622]"
                        style={{ background: "#0a0e0a", fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace" }}
                        initial={{ scale: 0.85, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.85, y: 40, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                        {/* Title Bar */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#111811] border-b border-[#00ff6618]">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={onClose}
                                    className="w-3 h-3 rounded-full bg-[#ff5f56] hover:brightness-110 transition-all"
                                    aria-label="Close terminal"
                                />
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                            </div>
                            <span className="text-[#00ff66] text-xs opacity-60 tracking-widest uppercase">
                                root@suhanarda — bash
                            </span>
                            <span className="text-[#00ff66] text-xs opacity-30">⌘</span>
                        </div>

                        {/* Terminal Body */}
                        <div
                            className="h-96 overflow-y-auto p-4 text-sm leading-relaxed"
                            style={{ color: "#00ff66" }}
                            onClick={() => inputRef.current?.focus()}
                        >
                            {/* History Lines */}
                            {history.map((line, i) => (
                                <div key={i} className="mb-1">
                                    {line.type === "input" && (
                                        <div className="flex gap-2">
                                            <span className="text-[#ff3366] shrink-0">guest@suhanarda:~$</span>
                                            <span className="text-[#e0ffe0]">{line.content}</span>
                                        </div>
                                    )}
                                    {line.type === "output" && (
                                        <pre className="whitespace-pre-wrap text-[#00ff99] opacity-90 pl-0 ml-0">{line.content}</pre>
                                    )}
                                    {line.type === "system" && (
                                        <div className="text-[#00ccff] opacity-60 italic">{line.content}</div>
                                    )}
                                </div>
                            ))}

                            {/* Active Input Row */}
                            {booted && (
                                <div className="flex gap-2 items-center mt-1">
                                    <span className="text-[#ff3366] shrink-0">guest@suhanarda:~$</span>
                                    <div className="relative flex-1">
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="w-full bg-transparent outline-none border-none text-[#e0ffe0] caret-[#00ff66]"
                                            style={{ fontFamily: "inherit", fontSize: "inherit" }}
                                            autoComplete="off"
                                            spellCheck={false}
                                            aria-label="Terminal input"
                                        />
                                    </div>
                                </div>
                            )}

                            <div ref={bottomRef} />
                        </div>

                        {/* Status Bar */}
                        <div className="flex items-center justify-between px-4 py-2 bg-[#111811] border-t border-[#00ff6618] text-[10px] text-[#00ff66] opacity-40">
                            <span>ESC or click outside to close</span>
                            <span className="animate-pulse">● CONNECTED</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}