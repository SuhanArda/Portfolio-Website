"use client";
import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw, Shuffle } from "lucide-react";

type BarState = "default" | "comparing" | "swapping" | "sorted" | "pivot" | "merge-left" | "merge-right" | "inserting" | "minimum";

interface Bar {
  value: number;
  state: BarState;
}

interface AnimationFrame {
  bars: Bar[];
}

type SortAlgorithm = "bubble" | "quick" | "merge" | "insertion" | "selection";


function generateRandomArray(size: number): Bar[] {
  return Array.from({ length: size }, () => ({
    value: Math.floor(Math.random() * 90) + 10,
    state: "default" as BarState,
  }));
}

// ── Bubble Sort ────────────────────────────────────────────────────

function getBubbleSortFrames(input: Bar[]): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const arr = input.map((b) => ({ ...b, state: "default" as BarState }));
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      frames.push({
        bars: arr.map((b, idx) => ({
          ...b,
          state: idx === j || idx === j + 1 ? "comparing" : idx >= n - i ? "sorted" : "default",
        })),
      });
      if (arr[j].value > arr[j + 1].value) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        frames.push({
          bars: arr.map((b, idx) => ({
            ...b,
            state: idx === j || idx === j + 1 ? "swapping" : idx >= n - i ? "sorted" : "default",
          })),
        });
      }
    }
  }
  frames.push({ bars: arr.map((b) => ({ ...b, state: "sorted" })) });
  return frames;
}

// ── Quick Sort ─────────────────────────────────────────────────────

function getQuickSortFrames(input: Bar[]): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const arr = input.map((b) => ({ ...b, state: "default" as BarState }));
  const sorted = new Set<number>();

  function snapshot(highlights: Record<number, BarState>) {
    frames.push({
      bars: arr.map((b, idx) => ({
        ...b,
        state: highlights[idx] || (sorted.has(idx) ? "sorted" : "default"),
      })),
    });
  }

  function partition(low: number, high: number): number {
    const pivotVal = arr[high].value;
    const h: Record<number, BarState> = { [high]: "pivot" };
    snapshot(h);
    let i = low - 1;
    for (let j = low; j < high; j++) {
      h[j] = "comparing";
      snapshot(h);
      if (arr[j].value <= pivotVal) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        h[i] = "swapping";
        h[j] = "swapping";
        snapshot(h);
        delete h[i];
      }
      delete h[j];
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    sorted.add(i + 1);
    snapshot({ [i + 1]: "sorted" });
    return i + 1;
  }

  function quickSort(low: number, high: number) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      sorted.add(low);
      snapshot({ [low]: "sorted" });
    }
  }

  quickSort(0, arr.length - 1);
  frames.push({ bars: arr.map((b) => ({ ...b, state: "sorted" })) });
  return frames;
}

// ── Merge Sort ─────────────────────────────────────────────────────

function getMergeSortFrames(input: Bar[]): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const arr = input.map((b) => ({ ...b, state: "default" as BarState }));

  function snap(highlights: Record<number, BarState>) {
    frames.push({
      bars: arr.map((b, idx) => ({ ...b, state: highlights[idx] || "default" })),
    });
  }

  function merge(l: number, m: number, r: number) {
    const h: Record<number, BarState> = {};
    for (let i = l; i <= m; i++) h[i] = "merge-left";
    for (let i = m + 1; i <= r; i++) h[i] = "merge-right";
    snap(h);

    const left = arr.slice(l, m + 1).map((b) => b.value);
    const right = arr.slice(m + 1, r + 1).map((b) => b.value);
    let i = 0, j = 0, k = l;

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        arr[k].value = left[i++];
      } else {
        arr[k].value = right[j++];
      }
      h[k] = "swapping";
      snap(h);
      h[k] = "comparing";
      k++;
    }
    while (i < left.length) {
      arr[k].value = left[i++];
      h[k] = "swapping";
      snap(h);
      h[k] = "comparing";
      k++;
    }
    while (j < right.length) {
      arr[k].value = right[j++];
      h[k] = "swapping";
      snap(h);
      h[k] = "comparing";
      k++;
    }
  }

  function mergeSort(l: number, r: number) {
    if (l < r) {
      const m = Math.floor((l + r) / 2);
      mergeSort(l, m);
      mergeSort(m + 1, r);
      merge(l, m, r);
    }
  }

  mergeSort(0, arr.length - 1);
  frames.push({ bars: arr.map((b) => ({ ...b, state: "sorted" })) });
  return frames;
}

// ── Insertion Sort ─────────────────────────────────────────────────

function getInsertionSortFrames(input: Bar[]): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const arr = input.map((b) => ({ ...b, state: "default" as BarState }));
  const n = arr.length;

  for (let i = 1; i < n; i++) {
    const key = arr[i].value;
    let j = i - 1;

    frames.push({
      bars: arr.map((b, idx) => ({
        ...b,
        state: idx === i ? "inserting" : idx < i ? "sorted" : "default",
      })),
    });

    while (j >= 0 && arr[j].value > key) {
      frames.push({
        bars: arr.map((b, idx) => ({
          ...b,
          state: idx === j ? "comparing" : idx === i ? "inserting" : idx < i ? "sorted" : "default",
        })),
      });

      arr[j + 1].value = arr[j].value;

      frames.push({
        bars: arr.map((b, idx) => ({
          ...b,
          state: idx === j || idx === j + 1 ? "swapping" : idx < i ? "sorted" : "default",
        })),
      });
      j--;
    }
    arr[j + 1].value = key;

    frames.push({
      bars: arr.map((b, idx) => ({
        ...b,
        state: idx <= i ? "sorted" : "default",
      })),
    });
  }
  frames.push({ bars: arr.map((b) => ({ ...b, state: "sorted" })) });
  return frames;
}

