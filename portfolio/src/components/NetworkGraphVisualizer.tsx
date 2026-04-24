"use client";
import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { Play, RotateCcw, Shuffle, Plus, Link2, Trash2, Pencil, MousePointer } from "lucide-react";

export type GraphAlgorithm = "dijkstra" | "astar" | "bfs" | "dfs" | "ford-fulkerson" | "bipartite";

type NodeState = "idle" | "visited" | "active" | "path" | "left" | "right" | "matched";
type EdgeState = "idle" | "visited" | "active" | "path" | "matched" | "flow";

interface GraphNode {
  id: string;
  x: number;
  y: number;
  state: NodeState;
}

interface GraphEdge {
  from: string;
  to: string;
  weight: number;
  state: EdgeState;
  directed?: boolean;
  capacity?: number;
  flow?: number;
}

interface AnimStep {
  type: "visit-node" | "active-node" | "visit-edge" | "path-node" | "path-edge" | "match-node" | "match-edge" | "flow-edge" | "set-flow";
  target: string;
  flow?: number;
  capacity?: number;
}

// ── Preset Graphs ──────────────────────────────────────────────────

interface GraphPreset {
  nodes: Omit<GraphNode, "state">[];
  edges: Omit<GraphEdge, "state">[];
}

const SVG_W = 820;
const SVG_H = 520;
const NODE_R = 34;

const STANDARD_PRESETS: GraphPreset[] = [
  {
    nodes: [
      { id: "A", x: 80, y: 260 },
      { id: "B", x: 220, y: 110 },
      { id: "C", x: 220, y: 410 },
      { id: "D", x: 400, y: 190 },
      { id: "E", x: 400, y: 350 },
      { id: "F", x: 560, y: 100 },
      { id: "G", x: 560, y: 420 },
      { id: "H", x: 680, y: 260 },
      { id: "I", x: 760, y: 140 },
    ],
    edges: [
      { from: "A", to: "B", weight: 4 },
      { from: "A", to: "C", weight: 2 },
      { from: "B", to: "D", weight: 5 },
      { from: "C", to: "E", weight: 3 },
      { from: "C", to: "D", weight: 8 },
      { from: "D", to: "F", weight: 2 },
      { from: "D", to: "E", weight: 1 },
      { from: "E", to: "G", weight: 6 },
      { from: "F", to: "H", weight: 3 },
      { from: "F", to: "I", weight: 1 },
      { from: "G", to: "H", weight: 2 },
      { from: "H", to: "I", weight: 4 },
      { from: "B", to: "F", weight: 7 },
    ],
  },
  {
    nodes: [
      { id: "A", x: 100, y: 140 },
      { id: "B", x: 100, y: 380 },
      { id: "C", x: 300, y: 70 },
      { id: "D", x: 310, y: 260 },
      { id: "E", x: 300, y: 450 },
      { id: "F", x: 520, y: 140 },
      { id: "G", x: 520, y: 380 },
      { id: "H", x: 710, y: 260 },
    ],
    edges: [
      { from: "A", to: "C", weight: 3 },
      { from: "A", to: "D", weight: 6 },
      { from: "A", to: "B", weight: 2 },
      { from: "B", to: "D", weight: 4 },
      { from: "B", to: "E", weight: 3 },
      { from: "C", to: "F", weight: 5 },
      { from: "C", to: "D", weight: 2 },
      { from: "D", to: "F", weight: 3 },
      { from: "D", to: "G", weight: 7 },
      { from: "E", to: "G", weight: 4 },
      { from: "E", to: "D", weight: 5 },
      { from: "F", to: "H", weight: 2 },
      { from: "G", to: "H", weight: 3 },
      { from: "F", to: "G", weight: 1 },
    ],
  },
];

const FLOW_PRESET: GraphPreset = {
  nodes: [
    { id: "S", x: 80, y: 260 },
    { id: "A", x: 250, y: 110 },
    { id: "B", x: 250, y: 410 },
    { id: "C", x: 450, y: 110 },
    { id: "D", x: 450, y: 410 },
    { id: "T", x: 720, y: 260 },
  ],
  edges: [
    { from: "S", to: "A", weight: 10, directed: true, capacity: 10 },
    { from: "S", to: "B", weight: 8, directed: true, capacity: 8 },
    { from: "A", to: "C", weight: 6, directed: true, capacity: 6 },
    { from: "A", to: "D", weight: 4, directed: true, capacity: 4 },
    { from: "B", to: "D", weight: 5, directed: true, capacity: 5 },
    { from: "B", to: "A", weight: 3, directed: true, capacity: 3 },
    { from: "C", to: "T", weight: 9, directed: true, capacity: 9 },
    { from: "D", to: "T", weight: 7, directed: true, capacity: 7 },
    { from: "D", to: "C", weight: 2, directed: true, capacity: 2 },
  ],
};

const BIPARTITE_PRESET: GraphPreset = {
  nodes: [
    { id: "U1", x: 160, y: 80 },
    { id: "U2", x: 160, y: 200 },
    { id: "U3", x: 160, y: 320 },
    { id: "U4", x: 160, y: 440 },
    { id: "V1", x: 660, y: 80 },
    { id: "V2", x: 660, y: 200 },
    { id: "V3", x: 660, y: 320 },
    { id: "V4", x: 660, y: 440 },
  ],
  edges: [
    { from: "U1", to: "V1", weight: 1 },
    { from: "U1", to: "V2", weight: 1 },
    { from: "U2", to: "V1", weight: 1 },
    { from: "U2", to: "V3", weight: 1 },
    { from: "U3", to: "V2", weight: 1 },
    { from: "U3", to: "V4", weight: 1 },
    { from: "U4", to: "V3", weight: 1 },
    { from: "U4", to: "V4", weight: 1 },
    { from: "U1", to: "V3", weight: 1 },
  ],
};

