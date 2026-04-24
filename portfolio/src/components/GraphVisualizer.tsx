"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw, Eraser, MousePointer, Zap } from "lucide-react";

type CellType = "empty" | "wall" | "start" | "end" | "visited" | "path" | "current" | "head";

interface Cell {
  row: number;
  col: number;
  type: CellType;
}

interface GridNode {
  row: number;
  col: number;
  g: number;
  h: number;
  f: number;
  parent: GridNode | null;
  isWall: boolean;
}

export type GraphAlgorithm = "dijkstra" | "astar" | "bfs" | "dfs";

const ROWS = 21;
const COLS = 40;
const DEFAULT_START = { row: 10, col: 5 };
const DEFAULT_END = { row: 10, col: 34 };

type PlaceMode = "wall" | "start" | "end" | "erase";

const DIRS = [
  [0, 1], [1, 0], [0, -1], [-1, 0],
];

function createEmptyGrid(): Cell[][] {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => {
      let type: CellType = "empty";
      if (r === DEFAULT_START.row && c === DEFAULT_START.col) type = "start";
      if (r === DEFAULT_END.row && c === DEFAULT_END.col) type = "end";
      return { row: r, col: c, type };
    })
  );
}

function heuristic(a: { row: number; col: number }, b: { row: number; col: number }) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function getNeighborNodes(node: GridNode, gridNodes: GridNode[][]) {
  const neighbors: GridNode[] = [];
  for (const [dr, dc] of DIRS) {
    const nr = node.row + dr;
    const nc = node.col + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !gridNodes[nr][nc].isWall) {
      neighbors.push(gridNodes[nr][nc]);
    }
  }
  return neighbors;
}

interface AnimStep {
  type: "visit" | "path" | "head";
  row: number;
  col: number;
}

function buildNodeGrid(grid: Cell[][]): GridNode[][] {
  return Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      row: r,
      col: c,
      g: Infinity,
      h: 0,
      f: Infinity,
      parent: null,
      isWall: grid[r][c].type === "wall",
    }))
  );
}

function reconstructPath(
  endNode: GridNode,
  start: { row: number; col: number },
  end: { row: number; col: number }
): AnimStep[] {
  const pathSteps: AnimStep[] = [];
  let node: GridNode | null = endNode;
  while (node) {
    if (
      (node.row !== start.row || node.col !== start.col) &&
      (node.row !== end.row || node.col !== end.col)
    ) {
      pathSteps.unshift({ type: "path", row: node.row, col: node.col });
    }
    node = node.parent;
  }
  return pathSteps;
}

function isStartOrEnd(row: number, col: number, start: { row: number; col: number }, end: { row: number; col: number }) {
  return (row === start.row && col === start.col) || (row === end.row && col === end.col);
}

// ────── Dijkstra ──────
function runDijkstra(grid: Cell[][], start: { row: number; col: number }, end: { row: number; col: number }): AnimStep[] {
  const steps: AnimStep[] = [];
  const nodes = buildNodeGrid(grid);
  const startNode = nodes[start.row][start.col];
  startNode.g = 0;
  startNode.f = 0;

  const open: GridNode[] = [startNode];
  const closed = new Set<string>();

  while (open.length > 0) {
    open.sort((a, b) => a.g - b.g);
    const current = open.shift()!;
    const key = `${current.row},${current.col}`;
    if (closed.has(key)) continue;
    closed.add(key);

    if (!isStartOrEnd(current.row, current.col, start, end)) {
      steps.push({ type: "head", row: current.row, col: current.col });
      steps.push({ type: "visit", row: current.row, col: current.col });
    }

    if (current.row === end.row && current.col === end.col) {
      steps.push(...reconstructPath(current, start, end));
      return steps;
    }

    for (const neighbor of getNeighborNodes(current, nodes)) {
      const nKey = `${neighbor.row},${neighbor.col}`;
      if (closed.has(nKey)) continue;
      const tentG = current.g + 1;
      if (tentG < neighbor.g) {
        neighbor.g = tentG;
        neighbor.f = tentG;
        neighbor.parent = current;
        open.push(neighbor);
      }
    }
  }
  return steps;
}

