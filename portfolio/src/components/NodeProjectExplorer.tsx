"use client";

import React, { useRef, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/context/ThemeContext";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

const graphData = {
  nodes: [
    { id: "core", name: "Suhan Arda", group: 0, val: 30 }, // Increased core val
    { id: "ai_fs", name: "AI & Full-Stack Development", group: 1, val: 20 },
    { id: "backend", name: "Backend & Enterprise Systems", group: 1, val: 20 },
    { id: "hardware", name: "Hardware & HMI", group: 1, val: 20 },
    { id: "dance_ai", name: "AI-Powered Real-Time Dance Feedback System", group: 2, val: 12, techStack: "[Python, Flask, Gemini API]" },
    { id: "dance_ui", name: "Interactive Dance Tracking Interface", group: 2, val: 12, techStack: "[JS, Frontend]" },
    { id: "portfolio", name: "Portfolio-Website", group: 2, val: 12, techStack: "[Next.js, Framer Motion]" },
    { id: "contact_sys", name: "Role-Based Contact Management System", group: 2, val: 12, techStack: "[Java, OOP]" },
    { id: "inventory_sys", name: "Local Greengrocer Inventory & Sales System", group: 2, val: 12, techStack: "[Java]" },
    { id: "java_suite", name: "Interactive Java Console Application Suite", group: 2, val: 12, techStack: "[Java]" },
    { id: "senseglove", name: "SenseGlove-Cube-Triangle-Controller", group: 2, val: 12, techStack: "[C#, Unity, SenseGlove API]" },
    { id: "digital_mem", name: "Digital-Memory-Architecture", group: 2, val: 12, techStack: "[Simulink, MATLAB, Verilog]" },
  ],
  links: [
    { source: "core", target: "ai_fs" },
    { source: "core", target: "backend" },
    { source: "core", target: "hardware" },

    // AI & FS
    { source: "ai_fs", target: "dance_ai" },
    { source: "ai_fs", target: "dance_ui" },
    { source: "ai_fs", target: "portfolio" },

    // Backend
    { source: "backend", target: "contact_sys" },
    { source: "backend", target: "inventory_sys" },
    { source: "backend", target: "java_suite" },

    // Hardware
    { source: "hardware", target: "senseglove" },
    { source: "hardware", target: "digital_mem" },
  ]
};

// Canvas Drawing Helpers
const drawMicrochip = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, isSoftware: boolean) => {
  const size = radius * 1.5;
  const pinColor = isSoftware ? "#ffd700" : "#d97706";
  const bodyColor = isSoftware ? "#ff003c" : "#1a1a1a";
  const glowColor = isSoftware ? "rgba(255, 0, 60, 0.8)" : "rgba(217, 119, 6, 0.8)";

  // Glow
  ctx.shadowColor = glowColor;
  ctx.shadowBlur = isSoftware ? 20 : 5;

  // Pins
  ctx.fillStyle = pinColor;
  const pinWidth = size * 0.15;
  const pinLength = size * 0.3;
  for (let i = -1; i <= 1; i++) {
    // Top/Bottom Pins
    ctx.fillRect(x + (i * size * 0.4) - pinWidth / 2, y - size - pinLength / 2, pinWidth, pinLength);
    ctx.fillRect(x + (i * size * 0.4) - pinWidth / 2, y + size - pinLength / 2, pinWidth, pinLength);
    // Left/Right Pins
    ctx.fillRect(x - size - pinLength / 2, y + (i * size * 0.4) - pinWidth / 2, pinLength, pinWidth);
    ctx.fillRect(x + size - pinLength / 2, y + (i * size * 0.4) - pinWidth / 2, pinLength, pinWidth);
  }

  // Body
  ctx.fillStyle = "#111"; // Dark base
  ctx.fillRect(x - size, y - size, size * 2, size * 2);

  ctx.fillStyle = bodyColor;
  ctx.fillRect(x - size * 0.8, y - size * 0.8, size * 1.6, size * 1.6);

  // Inner circuit lines
  ctx.strokeStyle = pinColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - size * 0.4, y);
  ctx.lineTo(x + size * 0.4, y);
  ctx.moveTo(x, y - size * 0.4);
  ctx.lineTo(x, y + size * 0.4);
  ctx.stroke();

  ctx.shadowBlur = 0; // Reset
};

