import React, { useMemo, useState } from "react";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { useGraphStore } from "@/core/store/graphStore";

/**
 * Simple registry-driven node palette.
 * - Click a node type to add it to the canvas at an offset position.
 */
export const NodePalette: React.FC = () => {
  const addNode = useGraphStore((s) => s.addNode);
  const [isOpen, setIsOpen] = useState(true);
  const [nextOffset, setNextOffset] = useState(0);

  const byCategory = useMemo(() => nodeRegistry.getByCategory(), []);

  const handleAdd = (type: string) => {
    const position = { x: 80 + (nextOffset % 4) * 40, y: 80 + nextOffset * 10 };
    addNode(type, position, {} as any);
    setNextOffset((n) => n + 1);
  };

  return (
    <div className="absolute top-4 left-4 z-10">
      <div className="mb-2">
        <button
          className="px-3 py-1 rounded border bg-card text-card-foreground shadow"
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? "Hide Nodes" : "Show Nodes"}
        </button>
      </div>
      {isOpen && (
        <div className="w-64 max-h-[70vh] overflow-auto rounded border bg-card text-card-foreground shadow p-2 space-y-3">
          {Object.entries(byCategory).map(([category, entries]) => (
            <div key={category}>
              <div className="text-xs font-semibold opacity-70 mb-1">
                {category}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {entries.map((e) => (
                  <button
                    key={e.type}
                    className="text-left px-2 py-2 rounded border hover:bg-accent hover:text-accent-foreground"
                    title={e.description}
                    onClick={() => handleAdd(e.type)}
                  >
                    <div className="text-sm font-medium">{e.label}</div>
                    <div className="text-[10px] opacity-60 truncate">
                      {e.type}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NodePalette;
