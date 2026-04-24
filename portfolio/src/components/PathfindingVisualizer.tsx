"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Play, RotateCcw, Eraser, MousePointer } from "lucide-react";

type CellType = "empty" | "wall" | "start" | "end" | "visited" | "path" | "current";

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

const ROWS = 20;
const COLS = 20;
const DEFAULT_START = { row: 2, col: 2 };
const DEFAULT_END = { row: 17, col: 17 };

type PlaceMode = "wall" | "start" | "end" | "erase";

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

function getNeighbors(node: GridNode, gridNodes: GridNode[][]) {
  const dirs = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
  ];
  const neighbors: GridNode[] = [];
  for (const [dr, dc] of dirs) {
    const nr = node.row + dr;
    const nc = node.col + dc;
    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !gridNodes[nr][nc].isWall) {
      neighbors.push(gridNodes[nr][nc]);
    }
  }
  return neighbors;
}

interface AnimStep {
  type: "visit" | "path";
  row: number;
  col: number;
}

function runAStar(grid: Cell[][], start: { row: number; col: number }, end: { row: number; col: number }): AnimStep[] {
  const steps: AnimStep[] = [];
  const nodes: GridNode[][] = Array.from({ length: ROWS }, (_, r) =>
    Array.from({ length: COLS }, (_, c) => ({
      row: r,
      col: c,
      g: Infinity,
      h: heuristic({ row: r, col: c }, end),
      f: Infinity,
      parent: null,
      isWall: grid[r][c].type === "wall",
    }))
  );

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

    if (current.row !== start.row || current.col !== start.col) {
      steps.push({ type: "visit", row: current.row, col: current.col });
    }

    if (current.row === end.row && current.col === end.col) {
      let node: GridNode | null = current;
      const pathSteps: AnimStep[] = [];
      while (node) {
        if (
          (node.row !== start.row || node.col !== start.col) &&
          (node.row !== end.row || node.col !== end.col)
        ) {
          pathSteps.unshift({ type: "path", row: node.row, col: node.col });
        }
        node = node.parent;
      }
      steps.push(...pathSteps);
      return steps;
    }

    for (const neighbor of getNeighbors(current, nodes)) {
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

function runDijkstra(grid: Cell[][], start: { row: number; col: number }, end: { row: number; col: number }): AnimStep[] {
  const steps: AnimStep[] = [];
  const nodes: GridNode[][] = Array.from({ length: ROWS }, (_, r) =>
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

    if (current.row !== start.row || current.col !== start.col) {
      steps.push({ type: "visit", row: current.row, col: current.col });
    }

    if (current.row === end.row && current.col === end.col) {
      let node: GridNode | null = current;
      const pathSteps: AnimStep[] = [];
      while (node) {
        if (
          (node.row !== start.row || node.col !== start.col) &&
          (node.row !== end.row || node.col !== end.col)
        ) {
          pathSteps.unshift({ type: "path", row: node.row, col: node.col });
        }
        node = node.parent;
      }
      steps.push(...pathSteps);
      return steps;
    }

    for (const neighbor of getNeighbors(current, nodes)) {
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

const CELL_COLORS: Record<CellType, string> = {
  empty: "rgba(255,255,255,0.03)",
  wall: "#374151",
  start: "#22c55e",
  end: "#ef4444",
  visited: "rgba(99,102,241,0.5)",
  path: "#facc15",
  current: "#818cf8",
};

export default function PathfindingVisualizer() {
  const [grid, setGrid] = useState<Cell[][]>(createEmptyGrid);
  const [algorithm, setAlgorithm] = useState<"astar" | "dijkstra">("astar");
  const [isRunning, setIsRunning] = useState(false);
  const [placeMode, setPlaceMode] = useState<PlaceMode>("wall");
  const [isMouseDown, setIsMouseDown] = useState(false);
  const cancelRef = useRef(false);

  const startPos = useRef(DEFAULT_START);
  const endPos = useRef(DEFAULT_END);

  useEffect(() => {
    let foundStart = false;
    let foundEnd = false;
    grid.forEach((row) =>
      row.forEach((cell) => {
        if (cell.type === "start") {
          startPos.current = { row: cell.row, col: cell.col };
          foundStart = true;
        }
        if (cell.type === "end") {
          endPos.current = { row: cell.row, col: cell.col };
          foundEnd = true;
        }
      })
    );
    if (!foundStart) startPos.current = DEFAULT_START;
    if (!foundEnd) endPos.current = DEFAULT_END;
  }, [grid]);

  const handleCellInteraction = useCallback(
    (row: number, col: number) => {
      if (isRunning) return;
      setGrid((prev) => {
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        const cell = next[row][col];

        if (placeMode === "start") {
          next.forEach((r) =>
            r.forEach((c) => {
              if (c.type === "start") c.type = "empty";
            })
          );
          cell.type = "start";
        } else if (placeMode === "end") {
          next.forEach((r) =>
            r.forEach((c) => {
              if (c.type === "end") c.type = "empty";
            })
          );
          cell.type = "end";
        } else if (placeMode === "erase") {
          if (cell.type === "wall" || cell.type === "visited" || cell.type === "path") {
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
          type:
            cell.type === "visited" || cell.type === "path" || cell.type === "current"
              ? "empty"
              : cell.type,
        }))
      )
    );
  }, []);

  const resetGrid = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setGrid(createEmptyGrid());
  }, []);

  const solve = useCallback(async () => {
    cancelRef.current = false;
    clearVisualization();
    setIsRunning(true);

    await new Promise((r) => setTimeout(r, 50));

    const currentGrid = grid.map((row) =>
      row.map((cell) => ({
        ...cell,
        type:
          cell.type === "visited" || cell.type === "path" || cell.type === "current"
            ? ("empty" as CellType)
            : cell.type,
      }))
    );

    const steps =
      algorithm === "astar"
        ? runAStar(currentGrid, startPos.current, endPos.current)
        : runDijkstra(currentGrid, startPos.current, endPos.current);

    for (const step of steps) {
      if (cancelRef.current) break;

      setGrid((prev) => {
        const next = prev.map((r) => r.map((c) => ({ ...c })));
        if (next[step.row][step.col].type !== "start" && next[step.row][step.col].type !== "end") {
          next[step.row][step.col].type = step.type === "path" ? "path" : "visited";
        }
        return next;
      });

      await new Promise((r) => setTimeout(r, step.type === "path" ? 40 : 15));
    }

    setIsRunning(false);
  }, [grid, algorithm, clearVisualization]);

  useEffect(() => {
    return () => {
      cancelRef.current = true;
    };
  }, []);

  const modeConfig: Record<PlaceMode, { label: string; color: string }> = {
    wall: { label: "Wall", color: "#6b7280" },
    start: { label: "Start", color: "#22c55e" },
    end: { label: "End", color: "#ef4444" },
    erase: { label: "Erase", color: "#f59e0b" },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex bg-white/5 rounded-lg overflow-hidden border border-white/10">
          {(["astar", "dijkstra"] as const).map((algo) => (
            <button
              key={algo}
              disabled={isRunning}
              onClick={() => setAlgorithm(algo)}
              className={`px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                algorithm === algo
                  ? "bg-indigo-500/30 text-indigo-300"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {algo === "astar" ? "A* Search" : "Dijkstra"}
            </button>
          ))}
        </div>

        <div className="flex bg-white/5 rounded-lg overflow-hidden border border-white/10">
          {(["wall", "start", "end", "erase"] as const).map((mode) => (
            <button
              key={mode}
              disabled={isRunning}
              onClick={() => setPlaceMode(mode)}
              className={`px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                placeMode === mode
                  ? "text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              } ${isRunning ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{
                backgroundColor:
                  placeMode === mode ? modeConfig[mode].color + "33" : undefined,
              }}
            >
              {mode === "erase" ? <Eraser size={14} /> : mode === "wall" ? <MousePointer size={14} /> : modeConfig[mode].label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={resetGrid}
            className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={solve}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-30 font-medium text-sm cursor-pointer"
          >
            <Play size={14} />
            Solve
          </button>
        </div>
      </div>

      <div
        className="grid gap-[1px] flex-1 w-full aspect-square max-h-[480px] mx-auto select-none"
        style={{
          gridTemplateColumns: `repeat(${COLS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        }}
        onMouseLeave={() => setIsMouseDown(false)}
      >
        {grid.flat().map((cell) => (
          <div
            key={`${cell.row}-${cell.col}`}
            className="rounded-[2px] transition-colors duration-150 cursor-pointer hover:brightness-125"
            style={{ backgroundColor: CELL_COLORS[cell.type] }}
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

      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 flex-wrap">
        {Object.entries(CELL_COLORS)
          .filter(([key]) => key !== "current")
          .map(([state, color]) => (
            <div key={state} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm border border-white/10"
                style={{ backgroundColor: color }}
              />
              <span className="capitalize">{state}</span>
            </div>
          ))}
      </div>
    </div>
  );
}
