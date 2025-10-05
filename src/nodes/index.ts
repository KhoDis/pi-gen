import type { NodeTypes } from "@xyflow/react";

import { AppNode } from "./types";
import { CircleNode } from "../components/nodes/CircleNode";
import { OutputNode } from "./OutputNode";

// Initial nodes for the graph
export const initialNodes: AppNode[] = [
  {
    id: "circle1",
    type: "circle",
    position: { x: 100, y: 100 },
    data: {
      params: {
        radius: 50,
        color: { r: 255, g: 0, b: 0, a: 1 },
      },
    },
  },
  {
    id: "output1",
    type: "output",
    position: { x: 400, y: 100 },
    data: {
      params: {
        width: 32,
        height: 32,
        scale: 3,
      },
    },
  },
];

// Initial edges connecting the nodes
export const initialEdges = [
  {
    id: "circle1-output1",
    source: "circle1",
    sourceHandle: "layer",
    target: "output1",
    targetHandle: "layer",
  },
];

// Node types for ReactFlow
export const nodeTypes = {
  circle: CircleNode,
  output: OutputNode,
} satisfies NodeTypes;
