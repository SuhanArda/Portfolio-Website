"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import FloatingAICore from "@/components/FloatingAICore";

export default function LayoutClient() {
  const pathname = usePathname();
  const showAICore = !pathname.includes("/github-city");

  // Cyberpunk glitch tab title
  useEffect(() => {
    const baseText = "SUHAN_ARDA_ONER-PORTFOLIO";
    const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?10X█▓▒░";
    const intervalId = setInterval(() => {
      let glitched = "";
      for (let i = 0; i < baseText.length; i++) {
        glitched += Math.random() < 0.9
          ? baseText[i]
          : glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      document.title = glitched;
    }, 150);

    return () => clearInterval(intervalId);
  }, []);

  return showAICore ? <FloatingAICore /> : null;
}