function initGraph(preset: GraphPreset, algo: GraphAlgorithm): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const defaultNodeState: NodeState = algo === "bipartite" ? "idle" : "idle";
  return {
    nodes: preset.nodes.map((n) => ({
      ...n,
      state: (algo === "bipartite" ? (n.id.startsWith("U") ? "left" : n.id.startsWith("V") ? "right" : "idle") : defaultNodeState) as NodeState,
    })),
    edges: preset.edges.map((e) => ({
      ...e,
      state: "idle" as EdgeState,
      flow: algo === "ford-fulkerson" ? 0 : undefined,
      capacity: e.capacity,
      directed: e.directed || algo === "ford-fulkerson",
    })),
  };
}

function getPreset(algo: GraphAlgorithm, idx: number): GraphPreset {
  if (algo === "ford-fulkerson") return FLOW_PRESET;
  if (algo === "bipartite") return BIPARTITE_PRESET;
  return STANDARD_PRESETS[idx % STANDARD_PRESETS.length];
}

// ── Helpers ────────────────────────────────────────────────────────

function buildAdj(edges: GraphEdge[], directed = false): Map<string, { to: string; weight: number; idx: number }[]> {
  const adj = new Map<string, { to: string; weight: number; idx: number }[]>();
  edges.forEach((e, i) => {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push({ to: e.to, weight: e.weight, idx: i });
    if (!directed) {
      if (!adj.has(e.to)) adj.set(e.to, []);
      adj.get(e.to)!.push({ to: e.from, weight: e.weight, idx: i });
    }
  });
  return adj;
}

function edgeKey(a: string, b: string) {
  return a < b ? `${a}->${b}` : `${b}->${a}`;
}

function dirEdgeKey(from: string, to: string) {
  return `${from}:${to}`;
}

function nodeDist(nodes: GraphNode[], a: string, b: string) {
  const na = nodes.find((n) => n.id === a)!;
  const nb = nodes.find((n) => n.id === b)!;
  return Math.sqrt((na.x - nb.x) ** 2 + (na.y - nb.y) ** 2) / 100;
}

// ── Algorithms ─────────────────────────────────────────────────────

function runDijkstra(nodes: GraphNode[], edges: GraphEdge[], start: string, end: string): AnimStep[] {
  const steps: AnimStep[] = [];
  const adj = buildAdj(edges);
  const dist = new Map<string, number>();
  const prev = new Map<string, string | null>();
  const visited = new Set<string>();
  for (const n of nodes) { dist.set(n.id, Infinity); prev.set(n.id, null); }
  dist.set(start, 0);
  const pq = [start];
  while (pq.length > 0) {
    pq.sort((a, b) => dist.get(a)! - dist.get(b)!);
    const u = pq.shift()!;
    if (visited.has(u)) continue;
    visited.add(u);
    steps.push({ type: "active-node", target: u });
    steps.push({ type: "visit-node", target: u });
    if (u === end) break;
    for (const { to, weight } of adj.get(u) || []) {
      if (visited.has(to)) continue;
      steps.push({ type: "visit-edge", target: edgeKey(u, to) });
      const alt = dist.get(u)! + weight;
      if (alt < dist.get(to)!) { dist.set(to, alt); prev.set(to, u); pq.push(to); }
    }
  }
  const path: string[] = []; let cur: string | null = end;
  while (cur) { path.unshift(cur); cur = prev.get(cur) ?? null; }
  if (path[0] === start) {
    for (const nid of path) steps.push({ type: "path-node", target: nid });
    for (let i = 0; i < path.length - 1; i++) steps.push({ type: "path-edge", target: edgeKey(path[i], path[i + 1]) });
  }
  return steps;
}

function runAStar(nodes: GraphNode[], edges: GraphEdge[], start: string, end: string): AnimStep[] {
  const steps: AnimStep[] = [];
  const adj = buildAdj(edges);
  const g = new Map<string, number>(); const f = new Map<string, number>();
  const prev = new Map<string, string | null>(); const visited = new Set<string>();
  for (const n of nodes) { g.set(n.id, Infinity); f.set(n.id, Infinity); prev.set(n.id, null); }
  g.set(start, 0); f.set(start, nodeDist(nodes, start, end));
  const open = [start];
  while (open.length > 0) {
    open.sort((a, b) => f.get(a)! - f.get(b)!);
    const u = open.shift()!;
    if (visited.has(u)) continue; visited.add(u);
    steps.push({ type: "active-node", target: u }); steps.push({ type: "visit-node", target: u });
    if (u === end) break;
    for (const { to, weight } of adj.get(u) || []) {
      if (visited.has(to)) continue;
      steps.push({ type: "visit-edge", target: edgeKey(u, to) });
      const tg = g.get(u)! + weight;
      if (tg < g.get(to)!) { g.set(to, tg); f.set(to, tg + nodeDist(nodes, to, end)); prev.set(to, u); open.push(to); }
    }
  }
  const path: string[] = []; let cur: string | null = end;
  while (cur) { path.unshift(cur); cur = prev.get(cur) ?? null; }
  if (path[0] === start) {
    for (const nid of path) steps.push({ type: "path-node", target: nid });
    for (let i = 0; i < path.length - 1; i++) steps.push({ type: "path-edge", target: edgeKey(path[i], path[i + 1]) });
  }
  return steps;
}

function runBFS(nodes: GraphNode[], edges: GraphEdge[], start: string, end: string): AnimStep[] {
  const steps: AnimStep[] = [];
  const adj = buildAdj(edges);
  const visited = new Set<string>(); const prev = new Map<string, string | null>();
  prev.set(start, null); visited.add(start);
  const queue = [start];
  while (queue.length > 0) {
    const u = queue.shift()!;
    steps.push({ type: "active-node", target: u }); steps.push({ type: "visit-node", target: u });
    if (u === end) break;
    for (const { to } of adj.get(u) || []) {
      if (visited.has(to)) continue; visited.add(to); prev.set(to, u);
      steps.push({ type: "visit-edge", target: edgeKey(u, to) }); queue.push(to);
    }
  }
  const path: string[] = []; let cur: string | null = end;
  while (cur) { path.unshift(cur); cur = prev.get(cur) ?? null; }
  if (path[0] === start) {
    for (const nid of path) steps.push({ type: "path-node", target: nid });
    for (let i = 0; i < path.length - 1; i++) steps.push({ type: "path-edge", target: edgeKey(path[i], path[i + 1]) });
  }
  return steps;
}

