"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, BarChart3, Network, Clock, HardDrive } from "lucide-react";
import SortingVisualizer, { type SortAlgorithm } from "./SortingVisualizer";
import NetworkGraphVisualizer, { type GraphAlgorithm } from "./NetworkGraphVisualizer";

type AlgorithmCategory = "sorting" | "graph";
type AlgorithmId = "bubble" | "quick" | "merge" | "insertion" | "selection" | "dijkstra" | "astar" | "bfs" | "dfs" | "ford-fulkerson" | "bipartite";

interface AlgorithmInfo {
  id: AlgorithmId;
  name: string;
  category: AlgorithmCategory;
  description: string;
  timeComplexity: { best: string; average: string; worst: string };
  spaceComplexity: string;
  highlights: string[];
}

const ALGORITHMS: AlgorithmInfo[] = [
  {
    id: "bubble",
    name: "Bubble Sort",
    category: "sorting",
    description:
      "A simple comparison-based sorting algorithm. It repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)",
    highlights: ["In-place", "Stable", "Adaptive"],
  },
  {
    id: "quick",
    name: "Quick Sort",
    category: "sorting",
    description:
      "An efficient, divide-and-conquer sorting algorithm. It works by selecting a 'pivot' element and partitioning the other elements into two sub-arrays according to whether they are less than or greater than the pivot.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n²)" },
    spaceComplexity: "O(log n)",
    highlights: ["In-place", "Not Stable", "Cache Friendly"],
  },
  {
    id: "merge",
    name: "Merge Sort",
    category: "sorting",
    description:
      "A stable, divide-and-conquer sorting algorithm. It recursively splits the array into halves, sorts each half, then merges them back in order. The splitting and merging phases are visually distinct — left and right halves are highlighted in different colors during the merge step.",
    timeComplexity: { best: "O(n log n)", average: "O(n log n)", worst: "O(n log n)" },
    spaceComplexity: "O(n)",
    highlights: ["Stable", "Divide & Conquer", "Predictable"],
  },
  {
    id: "insertion",
    name: "Insertion Sort",
    category: "sorting",
    description:
      "A simple and adaptive sorting algorithm that builds the sorted portion one element at a time. It picks each unsorted element and inserts it into its correct position within the already-sorted left side, shifting larger elements to the right.",
    timeComplexity: { best: "O(n)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)",
    highlights: ["In-place", "Stable", "Adaptive"],
  },
  {
    id: "selection",
    name: "Selection Sort",
    category: "sorting",
    description:
      "A comparison-based sorting algorithm that divides the array into sorted and unsorted regions. It repeatedly scans the unsorted region to find the minimum element (highlighted with a distinct cursor color) and swaps it into the sorted region's next position.",
    timeComplexity: { best: "O(n²)", average: "O(n²)", worst: "O(n²)" },
    spaceComplexity: "O(1)",
    highlights: ["In-place", "Not Stable", "Simple"],
  },
  {
    id: "dijkstra",
    name: "Dijkstra's Algorithm",
    category: "graph",
    description:
      "A classic shortest-path algorithm for weighted graphs with non-negative edge weights. It systematically explores all reachable nodes by always expanding the cheapest unexplored node first, guaranteeing the globally optimal shortest path from source to destination.",
    timeComplexity: { best: "O(E + V log V)", average: "O(E + V log V)", worst: "O(V²)" },
    spaceComplexity: "O(V)",
    highlights: ["Optimal", "Greedy", "No Negative Weights"],
  },
  {
    id: "astar",
    name: "A* Search",
    category: "graph",
    description:
      "An informed best-first search algorithm that finds the shortest path using a heuristic function h(n) to estimate the remaining cost to the goal. Combines Dijkstra's optimality guarantees with greedy speed by evaluating f(n) = g(n) + h(n) at each step.",
    timeComplexity: { best: "O(E)", average: "O(E log V)", worst: "O(V²)" },
    spaceComplexity: "O(V)",
    highlights: ["Optimal", "Heuristic-based", "Complete"],
  },
  {
    id: "bfs",
    name: "BFS (Breadth-First Search)",
    category: "graph",
    description:
      "Explores a graph level by level, visiting all nodes at distance d before any node at distance d+1. Uses a FIFO queue to manage the frontier. Guarantees the shortest path in unweighted graphs and is the basis of many network and social-graph algorithms.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V)",
    highlights: ["Shortest Path (unweighted)", "Level-order", "Complete"],
  },
  {
    id: "dfs",
    name: "DFS (Depth-First Search)",
    category: "graph",
    description:
      "Explores a graph by going as deep as possible along each branch before backtracking. Uses a LIFO stack (or recursion). Memory-efficient for deep graphs but does not guarantee the shortest path. Foundation for topological sort, cycle detection, and connected-component analysis.",
    timeComplexity: { best: "O(V + E)", average: "O(V + E)", worst: "O(V + E)" },
    spaceComplexity: "O(V)",
    highlights: ["No Shortest Path", "Stack-based", "Backtracking"],
  },
  {
    id: "ford-fulkerson",
    name: "Ford-Fulkerson (Max Flow)",
    category: "graph",
    description:
      "Computes the maximum flow from a source node to a sink node in a directed, capacitated network. Uses the Edmonds-Karp variant (BFS-based augmenting paths) to repeatedly find paths with available capacity and push flow along them until no more augmenting paths exist.",
    timeComplexity: { best: "O(VE²)", average: "O(VE²)", worst: "O(VE²)" },
    spaceComplexity: "O(V + E)",
    highlights: ["Directed Graph", "Capacitated Edges", "Augmenting Paths"],
  },
  {
    id: "bipartite",
    name: "Bipartite Matching",
    category: "graph",
    description:
      "Finds the maximum cardinality matching in a bipartite graph — the largest set of edges with no shared vertices. Uses augmenting path search (Hungarian method) to iteratively improve the matching by finding alternating paths between unmatched left-side and right-side nodes.",
    timeComplexity: { best: "O(V·E)", average: "O(V·E)", worst: "O(V·E)" },
    spaceComplexity: "O(V + E)",
    highlights: ["Two-Group Layout", "Maximum Matching", "Augmenting Paths"],
  },
];

