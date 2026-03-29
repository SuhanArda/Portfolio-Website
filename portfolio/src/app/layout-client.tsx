"use client";

import { usePathname } from "next/navigation";
import FloatingAICore from "@/components/FloatingAICore";

export default function LayoutClient() {
  const pathname = usePathname();
  const showAICore = !pathname.includes("/github-city");
  const isMainPage = pathname === "/";


  return (
    <>
      {showAICore && <FloatingAICore />}
    </>
  );
}