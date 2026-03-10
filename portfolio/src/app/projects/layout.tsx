export default function ProjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen relative selection:bg-[#ff3366] selection:text-white">
            {children}
            <footer className="w-full text-center py-8 text-gray-500 text-sm mt-20 border-t border-white/5 relative z-10 glass-card">
                <p>© {new Date().getFullYear()} Suhan Arda Öner. Crafted with logic & creativity.</p>
            </footer>
        </div>
    );
}