// ────── A* Search ──────
function runAStar(grid: Cell[][], start: { row: number; col: number }, end: { row: number; col: number }): AnimStep[] {
  const steps: AnimStep[] = [];
  const nodes = buildNodeGrid(grid);
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      nodes[r][c].h = heuristic({ row: r, col: c }, end);

  const startNode = nodes[start.row][start.col];
  startNode.g = 0;
  startNode.f = startNode.h;

  const open: GridNode[] = [startNode];
  const closed = new Set<string>();

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    const key = `${current.row},${current.col}`;
    if (closed.has(key)) continue;
    closed.add(key);

    if (!isStartOrEnd(current.row, current.col, start, end)) {
      steps.push({ type: "head", row: current.row, col: current.col });
      steps.push({ type: "visit", row: current.row, col: current.col });
    }

    if (current.row === end.row && current.col === end.col) {
      steps.push(...reconstructPath(current, start, end));
      return steps;
    }

    for (const neighbor of getNeighborNodes(current, nodes)) {
      const nKey = `${neighbor.row},${neighbor.col}`;
      if (closed.has(nKey)) continue;
      const tentG = current.g + 1;
      if (tentG < neighbor.g) {
        neighbor.g = tentG;
        neighbor.f = tentG + neighbor.h;
        neighbor.parent = current;
        open.push(neighbor);
      }
    }
  }
  return steps;
}

