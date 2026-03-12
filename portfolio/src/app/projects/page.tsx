"use client";
import { useState } from "react";
import DetailedProjectCard from "@/components/DetailedProjectCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MatrixRain from "@/components/MatrixRain";
import CustomCursor from "@/components/CustomCursor";
import NetworkBackground from "@/components/NetworkBackground";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import PCBScrollProgress from "@/components/PCBScrollProgress";
import { useTheme } from "@/context/ThemeContext";

const detailedProjects = [
    {
        id: 1,
        title: "AI-Powered Real-Time Dance Feedback System",
        techStack: ["Python", "Flask", "JavaScript", "Gemini API"],
        description: "Developed a comprehensive AI-driven application designed to provide real-time feedback for hip-hop dance training. Leveraging Flask for the backend architecture and integrating the Gemini API, the system performs advanced pose estimation and spatial analysis. It incorporates a Retrieval-Augmented Generation (RAG) pipeline to cross-reference user movements against a knowledge base of professional dance standards, delivering context-aware, corrective motion suggestions and dynamic conversational responses to accelerate the learning curve.",
        githubUrl: "https://github.com/SuhanArda/DANS-EGITIM-UYGULAMASI-AI-DANCE"
    },
    {
        id: 2,
        title: "Interactive Dance Tracking Interface",
        techStack: ["JavaScript", "Frontend Web Technologies"],
        description: "Built a dynamic frontend tracking interface to capture and visualize real-time dance movement data. This application processes continuous user input, rendering complex motion metrics into an intuitive, user-friendly dashboard. It demonstrates proficiency in asynchronous JavaScript operations, state management, and real-time DOM manipulation to ensure seamless synchronization with AI backend services.",
        githubUrl: "https://github.com/SuhanArda/dance-tracker"
    },
    {
        id: 3,
        title: "Role-Based Contact Management System",
        techStack: ["Java", "OOP"],
        description: "Engineered a secure, enterprise-grade contact management backend using Java. The core architecture implements strict Role-Based Access Control (RBAC) mechanisms to ensure data security and privilege separation across different user tiers. The system is built upon robust Object-Oriented Programming principles, featuring modular design, encapsulated data models, and scalable authorization logic suitable for complex administrative environments.",
        githubUrl: "https://github.com/SuhanArda/Role-Based-Contact-Management-System"
    },
    {
        id: 4,
        title: "Local Greengrocer Inventory & Sales System",
        techStack: ["Java"],
        description: "Developed a comprehensive inventory and point-of-sale management application tailored for local retail operations. Written entirely in Java, this system handles dynamic stock tracking, price calculations, and transaction logging. It highlights a strong understanding of data structure optimization, backend business logic implementation, and efficient memory management to maintain high performance during continuous transactional loads.",
        githubUrl: "https://github.com/SuhanArda/Local-Greengrocer-Application"
    },
    {
        id: 5,
        title: "Interactive Java Console Application Suite",
        techStack: ["Java"],
        description: "Designed and implemented a suite of terminal-based Java applications focused on algorithmic efficiency and core computer science concepts. This suite serves as a sandbox for testing complex data manipulation, algorithmic problem-solving, and strict type safety within the Java ecosystem, showcasing a deep foundational knowledge of backend software development.",
        githubUrl: "https://github.com/SuhanArda/Java-Console-Application"
    },
    {
        id: 6,
        title: "SenseGlove-Cube-Triangle-Controller",
        techStack: ["C#", "Unity", "SenseGlove API"],
        description: "Developed an advanced haptic feedback controller application using Unity and the SenseGlove API. This project demonstrates expertise in integrating complex hardware interfaces with real-time simulation environments, enabling precise tactile feedback for virtual interactions.",
        githubUrl: "https://github.com/SuhanArda/SenseGlove-Cube-Triangle-Controller"
    },
    {
        id: 7,
        title: "Portfolio-Website",
        techStack: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
        description: "A modern, interactive portfolio website built with Next.js and Tailwind CSS. This project features a dynamic, AI-enhanced Matrix Rain background, a custom 3D-aware cursor, and a responsive, glassmorphic design system. It serves as a showcase of advanced frontend development techniques, including server-side rendering, client-side animations, and seamless integration with AI-generated visual effects.",
        githubUrl: "https://github.com/SuhanArda/Portfolio-Website"
    },
    {
        id: 8,
        title: "Digital-Memory-Architecture",
        techStack: ["Simulink", "MATLAB", "Verilog"],
        description: "A comprehensive digital memory architecture project developed using Simulink, MATLAB, and Verilog. This project demonstrates expertise in digital logic design, memory system modeling, and hardware description languages, showcasing a deep understanding of computer architecture principles.",
        githubUrl: "https://github.com/SuhanArda/Digital-Memory-Architecture"
    }
];

export default function ProjectsPage() {
    const [openProjectId, setOpenProjectId] = useState<number | null>(null);
    const { theme } = useTheme();
    const hw = theme === "hardware";

    const handleToggle = (id: number) => {
        setOpenProjectId(prev => (prev === id ? null : id));
    };

    return (
        <main className="min-h-screen pt-24 pb-20 px-6 sm:px-12 max-w-5xl mx-auto relative z-10">
            <PCBScrollProgress />
            <CustomCursor />
            <ThemeSwitcher />
            <MatrixRain />
            <NetworkBackground />

            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-12 transition-colors group">
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
            </Link>

            <div className="mb-16">
                <h1
                    className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text tracking-tight mb-4 transition-all duration-500"
                    style={{
                        backgroundImage: hw
                            ? "linear-gradient(to right, #fbbf24, #d97706)"
                            : "linear-gradient(to right, white, #9ca3af)",
                    }}
                >
                    {hw ? "Engineering Schematics & Projects" : "Software Architecture & Projects"}
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                    A deep dive into my advanced technical projects, ranging from AI-driven biomechanics analysis to enterprise-scale Java backend systems. Select a project to view the full architectural overview.
                </p>
            </div>

            <div className="space-y-6">
                {detailedProjects.map((project) => (
                    <DetailedProjectCard
                        key={project.id}
                        project={project}
                        isOpen={openProjectId === project.id}
                        onToggle={() => handleToggle(project.id)}
                    />
                ))}
            </div>

            {/* Ambient Background glow */}
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] opacity-[0.03] pointer-events-none z-[-1] transition-colors duration-700"
                style={{ backgroundColor: hw ? "#d97706" : "#00ccff" }}
            />
        </main>
    );
}
