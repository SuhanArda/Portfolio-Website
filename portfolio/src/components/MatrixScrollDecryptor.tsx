"use client";

import React, { useEffect, useState } from "react";
import { useScroll, useSpring, useTransform, motion } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";

const CHAR_COUNT = 50;
const MATRIX_CHARS = "&#%@!*&{}[]()<>~|\\/=?";

function MatrixChar({ index, scrollProgress, total }: { index: number, scrollProgress: any, total: number }) {
  const [initChar, setInitChar] = useState("");
  const [decryptedChar, setDecryptedChar] = useState("");

  useEffect(() => {
    // Generate static encrypted char once on mount to avoid hydration mismatch
    setInitChar(MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]);
    // Generate the decrypted 0 or 1
    setDecryptedChar(Math.random() > 0.5 ? "1" : "0");
  }, []);

  // Distance from this character's base position (0 to 1) to the current scroll progress
  // We want to highlight characters that are very close to the current scroll position.
  const itemProgress = index / (total - 1);
  const threshold = 0.05; // 5% of the total scroll distance constitutes the "laser" height.

  // Using a custom transform function to determine if it's active
  const distance = useTransform(scrollProgress, (p: number) => Math.abs(p - itemProgress));
  
  // Opacity: faint when far away, bright when close
  const opacity = useTransform(distance, [0, threshold, threshold + 0.05], [1, 1, 0.2]);
  
  // Color: bright blue when very close, dark blue when far
  const color = useTransform(
    distance,
    [0, threshold/2, threshold],
    ["#00ccff", "#00ccff", "#002033"]
  );

  // Text Shadow (Glow): only when extremely close
  const textShadow = useTransform(
    distance,
    [0, threshold/2, threshold],
    [
      "0 0 8px rgba(0,204,255,0.8), 0 0 12px rgba(0,204,255,0.6)",
      "0 0 8px rgba(0,204,255,0.8), 0 0 12px rgba(0,204,255,0.6)",
      "none"
    ]
  );

  // We toggle between initChar and decryptedChar based on distance. 
  // We can't transform content directly with Framer Motion, but we can read the latest of distance inside a render.
  // A better way is to use state tied to framer motion's onChange.
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const unsubscribe = distance.on("change", (v) => {
      if (v < threshold && !isActive) setIsActive(true);
      else if (v >= threshold && isActive) setIsActive(false);
    });
    return () => unsubscribe();
  }, [distance, threshold, isActive]);

  if (!initChar) return <div className="h-full flex items-center justify-center text-transparent">0</div>;

  return (
    <motion.div
      style={{
        opacity,
        color,
        textShadow,
      }}
      className="flex-1 flex items-center justify-center w-full"
    >
      {isActive ? decryptedChar : initChar}
    </motion.div>
  );
}

export default function MatrixScrollDecryptor() {
  const { theme } = useTheme();
  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 50,
    damping: 15,
    restDelta: 0.001
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (theme !== "software") return null;

  return (
    <div className="fixed right-0 top-0 h-full w-8 lg:w-12 z-50 pointer-events-none flex flex-col items-center justify-between py-2 text-[10px] lg:text-xs font-mono font-bold select-none">
      {Array.from({ length: CHAR_COUNT }).map((_, i) => (
        <MatrixChar 
          key={i} 
          index={i} 
          scrollProgress={smoothProgress} 
          total={CHAR_COUNT} 
        />
      ))}
    </div>
  );
}