const CATEGORIES = [
  { id: "sorting" as const, label: "Sorting Algorithms", icon: BarChart3 },
  { id: "graph" as const, label: "Graph Algorithms", icon: Network },
];

const GRAPH_ALGO_MAP: Record<string, GraphAlgorithm> = {
  dijkstra: "dijkstra",
  astar: "astar",
  bfs: "bfs",
  dfs: "dfs",
  "ford-fulkerson": "ford-fulkerson",
  bipartite: "bipartite",
};

interface AlgorithmsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlgorithmsPanel({ isOpen, onClose }: AlgorithmsPanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<AlgorithmCategory>("sorting");
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmId>("bubble");

  const currentAlgo = ALGORITHMS.find((a) => a.id === selectedAlgorithm)!;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[95vw] h-[90vh] max-w-7xl bg-[#0a0a0f]/95 border border-white/10 rounded-2xl shadow-2xl shadow-indigo-500/10 flex overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={20} />
            </button>

            {/* Left Sidebar */}
            <div className="w-64 min-w-[16rem] border-r border-white/10 flex flex-col bg-white/[0.02]">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  Algorithms Lab
                </h2>
                <p className="text-xs text-gray-500 mt-1">Interactive visualizations</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = selectedCategory === cat.id;
                  return (
                    <div key={cat.id}>
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          const firstInCat = ALGORITHMS.find((a) => a.category === cat.id);
                          if (firstInCat) setSelectedAlgorithm(firstInCat.id);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                          isActive
                            ? "bg-indigo-500/15 text-indigo-300 border border-indigo-400/20"
                            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <Icon size={16} />
                        {cat.label}
                      </button>

                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-2 ml-4 space-y-1"
                        >
                          {ALGORITHMS.filter((a) => a.category === cat.id).map((algo) => (
                            <button
                              key={algo.id}
                              onClick={() => setSelectedAlgorithm(algo.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all cursor-pointer ${
                                selectedAlgorithm === algo.id
                                  ? "bg-white/10 text-white"
                                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                              }`}
                            >
                              <ChevronRight
                                size={12}
                                className={
                                  selectedAlgorithm === algo.id ? "text-indigo-400" : "text-gray-600"
                                }
                              />
                              {algo.name}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Info Header */}
              <div className="p-6 border-b border-white/10 bg-white/[0.01]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">{currentAlgo.name}</h3>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed max-w-2xl">
                      {currentAlgo.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Clock size={12} className="text-emerald-400" />
                    <span className="text-xs text-emerald-300">
                      Best: <span className="font-mono font-bold">{currentAlgo.timeComplexity.best}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Clock size={12} className="text-amber-400" />
                    <span className="text-xs text-amber-300">
                      Avg: <span className="font-mono font-bold">{currentAlgo.timeComplexity.average}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                    <Clock size={12} className="text-red-400" />
                    <span className="text-xs text-red-300">
                      Worst: <span className="font-mono font-bold">{currentAlgo.timeComplexity.worst}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <HardDrive size={12} className="text-purple-400" />
                    <span className="text-xs text-purple-300">
                      Space: <span className="font-mono font-bold">{currentAlgo.spaceComplexity}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {currentAlgo.highlights.map((h) => (
                      <span
                        key={h}
                        className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-white/5 text-gray-400 border border-white/10"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visualizer Area */}
              <div className="flex-1 p-6 overflow-auto">
                <AnimatePresence mode="wait">
                  {selectedCategory === "sorting" ? (
                    <motion.div
                      key={`sorting-${selectedAlgorithm}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <SortingVisualizer algorithm={selectedAlgorithm as SortAlgorithm} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`graph-${selectedAlgorithm}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <NetworkGraphVisualizer
                        algorithm={GRAPH_ALGO_MAP[selectedAlgorithm] || "dijkstra"}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
