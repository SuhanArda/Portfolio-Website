"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Crosshair, Flame, Wind, Gauge, Target, Zap } from "lucide-react";

interface Missile {
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    trail: { x: number; y: number; alpha: number; size: number }[];
    alive: boolean;
    fuel: number;
    age: number;
}

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    size: number;
    color: string;
}

interface Flare {
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
}

const DEFAULTS = {
    missileSpeed: 5,
    turnRate: 0.06,
    trailLength: 60,
    missileCount: 1,
    fuelDuration: 12,
    navigationGain: 3.5,
    flareCount: 0,
};

export default function MissileSimPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const mouseRef = useRef({ x: 0, y: 0 });
    const missilesRef = useRef<Missile[]>([]);
    const particlesRef = useRef<Particle[]>([]);
    const flaresRef = useRef<Flare[]>([]);
    const statsRef = useRef({ hits: 0, misses: 0, closest: Infinity });

    const [missileSpeed, setMissileSpeed] = useState(DEFAULTS.missileSpeed);
    const [turnRate, setTurnRate] = useState(DEFAULTS.turnRate);
    const [trailLength, setTrailLength] = useState(DEFAULTS.trailLength);
    const [missileCount, setMissileCount] = useState(DEFAULTS.missileCount);
    const [fuelDuration, setFuelDuration] = useState(DEFAULTS.fuelDuration);
    const [navigationGain, setNavigationGain] = useState(DEFAULTS.navigationGain);
    const [flareCount, setFlareCount] = useState(DEFAULTS.flareCount);
    const [stats, setStats] = useState({ hits: 0, misses: 0, closest: Infinity });
    const [isPanelOpen, setIsPanelOpen] = useState(true);

    const paramsRef = useRef({ missileSpeed, turnRate, trailLength, missileCount, fuelDuration, navigationGain, flareCount });
    useEffect(() => {
        paramsRef.current = { missileSpeed, turnRate, trailLength, missileCount, fuelDuration, navigationGain, flareCount };
    }, [missileSpeed, turnRate, trailLength, missileCount, fuelDuration, navigationGain, flareCount]);

    const spawnMissile = useCallback((canvas: HTMLCanvasElement): Missile => {
        const side = Math.floor(Math.random() * 4);
        let x: number, y: number;
        switch (side) {
            case 0: x = Math.random() * canvas.width; y = -20; break;
            case 1: x = canvas.width + 20; y = Math.random() * canvas.height; break;
            case 2: x = Math.random() * canvas.width; y = canvas.height + 20; break;
            default: x = -20; y = Math.random() * canvas.height; break;
        }
        const angle = Math.atan2(mouseRef.current.y - y, mouseRef.current.x - x);
        return { x, y, vx: Math.cos(angle) * 2, vy: Math.sin(angle) * 2, angle, trail: [], alive: true, fuel: 1.0, age: 0 };
    }, []);

    const spawnExplosion = useCallback((x: number, y: number) => {
        const colors = ["#ff4500", "#ff6347", "#ffa500", "#ffcc00", "#ff3366", "#ffffff"];
        for (let i = 0; i < 40; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 6 + 1;
            particlesRef.current.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 0.6 + Math.random() * 0.6,
                size: Math.random() * 4 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
            });
        }
    }, []);

    const deployFlares = useCallback(() => {
        const count = paramsRef.current.flareCount;
        if (count <= 0) return;
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 2;
            flaresRef.current.push({
                x: mx + (Math.random() - 0.5) * 40,
                y: my + (Math.random() - 0.5) * 40,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                maxLife: 2 + Math.random(),
            });
        }
    }, []);

    const launchWave = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const count = paramsRef.current.missileCount;
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                missilesRef.current.push(spawnMissile(canvas));
            }, i * 300);
        }
    }, [spawnMissile]);

    const resetStats = useCallback(() => {
        statsRef.current = { hits: 0, misses: 0, closest: Infinity };
        setStats({ hits: 0, misses: 0, closest: Infinity });
        missilesRef.current = [];
        particlesRef.current = [];
        flaresRef.current = [];
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const handleMouse = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", handleMouse);

        const handleClick = () => {
            launchWave();
        };
        canvas.addEventListener("click", handleClick);

        const handleRightClick = (e: MouseEvent) => {
            e.preventDefault();
            deployFlares();
        };
        canvas.addEventListener("contextmenu", handleRightClick);

        const drawMissileBody = (ctx: CanvasRenderingContext2D, m: Missile) => {
            ctx.save();
            ctx.translate(m.x, m.y);
            ctx.rotate(m.angle);

            const fuelAlpha = Math.max(0.4, m.fuel);

            ctx.shadowColor = m.fuel > 0.2 ? "#ff4500" : "#888";
            ctx.shadowBlur = 15;

            ctx.beginPath();
            ctx.moveTo(16, 0);
            ctx.lineTo(-8, -5);
            ctx.lineTo(-6, 0);
            ctx.lineTo(-8, 5);
            ctx.closePath();
            ctx.fillStyle = `rgba(255, 69, 0, ${fuelAlpha})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(255, 100, 50, ${fuelAlpha * 0.8})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(-6, -3);
            ctx.lineTo(-12, -7);
            ctx.lineTo(-10, 0);
            ctx.lineTo(-12, 7);
            ctx.lineTo(-6, 3);
            ctx.closePath();
            ctx.fillStyle = `rgba(255, 120, 0, ${fuelAlpha * 0.7})`;
            ctx.fill();

            if (m.fuel > 0.05) {
                const flicker = Math.random() * 8 + 8;
                const gradient = ctx.createLinearGradient(-10, 0, -10 - flicker, 0);
                gradient.addColorStop(0, `rgba(255, 200, 50, ${fuelAlpha * 0.9})`);
                gradient.addColorStop(0.5, `rgba(255, 100, 0, ${fuelAlpha * 0.6})`);
                gradient.addColorStop(1, "rgba(255, 50, 0, 0)");
                ctx.beginPath();
                ctx.moveTo(-10, -3);
                ctx.quadraticCurveTo(-10 - flicker * 0.5, -1 + Math.random() * 2, -10 - flicker, 0);
                ctx.quadraticCurveTo(-10 - flicker * 0.5, 1 - Math.random() * 2, -10, 3);
                ctx.closePath();
                ctx.fillStyle = gradient;
                ctx.fill();
            }

            ctx.shadowBlur = 0;
            ctx.restore();
        };

        const drawTrail = (ctx: CanvasRenderingContext2D, trail: Missile["trail"]) => {
            if (trail.length < 2) return;
            for (let i = 1; i < trail.length; i++) {
                const p = trail[i];
                const prev = trail[i - 1];
                ctx.beginPath();
                ctx.moveTo(prev.x, prev.y);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = `rgba(255, 120, 0, ${p.alpha * 0.5})`;
                ctx.lineWidth = p.size;
                ctx.lineCap = "round";
                ctx.stroke();
            }
        };

        const drawTarget = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
            const time = Date.now() * 0.003;
            const pulse = Math.sin(time) * 0.3 + 0.7;

            ctx.save();
            ctx.strokeStyle = `rgba(0, 255, 65, ${pulse * 0.6})`;
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.arc(x, y, 20, 0, Math.PI * 2);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.stroke();

            const crossSize = 28;
            ctx.beginPath();
            ctx.moveTo(x - crossSize, y);
            ctx.lineTo(x + crossSize, y);
            ctx.moveTo(x, y - crossSize);
            ctx.lineTo(x, y + crossSize);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 65, ${pulse})`;
            ctx.fill();

            ctx.restore();
        };

        const drawFlare = (ctx: CanvasRenderingContext2D, f: Flare) => {
            const alpha = f.life / f.maxLife;
            ctx.save();
            ctx.shadowColor = "#ffcc00";
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(f.x, f.y, 4 + (1 - alpha) * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 220, 50, ${alpha * 0.8})`;
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        };

        const drawGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
            ctx.strokeStyle = "rgba(0, 255, 65, 0.04)";
            ctx.lineWidth = 0.5;
            const spacing = 50;
            for (let x = 0; x < w; x += spacing) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, h);
                ctx.stroke();
            }
            for (let y = 0; y < h; y += spacing) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
        };

        let lastTime = performance.now();

        const loop = (now: number) => {
            const dt = Math.min((now - lastTime) / 16.67, 3);
            lastTime = now;
            const params = paramsRef.current;

            ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawGrid(ctx, canvas.width, canvas.height);
            drawTarget(ctx, mouseRef.current.x, mouseRef.current.y);

            const fuelDecay = 1 / (params.fuelDuration * 60);

            for (const m of missilesRef.current) {
                if (!m.alive) continue;
                m.age += dt;
                m.fuel = Math.max(0, m.fuel - fuelDecay * dt);

                let targetX = mouseRef.current.x;
                let targetY = mouseRef.current.y;

                if (flaresRef.current.length > 0) {
                    let closestFlare: Flare | null = null;
                    let closestDist = Infinity;
                    for (const f of flaresRef.current) {
                        const fd = Math.hypot(f.x - m.x, f.y - m.y);
                        if (fd < closestDist && fd < 300) {
                            closestDist = fd;
                            closestFlare = f;
                        }
                    }
                    if (closestFlare) {
                        targetX = closestFlare.x;
                        targetY = closestFlare.y;
                    }
                }

                const dx = targetX - m.x;
                const dy = targetY - m.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 18) {
                    m.alive = false;
                    spawnExplosion(m.x, m.y);
                    if (flaresRef.current.length === 0 || (targetX === mouseRef.current.x && targetY === mouseRef.current.y)) {
                        statsRef.current.hits++;
                    } else {
                        statsRef.current.misses++;
                    }
                    setStats({ ...statsRef.current });
                    continue;
                }

                if (statsRef.current.closest > dist) {
                    statsRef.current.closest = dist;
                    setStats({ ...statsRef.current });
                }

                if (m.fuel > 0) {
                    const desiredAngle = Math.atan2(dy, dx);
                    let angleDiff = desiredAngle - m.angle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                    const navCommand = params.navigationGain * angleDiff;
                    const maxTurn = params.turnRate * dt;
                    const actualTurn = Math.max(-maxTurn, Math.min(maxTurn, navCommand));
                    m.angle += actualTurn;

                    const speed = params.missileSpeed * (0.7 + m.fuel * 0.3);
                    m.vx = Math.cos(m.angle) * speed;
                    m.vy = Math.sin(m.angle) * speed;
                } else {
                    m.vy += 0.05 * dt;
                }

                m.x += m.vx * dt;
                m.y += m.vy * dt;

                m.trail.push({
                    x: m.x, y: m.y,
                    alpha: m.fuel > 0 ? 0.6 : 0.2,
                    size: m.fuel > 0 ? 2.5 : 1.5,
                });
                while (m.trail.length > params.trailLength) m.trail.shift();
                for (const t of m.trail) t.alpha *= 0.97;

                if (m.x < -100 || m.x > canvas.width + 100 || m.y < -100 || m.y > canvas.height + 100) {
                    m.alive = false;
                    statsRef.current.misses++;
                    setStats({ ...statsRef.current });
                }

                drawTrail(ctx, m.trail);
                drawMissileBody(ctx, m);
            }

            missilesRef.current = missilesRef.current.filter(m => m.alive);

            for (const p of particlesRef.current) {
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vx *= 0.97;
                p.vy *= 0.97;
                p.vy += 0.02 * dt;
                p.life -= (1 / (p.maxLife * 60)) * dt;

                ctx.save();
                ctx.globalAlpha = Math.max(0, p.life);
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(0, p.size * p.life), 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.restore();
            }
            particlesRef.current = particlesRef.current.filter(p => p.life > 0);

            for (const f of flaresRef.current) {
                f.x += f.vx * dt;
                f.y += f.vy * dt;
                f.vx *= 0.99;
                f.vy *= 0.99;
                f.life -= (1 / (f.maxLife * 60)) * dt;
                drawFlare(ctx, f);
            }
            flaresRef.current = flaresRef.current.filter(f => f.life > 0);

            animRef.current = requestAnimationFrame(loop);
        };

        animRef.current = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouse);
            canvas.removeEventListener("click", handleClick);
            canvas.removeEventListener("contextmenu", handleRightClick);
        };
    }, [launchWave, deployFlares, spawnExplosion]);

    const ACCENT = "#ff4500";

    const SliderControl = ({ label, icon, value, min, max, step, onChange, unit }: {
        label: string; icon: React.ReactNode; value: number; min: number; max: number; step: number;
        onChange: (v: number) => void; unit: string;
    }) => (
        <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-[11px] font-mono tracking-wider" style={{ color: "rgba(255,255,255,0.6)" }}>{label}</span>
                </div>
                <span className="text-xs font-mono font-bold" style={{ color: ACCENT }}>{value}{unit}</span>
            </div>
            <input
                type="range"
                min={min} max={max} step={step}
                value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                    background: `linear-gradient(to right, ${ACCENT} 0%, ${ACCENT} ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) ${((value - min) / (max - min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                }}
            />
        </div>
    );

    return (
        <div className="h-screen w-screen relative bg-black text-white overflow-hidden">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }} />

            {/* Top HUD */}
            <div
                className="force-cursor-visible absolute top-6 left-1/2 transform -translate-x-1/2 w-[95%] max-w-5xl flex justify-between items-center px-6 py-4 rounded-2xl"
                style={{
                    zIndex: 50,
                    background: "rgba(0, 0, 0, 0.3)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    boxShadow: "0 0 30px rgba(255, 69, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
            >
                <Link
                    href="/"
                    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-mono text-sm transition-all duration-300"
                    style={{
                        background: "rgba(127, 29, 29, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.2)",
                        color: "#f87171",
                        boxShadow: "0 0 12px rgba(239, 68, 68, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(127, 29, 29, 0.35)";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(239, 68, 68, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(127, 29, 29, 0.15)";
                        e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
                        e.currentTarget.style.boxShadow = "0 0 12px rgba(239, 68, 68, 0.1)";
                    }}
                >
                    <ArrowLeft size={15} />
                    ABORT_MISSION
                </Link>

                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                        style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <Target size={14} color="#ff4500" strokeWidth={2.5} />
                        <div>
                            <div className="text-[10px] tracking-[0.15em] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>HITS</div>
                            <div className="text-sm font-bold font-mono" style={{ color: "#00ff41" }}>{stats.hits}</div>
                        </div>
                    </div>
                    <div style={{ width: "1px", height: "32px", background: "rgba(255,255,255,0.1)" }} />
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                        style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <Wind size={14} color="#ff4500" strokeWidth={2.5} />
                        <div>
                            <div className="text-[10px] tracking-[0.15em] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>MISSES</div>
                            <div className="text-sm font-bold font-mono" style={{ color: "#f87171" }}>{stats.misses}</div>
                        </div>
                    </div>
                    <div style={{ width: "1px", height: "32px", background: "rgba(255,255,255,0.1)" }} />
                    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                        style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                        <Crosshair size={14} color="#ff4500" strokeWidth={2.5} />
                        <div>
                            <div className="text-[10px] tracking-[0.15em] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>CLOSEST</div>
                            <div className="text-sm font-bold font-mono" style={{ color: "#fbbf24" }}>{stats.closest === Infinity ? "---" : `${stats.closest.toFixed(0)}px`}</div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={resetStats}
                    className="group flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-mono text-sm transition-all duration-300 cursor-pointer"
                    style={{
                        background: "rgba(120, 53, 15, 0.15)",
                        border: "1px solid rgba(251, 191, 36, 0.2)",
                        color: "#fbbf24",
                        boxShadow: "0 0 12px rgba(251, 191, 36, 0.1)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(120, 53, 15, 0.35)";
                        e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.5)";
                        e.currentTarget.style.boxShadow = "0 0 20px rgba(251, 191, 36, 0.25)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(120, 53, 15, 0.15)";
                        e.currentTarget.style.borderColor = "rgba(251, 191, 36, 0.2)";
                        e.currentTarget.style.boxShadow = "0 0 12px rgba(251, 191, 36, 0.1)";
                    }}
                >
                    <RotateCcw size={15} />
                    RESET_DATA
                </button>
            </div>

            {/* Instructions overlay */}
            <div
                className="absolute top-24 left-1/2 transform -translate-x-1/2 font-mono text-[11px] tracking-wider px-5 py-2 rounded-full"
                style={{
                    zIndex: 50,
                    color: "rgba(255, 255, 255, 0.35)",
                    background: "rgba(0, 0, 0, 0.2)",
                    border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
            >
                LEFT_CLICK → LAUNCH &nbsp;|&nbsp; RIGHT_CLICK → DEPLOY_FLARES &nbsp;|&nbsp; MOUSE → EVADE
            </div>

            {/* Bottom Control Panel */}
            <div
                className="force-cursor-visible absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[95%] max-w-5xl transition-all duration-500"
                style={{ zIndex: 50 }}
            >
                <button
                    onClick={() => setIsPanelOpen(!isPanelOpen)}
                    className="mx-auto flex items-center gap-2 px-6 py-2 rounded-t-xl font-mono text-xs tracking-wider cursor-pointer transition-all duration-300"
                    style={{
                        background: "rgba(0, 0, 0, 0.4)",
                        backdropFilter: "blur(24px)",
                        border: "1px solid rgba(255, 69, 0, 0.15)",
                        borderBottom: "none",
                        color: "rgba(255, 255, 255, 0.5)",
                    }}
                >
                    <Gauge size={13} color="#ff4500" />
                    {isPanelOpen ? "HIDE_CONTROLS ▼" : "SHOW_CONTROLS ▲"}
                </button>

                <div
                    className="rounded-t-2xl overflow-hidden transition-all duration-500"
                    style={{
                        maxHeight: isPanelOpen ? "400px" : "0px",
                        opacity: isPanelOpen ? 1 : 0,
                        background: "rgba(0, 0, 0, 0.4)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1px solid rgba(255, 69, 0, 0.12)",
                        borderBottom: "none",
                        boxShadow: "0 -10px 40px rgba(255, 69, 0, 0.06)",
                    }}
                >
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-white/5">
                            <Flame size={16} color="#ff4500" />
                            <span className="font-mono text-xs font-bold tracking-[0.2em]" style={{ color: "#ff4500" }}>
                                MISSILE_PARAMETERS
                            </span>
                            <div className="flex-1" />
                            <button
                                onClick={() => {
                                    setMissileSpeed(DEFAULTS.missileSpeed);
                                    setTurnRate(DEFAULTS.turnRate);
                                    setTrailLength(DEFAULTS.trailLength);
                                    setMissileCount(DEFAULTS.missileCount);
                                    setFuelDuration(DEFAULTS.fuelDuration);
                                    setNavigationGain(DEFAULTS.navigationGain);
                                    setFlareCount(DEFAULTS.flareCount);
                                }}
                                className="text-[10px] font-mono tracking-wider px-3 py-1 rounded-md cursor-pointer transition-all duration-200"
                                style={{
                                    color: "rgba(255,255,255,0.4)",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                }}
                            >
                                RESET_DEFAULTS
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5">
                            <SliderControl
                                label="SPEED" icon={<Zap size={12} color={ACCENT} />}
                                value={missileSpeed} min={1} max={15} step={0.5}
                                onChange={setMissileSpeed} unit=" m/s"
                            />
                            <SliderControl
                                label="TURN_RATE" icon={<RotateCcw size={12} color={ACCENT} />}
                                value={turnRate} min={0.01} max={0.2} step={0.005}
                                onChange={setTurnRate} unit=" rad/f"
                            />
                            <SliderControl
                                label="NAV_GAIN" icon={<Crosshair size={12} color={ACCENT} />}
                                value={navigationGain} min={1} max={8} step={0.5}
                                onChange={setNavigationGain} unit="x"
                            />
                            <SliderControl
                                label="FUEL" icon={<Flame size={12} color={ACCENT} />}
                                value={fuelDuration} min={2} max={30} step={1}
                                onChange={setFuelDuration} unit="s"
                            />
                            <SliderControl
                                label="TRAIL_LEN" icon={<Wind size={12} color={ACCENT} />}
                                value={trailLength} min={10} max={200} step={5}
                                onChange={setTrailLength} unit=" pts"
                            />
                            <SliderControl
                                label="SALVO_SIZE" icon={<Target size={12} color={ACCENT} />}
                                value={missileCount} min={1} max={10} step={1}
                                onChange={setMissileCount} unit=" msl"
                            />
                            <SliderControl
                                label="FLARE_COUNT" icon={<Zap size={12} color={ACCENT} />}
                                value={flareCount} min={0} max={8} step={1}
                                onChange={setFlareCount} unit=" flr"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Status Ticker */}
            {!isPanelOpen && (
                <div
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2 font-mono text-[10px] tracking-[0.2em] px-4 py-1.5 rounded-full"
                    style={{
                        zIndex: 50,
                        color: "rgba(255, 69, 0, 0.4)",
                        background: "rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 69, 0, 0.08)",
                    }}
                >
                    GUIDED_MISSILE_SIM v1.0 • PROPORTIONAL_NAV • {missilesRef.current.length > 0 ? "TRACKING" : "STANDBY"}
                </div>
            )}
        </div>
    );
}