const drawNeuralNet = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, isSoftware: boolean) => {
  const size = radius;
  const color = isSoftware ? "#00f0ff" : "#fbbf24";
  ctx.shadowColor = color;
  ctx.shadowBlur = isSoftware ? 15 : 2;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.5;

  const nodes = [
    { dx: -size, dy: -size * 0.5 }, { dx: -size, dy: size * 0.5 },
    { dx: 0, dy: -size }, { dx: 0, dy: 0 }, { dx: 0, dy: size },
    { dx: size, dy: -size * 0.5 }, { dx: size, dy: size * 0.5 }
  ];

  ctx.beginPath();
  // Layer 1 to 2
  ctx.moveTo(x + nodes[0].dx, y + nodes[0].dy); ctx.lineTo(x + nodes[2].dx, y + nodes[2].dy);
  ctx.moveTo(x + nodes[0].dx, y + nodes[0].dy); ctx.lineTo(x + nodes[3].dx, y + nodes[3].dy);
  ctx.moveTo(x + nodes[1].dx, y + nodes[1].dy); ctx.lineTo(x + nodes[3].dx, y + nodes[3].dy);
  ctx.moveTo(x + nodes[1].dx, y + nodes[1].dy); ctx.lineTo(x + nodes[4].dx, y + nodes[4].dy);

  // Layer 2 to 3
  ctx.moveTo(x + nodes[2].dx, y + nodes[2].dy); ctx.lineTo(x + nodes[5].dx, y + nodes[5].dy);
  ctx.moveTo(x + nodes[3].dx, y + nodes[3].dy); ctx.lineTo(x + nodes[5].dx, y + nodes[5].dy);
  ctx.moveTo(x + nodes[3].dx, y + nodes[3].dy); ctx.lineTo(x + nodes[6].dx, y + nodes[6].dy);
  ctx.moveTo(x + nodes[4].dx, y + nodes[4].dy); ctx.lineTo(x + nodes[6].dx, y + nodes[6].dy);
  ctx.stroke();

  nodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(x + n.dx, y + n.dy, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
};

const drawServerRack = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, isSoftware: boolean) => {
  const w = radius * 1.5;
  const h = radius * 2;
  const color = isSoftware ? "#00f0ff" : "#fbbf24";

  ctx.shadowColor = color;
  ctx.shadowBlur = isSoftware ? 15 : 2;
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  // Rack body
  ctx.fillRect(x - w, y - h, w * 2, h * 2);
  ctx.strokeRect(x - w, y - h, w * 2, h * 2);

  // Server units
  for (let i = 0; i < 3; i++) {
    const unitY = y - h + (i * h * 0.7) + (h * 0.2);
    ctx.strokeRect(x - w * 0.8, unitY, w * 1.6, h * 0.4);

    // Blinking lights (simulated static for canvas but colored)
    ctx.fillStyle = (i === 1) ? "#ff3366" : color;
    ctx.fillRect(x + w * 0.4, unitY + h * 0.1, h * 0.15, h * 0.15);
    ctx.fillRect(x + w * 0.6, unitY + h * 0.1, h * 0.15, h * 0.15);
  }
  ctx.shadowBlur = 0;
};

const drawGear = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, isSoftware: boolean) => {
  const color = isSoftware ? "#00f0ff" : "#fbbf24";
  ctx.shadowColor = color;
  ctx.shadowBlur = isSoftware ? 15 : 2;
  ctx.fillStyle = "rgba(0,0,0,0.8)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  const teeth = 8;
  const outerR = radius * 1.5;
  const innerR = radius * 1.1;
  const holeR = radius * 0.5;

  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / (teeth * 2)) * Math.PI * 2;
    if (i === 0) ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
    else ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
  }
  ctx.closePath();
  ctx.stroke();
  ctx.fill();

  // Inner hole / touchscreen
  ctx.beginPath();
  ctx.arc(x, y, holeR, 0, Math.PI * 2);
  ctx.fillStyle = isSoftware ? "rgba(0, 240, 255, 0.4)" : "rgba(251, 191, 36, 0.4)";
  ctx.fill();
  ctx.stroke();
  ctx.shadowBlur = 0;
};

