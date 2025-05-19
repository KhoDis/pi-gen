import { CircleNodeData } from "@/nodes/CircleNode.tsx";
import { BuiltInNode, type Node } from "@xyflow/react";

export type ConnectionType = "layer" | "color" | "number" | "option";

export type OutputNodeParams = {
  width: number;
  height: number;
};

export type Connection = {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
};

export type CanvasNodeData = {
  width: number;
  height: number;
  // Optional initial draw function
  scale: number;
  onDraw?: (ctx: CanvasRenderingContext2D) => void;
};

export type PositionLoggerNode = Node<{ label: string }, "position-logger">;
export type CanvasNode = Node<CanvasNodeData, "canvas">;
export type CircleNode = Node<CircleNodeData, "circle">;
export type AppNode =
  | BuiltInNode
  | PositionLoggerNode
  | CanvasNode
  | CircleNode;
