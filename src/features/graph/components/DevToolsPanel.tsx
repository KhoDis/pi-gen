import React, { useMemo, useState } from "react";
import { useDebugStore } from "@/core/store/debugStore";

export const DevToolsPanel: React.FC = () => {
  const summary = useDebugStore((s) => s.summary);
  const [open, setOpen] = useState<boolean>(false);

  const slowest = useMemo(() => {
    if (!summary) return [] as { nodeId: string; ms: number }[];
    return summary.items
      .filter((i) => !i.fromCache && !i.error)
      .sort((a, b) => b.ms - a.ms)
      .slice(0, 8)
      .map((i) => ({ nodeId: i.nodeId, ms: Math.round(i.ms * 10) / 10 }));
  }, [summary]);

  if (!import.meta.env.DEV) return null;

  return (
    <div className="absolute bottom-4 right-4 z-50">
      <button
        className="px-3 py-1 rounded border bg-card text-card-foreground shadow"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? "Hide DevTools" : "Show DevTools"}
      </button>
      {open && (
        <div className="mt-2 w-[320px] max-h-[50vh] overflow-auto rounded border bg-card text-card-foreground shadow p-3 text-xs space-y-2">
          <div className="text-sm font-semibold">Evaluation</div>
          {summary ? (
            <div className="space-y-1">
              <div>Total: {Math.round(summary.totalMs * 10) / 10} ms</div>
              <div>Nodes evaluated: {summary.nodesEvaluated}</div>
              <div>Cache hits: {summary.cacheHits}</div>
              <div>
                Timestamp: {new Date(summary.timestamp).toLocaleTimeString()}
              </div>
              {slowest.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium">Slowest nodes</div>
                  <ul className="list-disc pl-4">
                    {slowest.map((s) => (
                      <li key={s.nodeId}>
                        {s.nodeId}: {s.ms} ms
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {summary.items.some((i) => i.error) && (
                <div className="mt-2">
                  <div className="font-medium">Errors</div>
                  <ul className="list-disc pl-4 text-red-600">
                    {summary.items
                      .filter((i) => i.error)
                      .map((i) => (
                        <li key={i.nodeId}>
                          {i.nodeId}: {i.error}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div>No evaluation data yet</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DevToolsPanel;