// ────── BFS ──────
function runBFS(grid: Cell[][], start: { row: number; col: number }, end: { row: number; col: number }): AnimStep[] {
  const steps: AnimStep[] = [];
  const nodes = buildNodeGrid(grid);
  const startNode = nodes[start.row][start.col];
  startNode.g = 0;

  const queue: GridNode[] = [startNode];
  const visited = new Set<string>();
  visited.add(`${start.row},${start.col}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (!isStartOrEnd(current.row, current.col, start, end)) {
      steps.push({ type: "head", row: current.row, col: current.col });
      steps.push({ type: "visit", row: current.row, col: current.col });
    }

    if (current.row === end.row && current.col === end.col) {
      steps.push(...reconstructPath(current, start, end));
      return steps;
    }

    for (const neighbor of getNeighborNodes(current, nodes)) {
      const nKey = `${neighbor.row},${neighbor.col}`;
      if (visited.has(nKey)) continue;
      visited.add(nKey);
      neighbor.parent = current;
      queue.push(neighbor);
    }
  }
  return steps;
}

// ────── DFS ──────
function runDFS(grid: Cell[][], start: { row: number; col: number }, end: { row: number; col: number }): AnimStep[] {
  const steps: AnimStep[] = [];
  const nodes = buildNodeGrid(grid);
  const startNode = nodes[start.row][start.col];

  const stack: GridNode[] = [startNode];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop()!;
    const key = `${current.row},${current.col}`;
    if (visited.has(key)) continue;
    visited.add(key);

    if (!isStartOrEnd(current.row, current.col, start, end)) {
      steps.push({ type: "head", row: current.row, col: current.col });
      steps.push({ type: "visit", row: current.row, col: current.col });
    }

    if (current.row === end.row && current.col === end.col) {
      steps.push(...reconstructPath(current, start, end));
      return steps;
    }

    const neighbors = getNeighborNodes(current, nodes);
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const neighbor = neighbors[i];
      const nKey = `${neighbor.row},${neighbor.col}`;
      if (!visited.has(nKey)) {
        neighbor.parent = current;
        stack.push(neighbor);
      }
    }
  }
  return steps;
}

const ALGO_RUNNERS: Record<
  GraphAlgorithm,
  (grid: Cell[][], start: { row: number; col: number }, end: { row: number; col: number }) => AnimStep[]
> = {
  dijkstra: runDijkstra,
  astar: runAStar,
  bfs: runBFS,
  dfs: runDFS,
};

const ALGO_LABELS: Record<GraphAlgorithm, string> = {
  dijkstra: "Dijkstra",
  astar: "A* Search",
  bfs: "BFS",
  dfs: "DFS",
};

const CELL_COLORS: Record<CellType, string> = {
  empty: "rgba(255,255,255,0.03)",
  wall: "#1e293b",
  start: "#22c55e",
  end: "#ef4444",
  visited: "rgba(99,102,241,0.35)",
  path: "#facc15",
  current: "#818cf8",
  head: "#f59e0b",
};

const CELL_SHADOWS: Partial<Record<CellType, string>> = {
  start: "0 0 8px rgba(34,197,94,0.6)",
  end: "0 0 8px rgba(239,68,68,0.6)",
  path: "0 0 6px rgba(250,204,21,0.5)",
  head: "0 0 8px rgba(245,158,11,0.7)",
};

interface GraphVisualizerProps {
  algorithm: GraphAlgorithm;
}

export default function GraphVisualizer({ algorithm }: GraphVisualizerProps) {
  const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid);
  const [isRunning, setIsRunning] = useState(false);
  const [placeMode, setPlaceMode] = useState<PlaceMode>("wall");
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [speed, setSpeed] = useState(12);
  const [stats, setStats] = useState({ visited: 0, pathLen: 0, time: 0 });
  const cancelRef = useRef(false);
  const startPos = useRef(DEFAULT_START);
  const endPos = useRef(DEFAULT_END);

  useEffect(() => {
    grid.forEach((row) =>
      row.forEach((cell) => {
        if (cell.type === "start") startPos.current = { row: cell.row, col: cell.col };
        if (cell.type === "end") endPos.current = { row: cell.row, col: cell.col };
      })
    );
  }, [grid]);

  const handleCellInteraction = useCallback(
    (row: number, col: number) => {
      if (isRunning) return;
      setGrid((prev) => {
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        const cell = next[row][col];

        if (placeMode === "start") {
          next.forEach((r) => r.forEach((c) => { if (c.type === "start") c.type = "empty"; }));
          cell.type = "start";
        } else if (placeMode === "end") {
          next.forEach((r) => r.forEach((c) => { if (c.type === "end") c.type = "empty"; }));
          cell.type = "end";
        } else if (placeMode === "erase") {
          if (cell.type === "wall" || cell.type === "visited" || cell.type === "path" || cell.type === "current" || cell.type === "head") {
            cell.type = "empty";
          }
        } else {
          if (cell.type === "empty") cell.type = "wall";
          else if (cell.type === "wall") cell.type = "empty";
        }
        return next;
      });
    },
    [isRunning, placeMode]
  );

  const clearVisualization = useCallback(() => {
    setGrid((prev) =>
      prev.map((row) =>
        row.map((cell) => ({
          ...cell,
          type: (cell.type === "visited" || cell.type === "path" || cell.type === "current" || cell.type === "head")
            ? "empty" as CellType
            : cell.type,
        }))
      )
    );
    setStats({ visited: 0, pathLen: 0, time: 0 });
  }, []);

  const resetGrid = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setGrid(createEmptyGrid());
    setStats({ visited: 0, pathLen: 0, time: 0 });
  }, []);

  const generateMaze = useCallback(() => {
    if (isRunning) return;
    const newGrid = createEmptyGrid();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (newGrid[r][c].type === "empty" && Math.random() < 0.3) {
          newGrid[r][c].type = "wall";
        }
      }
    }
    setGrid(newGrid);
    setStats({ visited: 0, pathLen: 0, time: 0 });
  }, [isRunning]);

  const solve = useCallback(async () => {
    cancelRef.current = false;
    clearVisualization();
    setIsRunning(true);

    await new Promise((r) => setTimeout(r, 50));

    const currentGrid: Cell[][] = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        type: (cell.type === "visited" || cell.type === "path" || cell.type === "current" || cell.type === "head")
          ? ("empty" as CellType)
          : cell.type,
      }))
    );

    const t0 = performance.now();
    const steps = ALGO_RUNNERS[algorithm](currentGrid, startPos.current, endPos.current);
    const elapsed = performance.now() - t0;

    let visitedCount = 0;
    let pathCount = 0;
    let prevHead: { row: number; col: number } | null = null;

    for (const step of steps) {
      if (cancelRef.current) break;

      if (step.type === "head") {
        prevHead = { row: step.row, col: step.col };
        setGrid((prev) => {
          const next = prev.map((r) => r.map((c) => ({ ...c })));
          if (!isStartOrEnd(step.row, step.col, startPos.current, endPos.current)) {
            next[step.row][step.col].type = "head";
          }
          return next;
        });
        await new Promise((r) => setTimeout(r, speed));
      } else if (step.type === "visit") {
        visitedCount++;
        setGrid((prev) => {
          const next = prev.map((r) => r.map((c) => ({ ...c })));
          if (prevHead && !isStartOrEnd(prevHead.row, prevHead.col, startPos.current, endPos.current)) {
            if (next[prevHead.row][prevHead.col].type === "head") {
              next[prevHead.row][prevHead.col].type = "visited";
            }
          }
          if (!isStartOrEnd(step.row, step.col, startPos.current, endPos.current)) {
            next[step.row][step.col].type = "visited";
          }
          return next;
        });
      } else {
        pathCount++;
        setGrid((prev) => {
          const next = prev.map((r) => r.map((c) => ({ ...c })));
          if (!isStartOrEnd(step.row, step.col, startPos.current, endPos.current)) {
            next[step.row][step.col].type = "path";
          }
          return next;
        });
        await new Promise((r) => setTimeout(r, 30));
      }
    }

    setStats({ visited: visitedCount, pathLen: pathCount, time: Math.round(elapsed * 100) / 100 });
    setIsRunning(false);
  }, [grid, algorithm, speed, clearVisualization]);

  useEffect(() => {
    return () => { cancelRef.current = true; };
  }, []);

  const modeConfig: Record<PlaceMode, { label: string; icon?: React.ReactNode; color: string }> = {
    wall: { label: "Wall", icon: <MousePointer size={13} />, color: "#475569" },
    start: { label: "Start", color: "#22c55e" },
    end: { label: "End", color: "#ef4444" },
    erase: { label: "Erase", icon: <Eraser size={13} />, color: "#f59e0b" },
  };

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex bg-white/5 rounded-lg overflow-hidden border border-white/10">
          {(["wall", "start", "end", "erase"] as const).map((mode) => (
            <button
              key={mode}
              disabled={isRunning}
              onClick={() => setPlaceMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                placeMode === mode ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
              } ${isRunning ? "opacity-40 cursor-not-allowed" : ""}`}
              style={{
                backgroundColor: placeMode === mode ? modeConfig[mode].color + "30" : undefined,
                borderBottom: placeMode === mode ? `2px solid ${modeConfig[mode].color}` : "2px solid transparent",
              }}
            >
              {modeConfig[mode].icon || null}
              {modeConfig[mode].label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Speed:</span>
          <input
            type="range"
            min={1}
            max={50}
            value={51 - speed}
            onChange={(e) => setSpeed(51 - Number(e.target.value))}
            className="w-20 accent-indigo-500"
            disabled={isRunning}
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={generateMaze}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 text-xs cursor-pointer"
          >
            <Zap size={13} />
            Random Maze
          </button>
          <button
            onClick={resetGrid}
            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <RotateCcw size={15} />
          </button>
          <button
            onClick={solve}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-30 font-medium text-sm cursor-pointer"
          >
            <Play size={14} />
            Solve
          </button>
        </div>
      </div>

      {/* Grid */}
      <div
        className="grid gap-[1px] flex-1 w-full mx-auto select-none rounded-lg overflow-hidden border border-white/5 bg-white/[0.02]"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
          maxHeight: "clamp(300px, 55vh, 520px)",
        }}
        onMouseLeave={() => setIsMouseDown(false)}
      >
        {grid.flat().map((cell) => (
          <div
            key={`${cell.row}-${cell.col}`}
            className="transition-all duration-100 cursor-pointer"
            style={{
              backgroundColor: CELL_COLORS[cell.type],
              boxShadow: CELL_SHADOWS[cell.type] || "none",
              borderRadius: cell.type === "start" || cell.type === "end" ? "50%" : "1px",
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              setIsMouseDown(true);
              handleCellInteraction(cell.row, cell.col);
            }}
            onMouseEnter={() => {
              if (isMouseDown) handleCellInteraction(cell.row, cell.col);
            }}
            onMouseUp={() => setIsMouseDown(false)}
          />
        ))}
      </div>

      {/* Footer: Legend + Stats */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
          {([
            ["empty", "Empty"],
            ["wall", "Wall"],
            ["start", "Start"],
            ["end", "End"],
            ["head", "Active"],
            ["visited", "Visited"],
            ["path", "Path"],
          ] as [CellType, string][]).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 border border-white/10"
                style={{
                  backgroundColor: CELL_COLORS[type],
                  borderRadius: type === "start" || type === "end" ? "50%" : "2px",
                  boxShadow: CELL_SHADOWS[type] || "none",
                }}
              />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {(stats.visited > 0 || stats.pathLen > 0) && (
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-indigo-400">
              Visited: <span className="text-white font-bold">{stats.visited}</span>
            </span>
            <span className="text-yellow-400">
              Path: <span className="text-white font-bold">{stats.pathLen}</span>
            </span>
            <span className="text-gray-500">
              Compute: <span className="text-gray-300">{stats.time}ms</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
