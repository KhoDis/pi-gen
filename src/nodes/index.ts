import type { NodeTypes } from "@xyflow/react";

import { AppNode } from "./types";
import { CircleNode } from "@/nodes/CircleNode.tsx";
import { OutputNode } from "@/nodes/OutputNode.tsx";

export const initialNodes: AppNode[] = [
  {
    id: "circ",
    type: "circle",
    position: { x: 0, y: 0 },
    data: {
      params: {
        radius: 50,
        color: { r: 255, g: 0, b: 0, a: 1 },
      },
    },
  },
  {
    id: "output",
    type: "output",
    position: { x: 0, y: 0 },
    data: {
      params: {
        width: 32,
        height: 32,
        scale: 3,
      },
    },
  },
];

export const nodeTypes = {
  // "position-logger": PositionLoggerNode,
  // canvas: CanvasNode,
  circle: CircleNode,
  output: OutputNode,
} satisfies NodeTypes;