const drawLeafTerminal = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, isSoftware: boolean) => {
  const color = isSoftware ? "#00ff41" : "#fbbf24";
  ctx.shadowColor = color;
  ctx.shadowBlur = isSoftware ? 10 : 2;
  ctx.strokeStyle = color;
  ctx.fillStyle = "rgba(0,0,0,0.9)";
  ctx.lineWidth = 1.5;

  // Diamond shape
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.lineTo(x + radius, y);
  ctx.lineTo(x, y + radius);
  ctx.lineTo(x - radius, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mini inner circle
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;
};

// Orbiting Cursor Component
const OrbitingCursor = ({ parentRef }: { parentRef: React.RefObject<HTMLDivElement | null> }) => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!parentRef.current) return;
      const rect = parentRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        setPos({ x, y });
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  if (!isHovering) return null;

  return (
    <div
      className="pointer-events-none absolute z-50 mix-blend-screen"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
    >
      <div className="relative w-16 h-16">
        {/* Inner red dot */}
        <div className="absolute left-1/2 top-1/2 w-1.5 h-1.5 bg-[#ff3366] rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_#ff3366]" />

        {/* Outer rotating blue dashed ring */}
        <div className="absolute inset-0 border border-t-[#00ccff] border-r-transparent border-b-[#00ccff] border-l-transparent rounded-full animate-spin [animation-duration:3s]" />

        {/* Second opposing ring */}
        <div className="absolute inset-1 border border-r-[#00ccff] border-l-[#00ccff] border-t-transparent border-b-transparent rounded-full opacity-50 animate-spin [animation-duration:2s] [animation-direction:reverse]" />
      </div>
    </div>
  );
}

