"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ExternalLink, Code2, Github } from "lucide-react";

interface ProjectDetails {
    id: number;
    title: string;
    techStack: string[];
    description: string;
    githubUrl?: string;
}

export default function DetailedProjectCard({ project }: { project: ProjectDetails }) {
    // ... preserving other parts ...
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            layout
            // Transition handles the height expansion smoothness
            transition={{ layout: { duration: 0.4, type: "spring", bounce: 0.1 } }}
            className={`
                relative w-full rounded-2xl overflow-hidden cursor-pointer
                border border-white/5 bg-black/40 backdrop-blur-md
                transition-all duration-300 group
                ${isOpen ? 'border-[#00ccff]/50 shadow-[0_0_30px_rgba(0,204,255,0.15)]' : 'hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]'}
            `}
            onClick={() => setIsOpen(!isOpen)}
        >
            {/* Conditional Neon Glow that follows the theme (cyan/pink) when hovered or open */}
            <div className={`absolute -inset-[1px] bg-gradient-to-r from-[#00ccff] to-[#ff3366] rounded-2xl z-[-1] opacity-0 transition-opacity duration-500 blur-sm ${isOpen ? 'opacity-30' : 'group-hover:opacity-20'}`} />

            <div className="p-6 sm:p-8">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/10 group-hover:border-[#00ccff] transition-colors">
                            <Code2 className={`w-6 h-6 ${isOpen ? 'text-[#00ccff]' : 'text-gray-400 group-hover:text-white'} transition-colors`} />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                            {project.title}
                        </h3>
                    </div>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className={`p-2 rounded-full flex-shrink-0 ${isOpen ? 'bg-[#00ccff]/20 text-[#00ccff]' : 'bg-white/5 text-gray-400 group-hover:bg-white/10'} transition-colors`}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </div>

                <div className="flex flex-wrap gap-2 mt-6">
                    {project.techStack.map((tech, idx) => (
                        <span
                            key={idx}
                            className="px-3 py-1 bg-black/40 border border-white/10 text-[#00ccff] text-xs font-mono rounded-full uppercase tracking-wider"
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
                                            className="flex items-center gap-2 text-sm text-[#ff3366] hover:text-white transition-colors font-medium border border-[#ff3366]/30 hover:bg-[#ff3366]/10 px-4 py-2 rounded-lg"
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
