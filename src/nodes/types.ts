import { CircleNodeData } from "@/nodes/CircleNode.tsx";
import { type Node } from "@xyflow/react";
import { OutputNodeData } from "@/nodes/OutputNode.tsx";
import { Layer, RGBA } from "@/core/Layer.ts";

export type ConnectionType = "layer" | "color" | "number" | "option";

export type HandleType = "number" | "color" | "layer";

type HandleValueType<T extends HandleType> = T extends "number"
  ? number
  : T extends "color"
    ? RGBA
    : T extends "layer"
      ? Layer
      : never;

export type TypedValue<T extends HandleType = HandleType> = {
  type: T;
  value: HandleValueType<T>;
};

export type EvaluationContext = {
  nodeId: string;
  getInputValue<T extends HandleType>(inputHandleId: string): TypedValue<T>;
};

export type NodeId = string;
export type HandleId = string;

export type EvaluationResult = Record<HandleId, TypedValue>;

type NodeEvaluator = (
  ctx: EvaluationContext,
  node: AppNode,
) => EvaluationResult;

export type EvaluatorRegistry = Record<string, NodeEvaluator>;

export type CircleNode = Node<CircleNodeData, "circle">;
export type OutputNode = Node<OutputNodeData, "output">;
export type AppNode = CircleNode | OutputNode;