function runDFS(nodes: GraphNode[], edges: GraphEdge[], start: string, end: string): AnimStep[] {
  const steps: AnimStep[] = [];
  const adj = buildAdj(edges);
  const visited = new Set<string>(); const prev = new Map<string, string | null>();
  prev.set(start, null);
  const stack = [start]; let found = false;
  while (stack.length > 0 && !found) {
    const u = stack.pop()!;
    if (visited.has(u)) continue; visited.add(u);
    steps.push({ type: "active-node", target: u }); steps.push({ type: "visit-node", target: u });
    if (u === end) { found = true; break; }
    for (const { to } of (adj.get(u) || []).slice().reverse()) {
      if (!visited.has(to)) { if (!prev.has(to)) prev.set(to, u); steps.push({ type: "visit-edge", target: edgeKey(u, to) }); stack.push(to); }
    }
  }
  if (found) {
    const path: string[] = []; let cur: string | null = end;
    while (cur) { path.unshift(cur); cur = prev.get(cur) ?? null; }
    if (path[0] === start) {
      for (const nid of path) steps.push({ type: "path-node", target: nid });
      for (let i = 0; i < path.length - 1; i++) steps.push({ type: "path-edge", target: edgeKey(path[i], path[i + 1]) });
    }
  }
  return steps;
}

// Ford-Fulkerson (Edmonds-Karp BFS)
function runFordFulkerson(_nodes: GraphNode[], edges: GraphEdge[], source: string, sink: string): AnimStep[] {
  const steps: AnimStep[] = [];
  const n = new Set<string>();
  edges.forEach((e) => { n.add(e.from); n.add(e.to); });
  const nodeIds = Array.from(n);

  const cap: Record<string, Record<string, number>> = {};
  const flowMap: Record<string, Record<string, number>> = {};
  for (const a of nodeIds) { cap[a] = {}; flowMap[a] = {}; for (const b of nodeIds) { cap[a][b] = 0; flowMap[a][b] = 0; } }
  const edgeIdxMap: Record<string, number> = {};
  edges.forEach((e, i) => { cap[e.from][e.to] = e.capacity || e.weight; edgeIdxMap[dirEdgeKey(e.from, e.to)] = i; });

  const adj: Record<string, string[]> = {};
  for (const a of nodeIds) adj[a] = [];
  edges.forEach((e) => { adj[e.from].push(e.to); adj[e.to].push(e.from); });

  function bfsPath(): string[] | null {
    const visited = new Set<string>(); const parent: Record<string, string> = {};
    visited.add(source); const queue = [source];
    while (queue.length > 0) {
      const u = queue.shift()!;
      for (const v of adj[u]) {
        if (!visited.has(v) && cap[u][v] - flowMap[u][v] > 0) {
          visited.add(v); parent[v] = u;
          if (v === sink) {
            const path: string[] = []; let cur = sink;
            while (cur !== source) { path.unshift(cur); cur = parent[cur]; }
            path.unshift(source); return path;
          }
          queue.push(v);
        }
      }
    }
    return null;
  }

  let augPath = bfsPath();
  while (augPath) {
    let bottleneck = Infinity;
    for (let i = 0; i < augPath.length - 1; i++) {
      const residual = cap[augPath[i]][augPath[i + 1]] - flowMap[augPath[i]][augPath[i + 1]];
      bottleneck = Math.min(bottleneck, residual);
    }
    for (let i = 0; i < augPath.length - 1; i++) {
      const u = augPath[i]; const v = augPath[i + 1];
      flowMap[u][v] += bottleneck;
      flowMap[v][u] -= bottleneck;
      steps.push({ type: "active-node", target: u });
      steps.push({ type: "active-node", target: v });
      const fwdIdx = edgeIdxMap[dirEdgeKey(u, v)];
      if (fwdIdx !== undefined) {
        steps.push({ type: "set-flow", target: String(fwdIdx), flow: flowMap[u][v], capacity: cap[u][v] });
        steps.push({ type: "flow-edge", target: String(fwdIdx) });
      }
    }
    for (const nid of augPath) steps.push({ type: "visit-node", target: nid });
    augPath = bfsPath();
  }

  edges.forEach((e, i) => {
    if (flowMap[e.from][e.to] > 0) {
      steps.push({ type: "path-edge", target: String(i) });
      steps.push({ type: "set-flow", target: String(i), flow: flowMap[e.from][e.to], capacity: cap[e.from][e.to] });
    }
  });

  return steps;
}

// Bipartite Matching (Hungarian/Augmenting Paths)
function runBipartiteMatching(nodes: GraphNode[], edges: GraphEdge[]): AnimStep[] {
  const steps: AnimStep[] = [];
  const leftNodes = nodes.filter((n) => n.id.startsWith("U")).map((n) => n.id);
  const rightNodes = nodes.filter((n) => n.id.startsWith("V")).map((n) => n.id);

  const adj: Record<string, string[]> = {};
  const edgeIdxMap: Record<string, number> = {};
  for (const n of nodes) adj[n.id] = [];
  edges.forEach((e, i) => {
    adj[e.from].push(e.to);
    adj[e.to].push(e.from);
    edgeIdxMap[`${e.from}-${e.to}`] = i;
    edgeIdxMap[`${e.to}-${e.from}`] = i;
  });

  const matchL: Record<string, string | null> = {};
  const matchR: Record<string, string | null> = {};
  for (const u of leftNodes) matchL[u] = null;
  for (const v of rightNodes) matchR[v] = null;

  function augment(u: string, visited: Set<string>): boolean {
    for (const v of adj[u]) {
      if (visited.has(v)) continue;
      visited.add(v);
      steps.push({ type: "active-node", target: u });
      steps.push({ type: "active-node", target: v });
      const eIdx = edgeIdxMap[`${u}-${v}`];
      if (eIdx !== undefined) steps.push({ type: "visit-edge", target: String(eIdx) });

      if (matchR[v] === null || augment(matchR[v]!, visited)) {
        matchL[u] = v;
        matchR[v] = u;
        if (eIdx !== undefined) steps.push({ type: "match-edge", target: String(eIdx) });
        steps.push({ type: "match-node", target: u });
        steps.push({ type: "match-node", target: v });
        return true;
      }
    }
    return false;
  }

  for (const u of leftNodes) {
    steps.push({ type: "active-node", target: u });
    const visited = new Set<string>();
    augment(u, visited);
  }

  return steps;
}

