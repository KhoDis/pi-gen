import { create } from "zustand";

export interface EvalItem {
  nodeId: string;
  ms: number;
  fromCache: boolean;
  error?: string;
}

export interface EvalSummary {
  totalMs: number;
  nodesEvaluated: number;
  cacheHits: number;
  items: EvalItem[];
  timestamp: number;
}

interface DebugState {
  summary?: EvalSummary;
  setSummary: (s: EvalSummary | undefined) => void;
  clear: () => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  summary: undefined,
  setSummary: (s) => set({ summary: s }),
  clear: () => set({ summary: undefined }),
}));
