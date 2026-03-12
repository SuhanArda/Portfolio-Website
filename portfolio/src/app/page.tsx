"use client";
import Hero from "@/components/Hero";
import Experience from "@/components/Experience";
import NetworkBackground from "@/components/NetworkBackground";
import CustomCursor from "@/components/CustomCursor";
import MatrixRain from "@/components/MatrixRain";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import PCBScrollProgress from "@/components/PCBScrollProgress";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <PCBScrollProgress />
      <CustomCursor />
      <ThemeSwitcher />
      <MatrixRain />
      <NetworkBackground />
      <Hero />
      <Experience />

      <footer className="w-full text-center py-8 text-gray-500 text-sm mt-20 border-t border-white/5 relative z-10 glass-card">
        <p>© {new Date().getFullYear()} Suhan Arda Öner. Crafted with logic & creativity.</p>
      </footer>
    </main>
  );
}