// ── Styles ─────────────────────────────────────────────────────────

const NODE_STYLES: Record<NodeState, { fill: string; stroke: string; textFill: string; scale: number }> = {
  idle:    { fill: "#111827", stroke: "#6366f1", textFill: "#e0e7ff", scale: 1 },
  visited: { fill: "#1e1b4b", stroke: "#818cf8", textFill: "#c7d2fe", scale: 1 },
  active:  { fill: "#422006", stroke: "#facc15", textFill: "#fef9c3", scale: 1.15 },
  path:    { fill: "#052e16", stroke: "#22c55e", textFill: "#bbf7d0", scale: 1.08 },
  left:    { fill: "#172554", stroke: "#3b82f6", textFill: "#bfdbfe", scale: 1 },
  right:   { fill: "#4c1d95", stroke: "#a78bfa", textFill: "#ede9fe", scale: 1 },
  matched: { fill: "#052e16", stroke: "#22c55e", textFill: "#bbf7d0", scale: 1.08 },
};

const EDGE_STYLES: Record<EdgeState, { stroke: string; width: number; opacity: number }> = {
  idle:    { stroke: "#334155", width: 2.5, opacity: 0.35 },
  visited: { stroke: "#818cf8", width: 3,   opacity: 0.7 },
  active:  { stroke: "#facc15", width: 4,   opacity: 1 },
  path:    { stroke: "#22c55e", width: 4.5, opacity: 1 },
  matched: { stroke: "#22c55e", width: 4.5, opacity: 1 },
  flow:    { stroke: "#38bdf8", width: 4,   opacity: 0.9 },
};

function getEdgeFilter(state: EdgeState): string | undefined {
  if (state === "path" || state === "matched") return "url(#glow-green)";
  if (state === "active") return "url(#glow-yellow)";
  if (state === "visited" || state === "flow") return "url(#glow-indigo)";
  return undefined;
}
function getNodeFilter(state: NodeState): string | undefined {
  if (state === "path" || state === "matched") return "url(#glow-green)";
  if (state === "active") return "url(#glow-yellow)";
  if (state === "visited") return "url(#glow-indigo)";
  return undefined;
}

// ── Arrow helper ───────────────────────────────────────────────────

function arrowPoints(x1: number, y1: number, x2: number, y2: number, r: number): { ax: number; ay: number; angle: number } {
  const dx = x2 - x1; const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len; const uy = dy / len;
  return { ax: x2 - ux * r, ay: y2 - uy * r, angle: Math.atan2(dy, dx) * (180 / Math.PI) };
}

// ── Component ──────────────────────────────────────────────────────

type EditMode = "none" | "add-node" | "add-edge" | "delete" | "edit-weight";

function nextNodeId(existingIds: string[]): string {
  const used = new Set(existingIds);
  for (let i = 0; i < 702; i++) {
    const id = i < 26 ? String.fromCharCode(65 + i) : String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26));
    if (!used.has(id)) return id;
  }
  return `N${existingIds.length}`;
}

interface Props { algorithm: GraphAlgorithm; }