// ── Selection Sort ─────────────────────────────────────────────────

function getSelectionSortFrames(input: Bar[]): AnimationFrame[] {
  const frames: AnimationFrame[] = [];
  const arr = input.map((b) => ({ ...b, state: "default" as BarState }));
  const n = arr.length;

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      frames.push({
        bars: arr.map((b, idx) => ({
          ...b,
          state:
            idx < i ? "sorted" :
            idx === minIdx ? "minimum" :
            idx === j ? "comparing" : "default",
        })),
      });
      if (arr[j].value < arr[minIdx].value) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      frames.push({
        bars: arr.map((b, idx) => ({
          ...b,
          state: idx === i || idx === minIdx ? "swapping" : idx < i ? "sorted" : "default",
        })),
      });
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }

    frames.push({
      bars: arr.map((b, idx) => ({
        ...b,
        state: idx <= i ? "sorted" : "default",
      })),
    });
  }
  frames.push({ bars: arr.map((b) => ({ ...b, state: "sorted" })) });
  return frames;
}

// ── Frame Generator Map ────────────────────────────────────────────

const FRAME_GENERATORS: Record<SortAlgorithm, (input: Bar[]) => AnimationFrame[]> = {
  bubble: getBubbleSortFrames,
  quick: getQuickSortFrames,
  merge: getMergeSortFrames,
  insertion: getInsertionSortFrames,
  selection: getSelectionSortFrames,
};

// ── Colors ─────────────────────────────────────────────────────────

const BAR_COLORS: Record<BarState, string> = {
  default: "#6366f1",
  comparing: "#f59e0b",
  swapping: "#ef4444",
  sorted: "#22c55e",
  pivot: "#a855f7",
  "merge-left": "#3b82f6",
  "merge-right": "#8b5cf6",
  inserting: "#f59e0b",
  minimum: "#ec4899",
};

// ── Component ──────────────────────────────────────────────────────

export type { SortAlgorithm };

export default function SortingVisualizer({ algorithm = "bubble" }: { algorithm?: SortAlgorithm }) {
  const [bars, setBars] = useState<Bar[]>(() => generateRandomArray(32));
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(25);
  const cancelRef = useRef(false);

  const resetBars = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setBars(generateRandomArray(32));
  }, []);

  const shuffleBars = useCallback(() => {
    cancelRef.current = true;
    setIsRunning(false);
    setBars((prev) => {
      const shuffled = [...prev].map((b) => ({ ...b, state: "default" as BarState }));
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }, []);

  const runSort = useCallback(async () => {
    cancelRef.current = false;
    setIsRunning(true);
    const frames = FRAME_GENERATORS[algorithm](bars);
    for (const frame of frames) {
      if (cancelRef.current) break;
      setBars(frame.bars);
      await new Promise((r) => setTimeout(r, speed));
    }
    setIsRunning(false);
  }, [bars, algorithm, speed]);

  useEffect(() => {
    return () => { cancelRef.current = true; };
  }, []);

  const maxVal = Math.max(...bars.map((b) => b.value));

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Speed:</span>
          <input
            type="range"
            min={1}
            max={100}
            value={101 - speed}
            onChange={(e) => setSpeed(101 - Number(e.target.value))}
            className="w-20 accent-indigo-500"
            disabled={isRunning}
          />
        </div>

        <button
          onClick={shuffleBars}
          disabled={isRunning}
          className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30 cursor-pointer"
        >
          <Shuffle size={16} />
        </button>
        <button
          onClick={resetBars}
          className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={runSort}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/30 transition-all disabled:opacity-30 font-medium text-sm cursor-pointer"
        >
          <Play size={14} />
          Start
        </button>
      </div>

      <div className="flex items-end justify-center gap-[2px] flex-1 min-h-0 px-2">
        {bars.map((bar, idx) => (
          <motion.div
            key={idx}
            layout
            className="rounded-t-sm flex-1 min-w-[4px] max-w-[20px]"
            style={{
              height: `${(bar.value / maxVal) * 100}%`,
              backgroundColor: BAR_COLORS[bar.state],
            }}
            animate={{
              backgroundColor: BAR_COLORS[bar.state],
              height: `${(bar.value / maxVal) * 100}%`,
            }}
            transition={{ duration: 0.05 }}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-3 mt-4 text-xs text-gray-500 flex-wrap">
        {([
          ["default", "Default"],
          ["comparing", "Comparing"],
          ["swapping", "Swap"],
          ["sorted", "Sorted"],
          ["pivot", "Pivot"],
          ...(algorithm === "merge" ? [["merge-left", "Left Half"], ["merge-right", "Right Half"]] : []),
          ...(algorithm === "insertion" ? [["inserting", "Inserting"]] : []),
          ...(algorithm === "selection" ? [["minimum", "Minimum"]] : []),
        ] as [BarState, string][]).map(([state, label]) => (
          <div key={state} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: BAR_COLORS[state] }} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
