import type { NodeTypes } from "@xyflow/react";

import { PositionLoggerNode } from "./PositionLoggerNode";
import { AppNode } from "./types";
// import { CanvasNode } from "./CanvasNode.tsx";
import { CircleNode } from "@/nodes/CircleNode.tsx";

export const initialNodes: AppNode[] = [
  { id: "a", type: "input", position: { x: 0, y: 0 }, data: { label: "wire" } },
  {
    id: "b",
    type: "position-logger",
    position: { x: -100, y: 100 },
    data: { label: "drag me!" },
  },
  { id: "c", position: { x: 100, y: 100 }, data: { label: "your ideas" } },
  // {
  //   id: "d",
  //   type: "output",
  //   position: { x: 0, y: 200 },
  //   data: { label: "with React Flow" },
  // },
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
];

export const nodeTypes = {
  "position-logger": PositionLoggerNode,
  // canvas: CanvasNode,
  circle: CircleNode,
} satisfies NodeTypes;
