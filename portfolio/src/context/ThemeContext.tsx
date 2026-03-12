"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type Theme = "software" | "hardware";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("software");

    // Read from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem("portfolio-theme") as Theme | null;
        if (stored === "software" || stored === "hardware") {
            setTheme(stored);
            document.documentElement.setAttribute("data-theme", stored);
        } else {
            document.documentElement.setAttribute("data-theme", "software");
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === "software" ? "hardware" : "software";
            document.documentElement.setAttribute("data-theme", next);
            localStorage.setItem("portfolio-theme", next);
            return next;
        });
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
