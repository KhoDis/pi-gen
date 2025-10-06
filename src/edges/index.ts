import type { Edge, EdgeTypes } from "@xyflow/react";
import { RemovableEdge } from "../components/removable-edge";

// Initial edges for the graph
export const initialEdges: Edge[] = [
  {
    id: "circle1-output1",
    source: "circle1",
    sourceHandle: "layer",
    target: "output1",
    targetHandle: "layer",
    animated: true,
    type: "removable", // Use our custom edge type
  },
];

// Custom edge types
export const edgeTypes = {
  removable: RemovableEdge,
} satisfies EdgeTypes;
