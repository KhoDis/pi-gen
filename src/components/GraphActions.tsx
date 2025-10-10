import React from "react";
import { useGraphStore } from "@/core/store/graphStore";

const STORAGE_KEY = "pi-gen-graph";

export const GraphActions: React.FC = () => {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const setGraph = useGraphStore((s) => s.setGraph);

  const saveToLocal = () => {
    const data = JSON.stringify({ nodes, edges });
    localStorage.setItem(STORAGE_KEY, data);
  };

  const loadFromLocal = () => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges))
        setGraph(parsed.nodes, parsed.edges);
    } catch {}
  };

  const exportJson = () => {
    const data = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pi-gen-graph.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const parsed = JSON.parse(text);
        if (
          parsed &&
          Array.isArray(parsed.nodes) &&
          Array.isArray(parsed.edges)
        )
          setGraph(parsed.nodes, parsed.edges);
      } catch {}
    };
    input.click();
  };

  return (
    <div className="absolute top-4 right-4 z-10 flex gap-2">
      <button
        className="px-3 py-1 rounded border bg-card text-card-foreground shadow"
        onClick={saveToLocal}
      >
        Save
      </button>
      <button
        className="px-3 py-1 rounded border bg-card text-card-foreground shadow"
        onClick={loadFromLocal}
      >
        Load
      </button>
      <button
        className="px-3 py-1 rounded border bg-card text-card-foreground shadow"
        onClick={exportJson}
      >
        Export
      </button>
      <button
        className="px-3 py-1 rounded border bg-card text-card-foreground shadow"
        onClick={importJson}
      >
        Import
      </button>
    </div>
  );
};

export default GraphActions;