export default function NetworkGraphVisualizer({ algorithm }: Props) {
  const [presetIdx, setPresetIdx] = useState(0);
  const [graphNodes, setGraphNodes] = useState<GraphNode[]>([]);
  const [graphEdges, setGraphEdges] = useState<GraphEdge[]>([]);
  const [startNode, setStartNode] = useState("");
  const [endNode, setEndNode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(400);
  const [pickMode, setPickMode] = useState<"start" | "end" | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>("none");
  const [edgePending, setEdgePending] = useState<string | null>(null);
  const [editingEdge, setEditingEdge] = useState<number | null>(null);
  const [editWeightVal, setEditWeightVal] = useState("");
  const cancelRef = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const isFlow = algorithm === "ford-fulkerson";
  const isBipartite = algorithm === "bipartite";
  const isDirected = isFlow;

  const connectedEdges = useMemo(() => {
    if (!hoveredNode) return new Set<number>();
    const s = new Set<number>();
    graphEdges.forEach((e, i) => { if (e.from === hoveredNode || e.to === hoveredNode) s.add(i); });
    return s;
  }, [hoveredNode, graphEdges]);

  const loadPreset = useCallback((idx: number, algo: GraphAlgorithm) => {
    const preset = getPreset(algo, idx);
    const { nodes, edges } = initGraph(preset, algo);
    setGraphNodes(nodes);
    setGraphEdges(edges);
    if (algo === "bipartite") {
      setStartNode(nodes[0]?.id || "");
      setEndNode(nodes[nodes.length - 1]?.id || "");
    } else {
      setStartNode(nodes[0]?.id || "");
      setEndNode(nodes[nodes.length - 1]?.id || "");
    }
    setPickMode(null);
    setHoveredNode(null);
  }, []);

  useEffect(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setEditMode("none");
    setEdgePending(null);
    setEditingEdge(null);
    loadPreset(presetIdx, algorithm);
  }, [algorithm, presetIdx, loadPreset]);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    loadPreset(presetIdx, algorithm);
  }, [presetIdx, algorithm, loadPreset]);

  const shuffleGraph = useCallback(() => {
    if (isFlow || isBipartite) return;
    cancelRef.current = true;
    setIsRunning(false);
    const next = (presetIdx + 1) % STANDARD_PRESETS.length;
    setPresetIdx(next);
  }, [presetIdx, isFlow, isBipartite]);

  const handleNodeClick = useCallback((id: string) => {
    if (isRunning) return;

    if (pickMode === "start") { setStartNode(id); setPickMode(null); return; }
    if (pickMode === "end") { setEndNode(id); setPickMode(null); return; }

    if (editMode === "add-edge") {
      if (edgePending === null) {
        setEdgePending(id);
      } else if (edgePending !== id) {
        const exists = graphEdges.some(
          (e) => (e.from === edgePending && e.to === id) || (e.from === id && e.to === edgePending)
        );
        if (!exists) {
          setGraphEdges((prev) => [...prev, {
            from: edgePending, to: id, weight: 1, state: "idle" as EdgeState,
            directed: isFlow, capacity: isFlow ? 10 : undefined, flow: isFlow ? 0 : undefined,
          }]);
        }
        setEdgePending(null);
      }
      return;
    }

    if (editMode === "delete") {
      setGraphEdges((prev) => prev.filter((e) => e.from !== id && e.to !== id));
      setGraphNodes((prev) => prev.filter((n) => n.id !== id));
      if (startNode === id && graphNodes.length > 1) {
        const remaining = graphNodes.filter((n) => n.id !== id);
        setStartNode(remaining[0]?.id || "");
      }
      if (endNode === id && graphNodes.length > 1) {
        const remaining = graphNodes.filter((n) => n.id !== id);
        setEndNode(remaining[remaining.length - 1]?.id || "");
      }
      return;
    }
  }, [isRunning, pickMode, editMode, edgePending, graphEdges, graphNodes, startNode, endNode, isFlow]);

  const handleSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (isRunning || editMode !== "add-node" || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    const x = Math.round(Math.max(NODE_R + 10, Math.min(SVG_W - NODE_R - 10, svgP.x)));
    const y = Math.round(Math.max(NODE_R + 10, Math.min(SVG_H - NODE_R - 10, svgP.y)));
    const tooClose = graphNodes.some((n) => Math.sqrt((n.x - x) ** 2 + (n.y - y) ** 2) < NODE_R * 2.5);
    if (tooClose) return;
    const id = nextNodeId(graphNodes.map((n) => n.id));
    setGraphNodes((prev) => [...prev, { id, x, y, state: "idle" as NodeState }]);
    if (graphNodes.length === 0) setStartNode(id);
    if (graphNodes.length <= 1) setEndNode(id);
  }, [isRunning, editMode, graphNodes]);

  const handleEdgeClick = useCallback((idx: number) => {
    if (isRunning) return;
    if (editMode === "delete") {
      setGraphEdges((prev) => prev.filter((_, i) => i !== idx));
      return;
    }
    if (editMode === "edit-weight") {
      setEditingEdge(idx);
      setEditWeightVal(String(graphEdges[idx]?.weight ?? 1));
      return;
    }
  }, [isRunning, editMode, graphEdges]);

  const commitEdgeWeight = useCallback(() => {
    if (editingEdge === null) return;
    const val = parseInt(editWeightVal);
    if (!isNaN(val) && val > 0) {
      setGraphEdges((prev) => {
        const next = [...prev];
        if (next[editingEdge]) {
          next[editingEdge] = { ...next[editingEdge], weight: val };
          if (next[editingEdge].capacity !== undefined) next[editingEdge].capacity = val;
        }
        return next;
      });
    }
    setEditingEdge(null);
    setEditWeightVal("");
  }, [editingEdge, editWeightVal]);

  const edgeLookup = useMemo(() => {
    const map = new Map<string, number>();
    graphEdges.forEach((e, i) => {
      map.set(edgeKey(e.from, e.to), i);
      map.set(dirEdgeKey(e.from, e.to), i);
    });
    return map;
  }, [graphEdges]);

  const solve = useCallback(async () => {
    cancelRef.current = false;
    setEditMode("none");
    setEdgePending(null);
    setEditingEdge(null);
    setGraphNodes((prev) => prev.map((n) => ({
      ...n,
      state: (isBipartite ? (n.id.startsWith("U") ? "left" : n.id.startsWith("V") ? "right" : "idle") : "idle") as NodeState,
    })));
    setGraphEdges((prev) => prev.map((e) => ({ ...e, state: "idle" as EdgeState, flow: isFlow ? 0 : e.flow })));
    setIsRunning(true);
    await new Promise((r) => setTimeout(r, 60));

    const cleanNodes = graphNodes.map((n) => ({ ...n, state: "idle" as NodeState }));
    const cleanEdges = graphEdges.map((e) => ({ ...e, state: "idle" as EdgeState, flow: isFlow ? 0 : e.flow }));

    let steps: AnimStep[];
    if (isFlow) {
      steps = runFordFulkerson(cleanNodes, cleanEdges, startNode, endNode);
    } else if (isBipartite) {
      steps = runBipartiteMatching(cleanNodes, cleanEdges);
    } else {
      const runners = { dijkstra: runDijkstra, astar: runAStar, bfs: runBFS, dfs: runDFS };
      steps = runners[algorithm as keyof typeof runners](cleanNodes, cleanEdges, startNode, endNode);
    }

    for (const step of steps) {
      if (cancelRef.current) break;
      const spd = speed;

      if (step.type === "active-node") {
        setGraphNodes((prev) => prev.map((n) => (n.id === step.target ? { ...n, state: "active" } : n)));
        await new Promise((r) => setTimeout(r, spd));
      } else if (step.type === "visit-node") {
        setGraphNodes((prev) => prev.map((n) =>
          n.id === step.target && n.state !== "path" && n.state !== "matched" ? { ...n, state: "visited" } : n
        ));
      } else if (step.type === "match-node") {
        setGraphNodes((prev) => prev.map((n) => (n.id === step.target ? { ...n, state: "matched" } : n)));
        await new Promise((r) => setTimeout(r, spd * 0.5));
      } else if (step.type === "visit-edge") {
        const idx = edgeLookup.get(step.target) ?? Number(step.target);
        if (!isNaN(idx)) {
          setGraphEdges((prev) => { const next = [...prev]; if (next[idx] && next[idx].state !== "path" && next[idx].state !== "matched") next[idx] = { ...next[idx], state: "visited" }; return next; });
        }
        await new Promise((r) => setTimeout(r, spd * 0.3));
      } else if (step.type === "match-edge") {
        const idx = Number(step.target);
        if (!isNaN(idx)) {
          setGraphEdges((prev) => { const next = [...prev]; if (next[idx]) next[idx] = { ...next[idx], state: "matched" }; return next; });
        }
        await new Promise((r) => setTimeout(r, spd * 0.5));
      } else if (step.type === "set-flow") {
        const idx = Number(step.target);
        if (!isNaN(idx)) {
          setGraphEdges((prev) => { const next = [...prev]; if (next[idx]) next[idx] = { ...next[idx], flow: step.flow, capacity: step.capacity }; return next; });
        }
      } else if (step.type === "flow-edge") {
        const idx = Number(step.target);
        if (!isNaN(idx)) {
          setGraphEdges((prev) => { const next = [...prev]; if (next[idx]) next[idx] = { ...next[idx], state: "flow" }; return next; });
        }
        await new Promise((r) => setTimeout(r, spd * 0.4));
      } else if (step.type === "path-node") {
        setGraphNodes((prev) => prev.map((n) => (n.id === step.target ? { ...n, state: "path" } : n)));
        await new Promise((r) => setTimeout(r, spd * 0.5));
      } else if (step.type === "path-edge") {
        const idx = edgeLookup.get(step.target) ?? Number(step.target);
        if (!isNaN(idx)) {
          setGraphEdges((prev) => { const next = [...prev]; if (next[idx]) next[idx] = { ...next[idx], state: "path" }; return next; });
        }
        await new Promise((r) => setTimeout(r, spd * 0.4));
      }
    }
    setIsRunning(false);
  }, [graphNodes, graphEdges, algorithm, startNode, endNode, speed, edgeLookup, isFlow, isBipartite]);

  useEffect(() => { return () => { cancelRef.current = true; }; }, []);

  const algoLabel = { dijkstra: "Dijkstra", astar: "A*", bfs: "BFS", dfs: "DFS", "ford-fulkerson": "Max Flow", bipartite: "Match" }[algorithm];

  const builderModes: { mode: EditMode; icon: React.ReactNode; label: string; color: string }[] = [
    { mode: "none", icon: <MousePointer size={13} />, label: "Select", color: "#6366f1" },
    { mode: "add-node", icon: <Plus size={13} />, label: "Node", color: "#22c55e" },
    { mode: "add-edge", icon: <Link2 size={13} />, label: "Edge", color: "#3b82f6" },
    { mode: "edit-weight", icon: <Pencil size={13} />, label: "Weight", color: "#f59e0b" },
    { mode: "delete", icon: <Trash2 size={13} />, label: "Delete", color: "#ef4444" },
  ];

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Builder modes */}
        <div className="flex bg-white/5 rounded-lg overflow-hidden border border-white/10">
          {builderModes.map(({ mode, icon, label, color }) => (
            <button key={mode} disabled={isRunning}
              onClick={() => { setEditMode(mode); setPickMode(null); setEdgePending(null); setEditingEdge(null); }}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${
                editMode === mode ? "text-white" : "text-gray-500 hover:text-white hover:bg-white/5"
              } ${isRunning ? "opacity-40 cursor-not-allowed" : ""}`}
              style={{
                backgroundColor: editMode === mode ? color + "25" : undefined,
                borderBottom: editMode === mode ? `2px solid ${color}` : "2px solid transparent",
              }}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Start / End pickers */}
        {!isBipartite && (
          <div className="flex bg-white/5 rounded-lg overflow-hidden border border-white/10">
            <button disabled={isRunning} onClick={() => { setPickMode(pickMode === "start" ? null : "start"); setEditMode("none"); }}
              className={`px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${pickMode === "start" ? "bg-emerald-500/20 text-emerald-300 border-b-2 border-emerald-400" : "text-gray-400 hover:text-white hover:bg-white/5 border-b-2 border-transparent"} ${isRunning ? "opacity-40 cursor-not-allowed" : ""}`}>
              {isFlow ? "Src" : "Start"}: <span className="font-bold text-white">{startNode}</span>
            </button>
            <button disabled={isRunning} onClick={() => { setPickMode(pickMode === "end" ? null : "end"); setEditMode("none"); }}
              className={`px-2.5 py-1.5 text-[11px] font-medium transition-all cursor-pointer ${pickMode === "end" ? "bg-red-500/20 text-red-300 border-b-2 border-red-400" : "text-gray-400 hover:text-white hover:bg-white/5 border-b-2 border-transparent"} ${isRunning ? "opacity-40 cursor-not-allowed" : ""}`}>
              {isFlow ? "Sink" : "End"}: <span className="font-bold text-white">{endNode}</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span>Speed:</span>
          <input type="range" min={100} max={1000} step={50} value={1100 - speed}
            onChange={(e) => setSpeed(1100 - Number(e.target.value))} className="w-16 accent-indigo-500" disabled={isRunning} />
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          {!isFlow && !isBipartite && (
            <button onClick={shuffleGraph} disabled={isRunning}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 text-[11px] cursor-pointer">
              <Shuffle size={12} /> Preset
            </button>
          )}
          <button onClick={reset} className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
            <RotateCcw size={14} />
          </button>
          <button onClick={solve} disabled={isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-30 font-medium text-[11px] cursor-pointer">
            <Play size={13} /> Run {algoLabel}
          </button>
        </div>
      </div>

      {/* SVG */}
      <div className="flex-1 rounded-xl border border-white/5 bg-[#080810] overflow-hidden relative">
        {pickMode && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-medium bg-black/80 border border-white/10 text-white backdrop-blur-sm">
            Click a node to set as <span className={pickMode === "start" ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{pickMode === "start" ? (isFlow ? "source" : "start") : (isFlow ? "sink" : "end")}</span>
          </div>
        )}
        {editMode === "add-node" && !isRunning && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-medium bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 backdrop-blur-sm">
            Click empty space to add a node
          </div>
        )}
        {editMode === "add-edge" && !isRunning && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-medium bg-blue-950/80 border border-blue-500/30 text-blue-300 backdrop-blur-sm">
            {edgePending ? <>Click second node (from <span className="font-bold text-white">{edgePending}</span>)</> : "Click first node to start edge"}
          </div>
        )}
        {editMode === "delete" && !isRunning && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-medium bg-red-950/80 border border-red-500/30 text-red-300 backdrop-blur-sm">
            Click a node or edge to delete
          </div>
        )}
        {editMode === "edit-weight" && !isRunning && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1.5 rounded-full text-xs font-medium bg-amber-950/80 border border-amber-500/30 text-amber-300 backdrop-blur-sm">
            Click an edge to edit its weight
          </div>
        )}

        {/* Weight editor popup */}
        {editingEdge !== null && graphEdges[editingEdge] && (() => {
          const edge = graphEdges[editingEdge];
          const fromN = graphNodes.find((n) => n.id === edge.from);
          const toN = graphNodes.find((n) => n.id === edge.to);
          if (!fromN || !toN) return null;
          return (
            <div className="absolute z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0c0c18] border border-amber-500/30 shadow-lg"
              style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
              <span className="text-xs text-amber-300 font-medium">{edge.from}→{edge.to}:</span>
              <input autoFocus type="number" min={1} value={editWeightVal}
                onChange={(e) => setEditWeightVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") commitEdgeWeight(); if (e.key === "Escape") { setEditingEdge(null); setEditWeightVal(""); } }}
                className="w-16 px-2 py-1 rounded bg-white/5 border border-white/10 text-white text-xs outline-none focus:border-amber-500/50" />
              <button onClick={commitEdgeWeight}
                className="px-2 py-1 rounded text-[10px] font-medium bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 cursor-pointer">
                OK
              </button>
              <button onClick={() => { setEditingEdge(null); setEditWeightVal(""); }}
                className="px-2 py-1 rounded text-[10px] font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-white cursor-pointer">
                Cancel
              </button>
            </div>
          );
        })()}

        <svg ref={svgRef} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full"
          style={{ maxHeight: "clamp(300px, 55vh, 540px)", cursor: editMode === "add-node" ? "crosshair" : editMode === "delete" ? "not-allowed" : undefined }}
          onClick={handleSvgClick}>
          <defs>
            <filter id="glow-green" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="glow-yellow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="glow-indigo" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <marker id="arrow-idle" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#334155" opacity="0.5" /></marker>
            <marker id="arrow-visited" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" /></marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#facc15" /></marker>
            <marker id="arrow-path" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" /></marker>
            <marker id="arrow-flow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#38bdf8" /></marker>
            <marker id="arrow-matched" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" /></marker>
          </defs>

          {/* Bipartite group labels */}
          {isBipartite && (
            <>
              <text x={160} y={40} textAnchor="middle" fontSize={13} fontWeight={700} fill="#60a5fa" opacity={0.6} fontFamily="monospace">GROUP U</text>
              <text x={660} y={40} textAnchor="middle" fontSize={13} fontWeight={700} fill="#a78bfa" opacity={0.6} fontFamily="monospace">GROUP V</text>
              <line x1={410} y1={50} x2={410} y2={480} stroke="#1e293b" strokeWidth={1} strokeDasharray="6 4" opacity={0.3} />
            </>
          )}

          {/* Edges */}
          {graphEdges.map((edge, idx) => {
            const fromNode = graphNodes.find((n) => n.id === edge.from);
            const toNode = graphNodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            const style = EDGE_STYLES[edge.state];
            const dimmed = hoveredNode !== null && !connectedEdges.has(idx);
            const highlighted = hoveredNode !== null && connectedEdges.has(idx) && edge.state === "idle";

            const { ax, ay } = arrowPoints(fromNode.x, fromNode.y, toNode.x, toNode.y, NODE_R + 4);
            const { ax: ax2, ay: ay2 } = arrowPoints(toNode.x, toNode.y, fromNode.x, fromNode.y, NODE_R + 4);
            const mx = (fromNode.x + toNode.x) / 2;
            const my = (fromNode.y + toNode.y) / 2;

            const showDirected = edge.directed || isDirected;
            const markerUrl = `url(#arrow-${edge.state})`;

            const flowText = isFlow && edge.capacity !== undefined
              ? `${edge.flow ?? 0}/${edge.capacity}`
              : null;
            const flowRatio = isFlow && edge.capacity ? (edge.flow ?? 0) / edge.capacity : 0;

            const edgeClickable = editMode === "delete" || editMode === "edit-weight";

            return (
              <g key={`e-${idx}`} style={{ transition: "opacity 0.3s", cursor: edgeClickable ? "pointer" : undefined }} opacity={dimmed ? 0.12 : 1}
                onClick={(e) => { if (edgeClickable) { e.stopPropagation(); handleEdgeClick(idx); } }}>
                {edgeClickable && (
                  <line x1={ax2} y1={ay2} x2={ax} y2={ay} stroke="transparent" strokeWidth={16} />
                )}
                <line
                  x1={ax2} y1={ay2} x2={ax} y2={ay}
                  stroke={highlighted ? "#a5b4fc" : style.stroke}
                  strokeWidth={highlighted ? 3.5 : style.width}
                  opacity={style.opacity}
                  strokeLinecap="round"
                  filter={getEdgeFilter(edge.state)}
                  markerEnd={showDirected ? markerUrl : undefined}
                  style={{ transition: "all 0.3s ease" }}
                />
                {/* Weight / Flow pill */}
                <rect
                  x={mx - (flowText ? 28 : 18)} y={my - 14}
                  width={flowText ? 56 : 36} height={28}
                  rx={14} fill="#0c0c18"
                  stroke={
                    edge.state === "path" || edge.state === "matched" ? "#22c55e" :
                    edge.state === "flow" ? "#38bdf8" :
                    edge.state === "visited" ? "#6366f1" :
                    highlighted ? "#6366f1" : "#1e293b"
                  }
                  strokeWidth={1.2} opacity={0.95}
                />
                {isFlow && edge.capacity ? (
                  <>
                    <rect x={mx - (flowText ? 24 : 14)} y={my + 7} width={(flowText ? 48 : 28) * flowRatio} height={2.5} rx={1} fill="#38bdf8" opacity={0.7} />
                    <text x={mx} y={my + 4} textAnchor="middle" fontSize={15} fontWeight={700} fontFamily="monospace"
                      fill={edge.state === "path" ? "#86efac" : edge.state === "flow" ? "#7dd3fc" : "#94a3b8"}
                      style={{ transition: "fill 0.3s" }}>
                      {flowText}
                    </text>
                  </>
                ) : (
                  <text x={mx} y={my + 5} textAnchor="middle" fontSize={17} fontWeight={700} fontFamily="monospace"
                    fill={
                      edge.state === "path" || edge.state === "matched" ? "#86efac" :
                      edge.state === "visited" ? "#c7d2fe" :
                      highlighted ? "#c7d2fe" : "#64748b"
                    }
                    style={{ transition: "fill 0.3s" }}>
                    {edge.weight}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {graphNodes.map((node) => {
            const style = NODE_STYLES[node.state];
            const isStart = node.id === startNode;
            const isEnd = node.id === endNode;
            const dimmed = hoveredNode !== null && hoveredNode !== node.id && !connectedEdges.has(-1) &&
              !graphEdges.some((e, i) => connectedEdges.has(i) && (e.from === node.id || e.to === node.id));
            const isHovered = hoveredNode === node.id;

            let strokeOverride = style.stroke;
            if (node.state === "idle" && isStart) strokeOverride = "#22c55e";
            if (node.state === "idle" && isEnd) strokeOverride = "#ef4444";

            return (
              <g key={node.id}
                onClick={(e) => { e.stopPropagation(); handleNodeClick(node.id); }}
                onMouseEnter={() => { if (!isRunning) setHoveredNode(node.id); }}
                onMouseLeave={() => setHoveredNode(null)}
                style={{
                  cursor: editMode === "delete" ? "pointer" : editMode === "add-edge" ? "pointer" : pickMode ? "pointer" : "default",
                  transition: "transform 0.3s ease, opacity 0.3s",
                  transformOrigin: `${node.x}px ${node.y}px`,
                  transform: `scale(${isHovered ? style.scale * 1.1 : style.scale})`,
                  opacity: dimmed ? 0.2 : 1,
                }}>
                {(isStart || isEnd) && (node.state === "idle" || node.state === "left" || node.state === "right") && (
                  <circle cx={node.x} cy={node.y} r={NODE_R + 8} fill="none"
                    stroke={isStart ? "#22c55e" : "#ef4444"} strokeWidth={1.5} opacity={0.3} strokeDasharray="5 3">
                    <animateTransform attributeName="transform" type="rotate"
                      from={`0 ${node.x} ${node.y}`} to={`360 ${node.x} ${node.y}`} dur="8s" repeatCount="indefinite" />
                  </circle>
                )}

                {isHovered && node.state === "idle" && (
                  <circle cx={node.x} cy={node.y} r={NODE_R + 5} fill="none" stroke="#6366f1" strokeWidth={2} opacity={0.4} />
                )}

                <circle cx={node.x} cy={node.y} r={NODE_R}
                  fill={style.fill} stroke={strokeOverride}
                  strokeWidth={node.state === "active" ? 3.5 : 2.5}
                  filter={getNodeFilter(node.state)}
                  style={{ transition: "all 0.3s ease" }} />
                <text x={node.x} y={node.y + 7} textAnchor="middle"
                  fontSize={20} fontWeight={800} fontFamily="monospace"
                  fill={style.textFill}
                  style={{ transition: "fill 0.3s", pointerEvents: "none" }}>
                  {node.id}
                </text>

                {!isBipartite && isStart && (node.state === "idle") && (
                  <text x={node.x} y={node.y - NODE_R - 10} textAnchor="middle"
                    fontSize={11} fontWeight={700} fill="#22c55e" opacity={0.9}>
                    {isFlow ? "SOURCE" : "START"}
                  </text>
                )}
                {!isBipartite && isEnd && (node.state === "idle") && (
                  <text x={node.x} y={node.y - NODE_R - 10} textAnchor="middle"
                    fontSize={11} fontWeight={700} fill="#ef4444" opacity={0.9}>
                    {isFlow ? "SINK" : "END"}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 flex-wrap">
        {isBipartite ? (
          <>
            {([["Group U", "#3b82f6"], ["Group V", "#a78bfa"], ["Matched", "#22c55e"]] as [string, string][]).map(([l, c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border" style={{ borderColor: c, backgroundColor: c + "20" }} />
                <span>{l}</span>
              </div>
            ))}
          </>
        ) : isFlow ? (
          <>
            {([["Idle", "#334155"], ["Exploring", "#818cf8"], ["Augmenting", "#facc15"], ["Flow", "#38bdf8"], ["Max Flow Path", "#22c55e"]] as [string, string][]).map(([l, c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border" style={{ borderColor: c, backgroundColor: c + "20" }} />
                <span>{l}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            {([["Idle", "#6366f1"], ["Active", "#facc15"], ["Visited", "#818cf8"], ["Shortest Path", "#22c55e"]] as [string, string][]).map(([l, c]) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full border" style={{ borderColor: c, backgroundColor: c + "20" }} />
                <span>{l}</span>
              </div>
            ))}
            <span className="text-gray-600">|</span>
            <span className="text-gray-400">Use toolbar to build custom graphs</span>
          </>
        )}
      </div>
    </div>
  );
}
