/**
 * Node types for the Pi-Gen project
 *
 * This file defines the type system for nodes, handles, and connections.
 * It uses generic type parameters for type safety.
 */

import React from "react";
import { ValueTypeMap, ExtractValueType } from "./values.new";
import { NodeEvaluator } from "./evaluation.new";

/**
 * Unique identifier for nodes
 */
export type NodeId = string;

/**
 * Unique identifier for handles
 */
export type HandleId = string;

/**
 * Handle type (source or target)
 */
export type HandleType = "source" | "target";

/**
 * Position in 2D space
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Port definition with generic type parameter
 */
export interface Port<T extends keyof ValueTypeMap = keyof ValueTypeMap> {
  id: string;
  label: string;
  type: T;
  required: boolean;
}

/**
 * Node data with generic type parameter
 */
export interface NodeData<
  P extends Record<string, keyof ValueTypeMap> = Record<string, never>,
> {
  params: {
    [K in keyof P]: ExtractValueType<P[K]>;
  };
}

/**
 * Node component props with generic type parameter
 */
export interface NodeComponentProps<
  P extends Record<string, keyof ValueTypeMap> = Record<string, never>,
> {
  id: NodeId;
  data: NodeData<P>;
  selected: boolean;
}

/**
 * Node interface with generic type parameter
 */
export interface Node<
  P extends Record<string, keyof ValueTypeMap> = Record<string, never>,
> {
  id: NodeId;
  type: string;
  position: Position;
  data: NodeData<P>;
}

/**
 * Edge interface representing a connection between nodes
 */
export interface Edge {
  id: string;
  source: NodeId;
  sourceHandle: HandleId;
  target: NodeId;
  targetHandle: HandleId;
  type?: string;
}

/**
 * Node type definition with generic type parameters
 */
export interface NodeType<
  I extends Record<string, keyof ValueTypeMap> = Record<string, never>,
  O extends Record<string, keyof ValueTypeMap> = Record<string, never>,
  P extends Record<string, keyof ValueTypeMap> = Record<string, never>,
> {
  /**
   * Unique identifier for the node type
   */
  type: string;

  /**
   * Display name for the node type
   */
  label: string;

  /**
   * Category for grouping node types
   */
  category: string;

  /**
   * Description of the node type
   */
  description: string;

  /**
   * Input port definitions
   */
  inputs: {
    [K in keyof I]: Port<I[K]>;
  };

  /**
   * Output port definitions
   */
  outputs: {
    [K in keyof O]: Port<O[K]>;
  };

  /**
   * Default parameter values
   */
  defaultParams: {
    [K in keyof P]: ExtractValueType<P[K]>;
  };

  /**
   * Component renderer function
   */
  component: React.ComponentType<NodeComponentProps<P>>;

  /**
   * Evaluation function
   */
  evaluate: NodeEvaluator<I, O, P>;
}

/**
 * Base interface for node registry entries
 */
export interface NodeTypeEntry {
  type: string;
  label: string;
  category: string;
  description: string;
}

/**
 * Graph interface representing a collection of nodes and edges
 */
export interface Graph {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Validate if a connection between two ports is valid
 */
export function validateConnection(
  sourceType: keyof ValueTypeMap,
  targetType: keyof ValueTypeMap,
): boolean {
  return sourceType === targetType;
}
