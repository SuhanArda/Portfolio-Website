"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { experienceItems } from "@/lib/data";
export default function Experience() {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <section id="projects" className="py-20 px-6 sm:px-12 relative z-10 w-full max-w-7xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-16 text-center"
            >
                <h2 className="text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 font-bold mb-4">
                    Experience & Achievements
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    A showcase of my dual major background pushing boundaries in robotics,
                    software architecture, and security.
                </p>
            </motion.div>

            {/* Static Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experienceItems.map((item) => (
                    <motion.div
                        layoutId={`card-${item.slug}`}
                        key={item.slug}
                        onClick={() => setSelectedId(item.slug)}
                        className="glass-card border border-white/5 bg-[#0a0a0a]/80 backdrop-blur-sm rounded-2xl p-8 h-[280px] flex flex-col group relative overflow-hidden cursor-pointer hover:border-white/10 hover:bg-[#111] transition-colors shadow-lg hover:shadow-[0_0_20px_rgba(0,204,255,0.05)]"
                    >
                        <motion.div layoutId={`icon-${item.slug}`} className="mb-8 w-14 h-14 rounded-2xl bg-black/40 flex items-center justify-center border border-white/5 border-t-white/10 shadow-inner group-hover:border-[#00ccff]/30 transition-colors">
                            {item.icon}
                        </motion.div>

                        <motion.div layoutId={`type-${item.slug}`} className="text-[11px] font-mono tracking-[0.2em] text-[#00ccff] mb-3 uppercase">
                            {item.type}
                        </motion.div>
                        <motion.h3 layoutId={`title-${item.slug}`} className="text-xl sm:text-2xl font-semibold mb-4 text-white hover:text-gray-200 py-1 transition-colors leading-tight">
                            {item.title}
                        </motion.h3>
                        <motion.p layoutId={`desc-${item.slug}`} className="text-gray-400 text-[15px] leading-relaxed mt-auto">
                            {item.description}
                        </motion.p>
                    </motion.div>
                ))}
            </div>

            {/* Expanded Modal Overlay */}
            <AnimatePresence>
                {selectedId && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedId(null)}
                            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md"
                        />
                        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 sm:p-12 pointer-events-none">
                            {experienceItems.filter(item => item.slug === selectedId).map(item => (
                                <motion.div
                                    layoutId={`card-${item.slug}`}
                                    key={`modal-${item.slug}`}
                                    className="glass-card bg-[#0f0f0f] border border-white/10 rounded-3xl p-8 sm:p-12 w-full max-w-3xl relative overflow-y-auto max-h-[90vh] pointer-events-auto shadow-[0_0_80px_rgba(0,204,255,0.05)]"
                                >
                                    <button
                                        onClick={() => setSelectedId(null)}
                                        className="absolute top-6 right-6 sm:top-8 sm:right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-[#ff3366] transition-colors z-10 group"
                                    >
                                        <X className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                    </button>

                                    <div className="flex flex-col sm:flex-row sm:items-start gap-6 sm:gap-8 mb-8">
                                        <motion.div layoutId={`icon-${item.slug}`} className="w-20 h-20 flex-shrink-0 rounded-3xl bg-black/50 flex items-center justify-center border border-white/10 shadow-2xl">
                                            {/* Increase Icon size for modal by cloning icon */}
                                            <div className="scale-125">
                                                {item.icon}
                                            </div>
                                        </motion.div>

                                        <div className="pt-2">
                                            <motion.div layoutId={`type-${item.slug}`} className="text-xs sm:text-sm font-mono tracking-[0.2em] text-[#00ccff] mb-3 uppercase">
                                                {item.type}
                                            </motion.div>

                                            <motion.h3 layoutId={`title-${item.slug}`} className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                                                {item.title}
                                            </motion.h3>
                                        </div>
                                    </div>

                                    <motion.p layoutId={`desc-${item.slug}`} className="text-gray-300 text-lg leading-relaxed mb-10 hidden sm:block font-medium">
                                        {item.description}
                                    </motion.p>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15, duration: 0.4 }}
                                        className="mt-8 pt-8 border-t border-white/10"
                                    >
                                        <h4 className="text-white text-xl font-semibold mb-4 flex items-center gap-3">
                                            <span className="w-6 h-[1px] bg-[#00ccff]"></span>
                                            Expanded Details
                                        </h4>
                                        <p className="text-gray-400 text-lg leading-relaxed">
                                            {item.expandedDetails}
                                        </p>
                                    </motion.div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}
            </AnimatePresence>
        </section>
    );
}
