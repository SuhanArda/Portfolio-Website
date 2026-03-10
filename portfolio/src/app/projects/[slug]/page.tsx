import { experienceItems } from "@/lib/data";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NetworkBackground from "@/components/NetworkBackground";
import CustomCursor from "@/components/CustomCursor";

export default function ProjectDetails({ params }: { params: { slug: string } }) {
    const project = experienceItems.find(p => p.slug === params.slug);

    if (!project) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-center mt-20">
                    <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
                    <Link href="/" className="px-6 py-3 border border-white/10 rounded-full hover:bg-white/10 transition-colors inline-block mt-4">
                        Return to Portfolio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 sm:px-12 max-w-5xl mx-auto relative z-10">
            <CustomCursor />
            <NetworkBackground />

            <Link href="/#projects" className="inline-flex items-center text-gray-400 hover:text-white mb-12 transition-colors group">
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Portfolio
            </Link>

            <div className="glass-card rounded-[2rem] p-8 sm:p-14 relative overflow-hidden shadow-2xl">
                {/* Glow effect matching the project card */}
                <div className={`absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br ${project.color} rounded-full blur-[120px] opacity-20 pointer-events-none`} />
                <div className={`absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr ${project.color} rounded-full blur-[120px] opacity-10 pointer-events-none`} />

                <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10 relative z-10">
                    <div className="bg-black/40 p-5 rounded-2xl border border-white/10 backdrop-blur-sm self-start sm:self-auto">
                        {project.icon}
                    </div>
                    <div>
                        <div className="text-sm font-mono tracking-widest text-[#00ccff] uppercase mb-2">
                            {project.type}
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-tight">
                            {project.title}
                        </h1>
                    </div>
                </div>

                <div className="border-t border-white/10 my-10 relative z-10"></div>

                <div className="space-y-8 text-gray-300 leading-relaxed text-lg relative z-10">
                    <div className="text-xl sm:text-2xl text-white font-medium leading-snug">
                        "{project.description}"
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold text-white mt-12 mb-6 flex items-center gap-3">
                            <span className="w-8 h-[1px] bg-[#00ccff]"></span>
                            Overview & Details
                        </h2>
                        <p className="mb-4 text-gray-400">
                            This is a dedicated detailed view of the <strong className="text-white font-medium">{project.title}</strong>.
                            Currently showcasing the initial overview. In the final version, this section will include an in-depth dive into the problem statement, the engineering process, the challenges overcome, and the specific technical implementations.
                        </p>
                        <p className="text-gray-400">
                            The project highlights a deep understanding of <strong className="text-[#ff3366]">{project.type}</strong>, leveraging robust architectures to deliver high-quality, scalable results.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 bg-black/20 p-8 rounded-2xl border border-white/5">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Core Technologies</h3>
                            <div className="flex flex-wrap gap-2">
                                {["C/C++", "Java", "Python", "React", "Node.js", "Matlab", "Unity"].map((tech, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors cursor-default">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">Key Metrics</h3>
                            <ul className="space-y-3 text-sm text-gray-400">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00ccff]"></div>
                                    High Performance execution
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff3366]"></div>
                                    Optimized resource management
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                    Scalable & maintanable architecture
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