export default function NodeProjectExplorer() {
  const { theme } = useTheme();
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 700 });

  const [isHovered, setIsHovered] = useState(false);
  const [animationTick, setAnimationTick] = useState(0);

  // Animation loop for hardware mode matching ants
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setAnimationTick((prev) => (prev + 0.5) % 20); // Controls the speed of marching ants
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      const parent = document.getElementById('graph-container-wrapper');
      if (parent) {
        setDimensions({
          width: parent.clientWidth,
          height: 700
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (graphRef.current) {
      // Very strong negative charge to spread out the 3D web widely
      graphRef.current.d3Force("charge").strength(-800).distanceMax(800);
      graphRef.current.d3Force("link").distance(150);
    }
  }, [graphRef.current]);

  const isSoftware = theme === "software";

  // Theming Configuration
  const categoryColor = isSoftware ? "#00f0ff" : "#fbbf24";
  const projectColor = isSoftware ? "#00ff41" : "#fbbf24";
  const coreColor = isSoftware ? "#ff3366" : "#d97706";

  // Custom paint routing based on node group
  const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const { x, y, val, id, name, group } = node;
    const radius = Math.sqrt(val) * 2.5; // Slightly larger for detail

    if (id === "core") {
      drawMicrochip(ctx, x, y, radius, isSoftware);
    } else if (id === "ai_fs") {
      drawNeuralNet(ctx, x, y, radius, isSoftware);
    } else if (id === "backend") {
      drawServerRack(ctx, x, y, radius, isSoftware);
    } else if (id === "hardware") {
      drawGear(ctx, x, y, radius, isSoftware);
    } else {
      drawLeafTerminal(ctx, x, y, radius, isSoftware);
    }

    // High Tech Floating Text Label
    const fontSize = Math.max(10 / globalScale, 4);
    ctx.font = `600 ${fontSize}px "Share Tech Mono", monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const textY = y + radius + (fontSize * 1.5);

    if (globalScale > 0.6) {
      const textWidth = ctx.measureText(`[ ${name} ]`).width;

      // Draw subtle wireframe box under text
      ctx.strokeStyle = group === 1 ? categoryColor : (group === 0 ? coreColor : projectColor);
      ctx.lineWidth = 0.5 / globalScale;
      ctx.globalAlpha = 0.3;
      ctx.strokeRect(x - textWidth / 2 - 4, textY - fontSize / 2 - 4, textWidth + 8, fontSize + 8);
      ctx.globalAlpha = 1.0;

      // Draw Text
      ctx.fillStyle = isSoftware ? "#ffffff" : "#e2e8f0";
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = isSoftware ? 5 : 0;
      ctx.fillText(`[ ${name} ]`, x, textY);
      ctx.shadowBlur = 0;
    }
  };

  return (
    <div className="w-full my-32 flex flex-col items-center relative overflow-visible z-10">

      {/* Narrative Header */}
      <div className="text-center mb-16 relative z-20">
        <h2
          className="text-4xl text-transparent bg-clip-text font-bold mb-4 transition-all duration-500"
          style={{
            backgroundImage: !isSoftware
              ? "linear-gradient(to right, #fbbf24, #d97706)"
              : "linear-gradient(to right, white, #9ca3af)",
          }}
        >
          Node-Based Graph Project Explorer
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Mapping the bridge between code and physical hardware. Interact with the core nodes below to explore my technical ecosystem.
        </p>
      </div>

      {/* 3D Perspective Wrapper */}
      <div
        id="graph-container-wrapper"
        ref={containerRef}
        className="w-full max-w-7xl mx-auto relative cursor-crosshair group perspective-[1500px]"
        style={{ height: '700px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Orbiting Hardware Pointer */}
        <OrbitingCursor parentRef={containerRef} />

        {/* The 3D CSS Transformed Container */}
        <div
          className="w-full h-full border border-white/5 bg-[#020813]/80 hardware:bg-[#0a192f]/90 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,204,255,0.1)] transition-transform duration-1000 ease-out preserve-3d"
          style={{
            transform: isHovered
              ? 'translateZ(0) rotateX(0deg) rotateY(0deg)'
              : 'rotateX(20deg) rotateY(-10deg) translateZ(0)'
          }}
        >
          <ForceGraph2D
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeCanvasObject={paintNode}
            nodePointerAreaPaint={(node: any, color, ctx) => {
              ctx.fillStyle = color;
              const r = Math.sqrt(node.val) * 3;
              ctx.beginPath();
              ctx.arc(node.x, node.y, r + 8, 0, 2 * Math.PI, false);
              ctx.fill();
            }}
            nodeRelSize={6}

            // Link Configuration
            linkCanvasObjectMode={() => isSoftware ? undefined : "replace"}
            linkCanvasObject={!isSoftware ? (link: any, ctx: CanvasRenderingContext2D) => {
              // Custom dotted lines for Hardware mode
              const start = link.source;
              const end = link.target;

              if (typeof start !== 'object' || typeof end !== 'object') return;

              ctx.beginPath();
              ctx.moveTo(start.x, start.y);
              ctx.lineTo(end.x, end.y);
              ctx.strokeStyle = "rgba(251, 191, 36, 0.8)"; // Copper trace
              ctx.lineWidth = 2;

              // Enable marching ants effect
              ctx.setLineDash([8, 6]);
              ctx.lineDashOffset = -animationTick; // Negative for forward flow
              ctx.stroke();

              // Reset dash for future shapes
              ctx.setLineDash([]);
            } : undefined}

            linkColor={(link: any) => {
              // Software logic (Hardware handles it in linkCanvasObject now)
              if (link.source.id === "core") return "rgba(255, 51, 102, 0.4)"; // Core streams red
              if (link.source.group === 1) return "rgba(0, 240, 255, 0.3)"; // Category streams cyan
              return "rgba(0, 255, 65, 0.3)";
            }}
            linkWidth={(link: any) => link.source.id === "core" ? 2 : 1}
            linkDirectionalParticles={isSoftware ? 4 : 0}
            linkDirectionalParticleSpeed={0.008}
            linkDirectionalParticleWidth={4}
            linkDirectionalParticleColor={(link: any) => {
              if (link.source.id === "core") return "#ff3366";
              if (link.source.group === 1) return "#00f0ff";
              return "#00ff41";
            }}

            // Advanced Cyberpunk Tooltip
            nodeLabel={(node: any) => {
              const bColor = node.group === 1 ? categoryColor : (node.group === 0 ? coreColor : projectColor);
              if (node.techStack) {
                return `
                  <div style="background: rgba(5, 10, 20, 0.95); border: 1px solid ${bColor}; border-left: 4px solid ${bColor}; padding: 12px; font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #fff; box-shadow: 0 0 15px rgba(0,0,0,0.8), inset 0 0 20px ${bColor}20; backdrop-filter: blur(4px); text-transform: uppercase; letter-spacing: 1px;">
                    <div style="color: ${bColor}; font-size: 10px; margin-bottom: 4px;">// SYS.DAT.READOUT</div>
                    <strong style="color: white; display: block; margin-bottom: 8px; font-size: 14px;">> ${node.name}</strong>
                    <div style="color: #a0aab5;">TAGS: <span style="color: ${bColor};">${node.techStack}</span></div>
                  </div>
                `;
              }
              return `
                <div style="background: rgba(5, 10, 20, 0.95); border: 1px solid ${bColor}; padding: 10px; font-family: 'Share Tech Mono', monospace; font-size: 12px; color: ${bColor}; box-shadow: 0 0 15px rgba(0,0,0,0.8); text-transform: uppercase;">
                    <strong>[ ROOT.${node.name} ]</strong>
                </div>
              `;
            }}
            backgroundColor="transparent"
          />
        </div>
      </div>
    </div>
  );
}
