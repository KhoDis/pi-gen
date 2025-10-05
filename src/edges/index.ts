import type { Edge, EdgeTypes } from "@xyflow/react";

// Initial edges for the graph
export const initialEdges: Edge[] = [
  {
    id: "circle1-output1",
    source: "circle1",
    sourceHandle: "layer",
    target: "output1",
    targetHandle: "layer",
    animated: true,
  },
];

// Custom edge types
export const edgeTypes = {
  // Add your custom edge types here
} satisfies EdgeTypes;
