import { type Node } from "@xyflow/react";
import { RGBA } from "../core/models/Layer";
import { NodeData, NodeParams } from "../core/types/nodes";

// Circle node parameters
export interface CircleNodeParams extends NodeParams {
  radius: number;
  color: RGBA;
}

// Output node parameters
export interface OutputNodeParams extends NodeParams {
  width: number;
  height: number;
  scale: number;
}

// Node data types
export interface CircleNodeData extends NodeData {
  params: CircleNodeParams;
}

export interface OutputNodeData extends NodeData {
  params: OutputNodeParams;
}

// Node types
export type CircleNode = Node<CircleNodeData, "circle">;
export type OutputNode = Node<OutputNodeData, "output">;
export type AppNode = CircleNode | OutputNode;
