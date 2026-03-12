"use client";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Code2, Github } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface ProjectDetails {
    id: number;
    title: string;
    techStack: string[];
    description: string;
    githubUrl?: string;
}

export default function DetailedProjectCard({
    project,
    isOpen,
    onToggle
}: {
    project: ProjectDetails;
    isOpen: boolean;
    onToggle: () => void;
}) {
    const { theme } = useTheme();
    const hw = theme === "hardware";

    return (
        <motion.div
            layout
            transition={{ layout: { duration: 0.4, type: "spring", bounce: 0.1 } }}
            className={`
                relative w-full overflow-hidden cursor-pointer
                transition-all duration-500 group
                ${hw
                    ? `rounded-sm border-[1.5px] bg-[#0a192f]/60 backdrop-blur-none
                       ${isOpen ? 'border-[#d97706]/50 shadow-[0_0_30px_rgba(217,119,6,0.1)]' : 'border-white/15 hover:border-[#fbbf24]/30 hover:shadow-[0_0_20px_rgba(251,191,36,0.05)]'}`
                    : `rounded-2xl border bg-black/40 backdrop-blur-md
                       border-white/5 ${isOpen ? 'border-[#00ccff]/50 shadow-[0_0_30px_rgba(0,204,255,0.15)]' : 'hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'}`
                }
            `}
            onClick={onToggle}
        >
            {/* Conditional Glow */}
            {!hw && (
                <div className={`absolute -inset-[1px] bg-gradient-to-r from-[#00ccff] to-[#ff3366] rounded-2xl z-[-1] opacity-0 transition-opacity duration-500 blur-sm ${isOpen ? 'opacity-30' : 'group-hover:opacity-20'}`} />
            )}

            <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        <div
                            className={`p-3 border transition-colors ${
                                hw
                                    ? "rounded-sm bg-white/5 border-white/10 group-hover:border-[#d97706]"
                                    : "rounded-xl bg-white/5 border-white/10 group-hover:border-[#00ccff]"
                            }`}
                        >
                            <Code2
                                className={`w-6 h-6 transition-colors ${
                                    isOpen
                                        ? hw ? "text-[#d97706]" : "text-[#00ccff]"
                                        : hw
                                            ? "text-gray-400 group-hover:text-[#fbbf24]"
                                            : "text-gray-400 group-hover:text-white"
                                }`}
                            />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {project.title}
                        </h3>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-2 rounded-full flex-shrink-0 transition-colors ${
                            isOpen
                                ? hw
                                    ? "bg-[#d97706]/20 text-[#d97706]"
                                    : "bg-[#00ccff]/20 text-[#00ccff]"
                                : "bg-white/5 text-gray-400 group-hover:bg-white/10"
                        }`}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                    {project.techStack.map((tech, idx) => (
                        <span
                            key={idx}
                            className={`px-3 py-1 text-xs font-mono rounded-full uppercase tracking-wider transition-colors duration-500 ${
                                hw
                                    ? "bg-[#0a192f]/60 border border-white/15 text-[#fbbf24]"
                                    : "bg-black/40 border border-white/10 text-[#00ccff]"
                            }`}
                        >
                            {tech}
                        </span>
                    ))}
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <p className="text-gray-300 leading-relaxed text-[15px] sm:text-base font-sans">
                                    {project.description}
                                </p>

                                {project.githubUrl && (
                                    <div className="mt-6 flex justify-end">
                                        <a
                                            href={project.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors border ${
                                                hw
                                                    ? "text-[#d97706] border-[#d97706]/30 hover:bg-[#d97706]/10 hover:text-white"
                                                    : "text-[#ff3366] border-[#ff3366]/30 hover:bg-[#ff3366]/10 hover:text-white"
                                            }`}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Github className="w-4 h-4" />
                                            GitHub
                                        </a>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
