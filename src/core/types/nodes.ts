/**
 * Node types for the Pi-Gen project
 *
 * This file defines the type system for nodes, handles, and connections.
 */

import {
  EvaluationContext,
  EvaluationResult,
  NodeEvaluator,
} from "./evaluation";

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
 * Base interface for all node parameters
 */
export interface NodeParams {
  [key: string]: unknown;
}

/**
 * Node data with typed parameters
 */
export interface NodeData<P extends NodeParams = NodeParams> {
  params: P;
}

/**
 * Node interface with typed parameters
 */
export interface Node<P extends NodeParams = NodeParams> {
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
 * Port definition for node inputs and outputs
 */
export interface Port {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

/**
 * Node type definition with proper generics
 */
export interface NodeType<P extends NodeParams = NodeParams> {
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
  inputs: Port[];

  /**
   * Output port definitions
   */
  outputs: Port[];

  /**
   * Default parameter values
   */
  defaultParams: P;

  /**
   * Component renderer function
   */
  component: React.ComponentType<{
    id: NodeId;
    data: NodeData<P>;
    selected: boolean;
  }>;

  /**
   * Evaluation function
   */
  /**
   * Evaluation function
   */
  evaluate: NodeEvaluator;
}

/**
 * Graph interface representing a collection of nodes and edges
 */
export interface Graph {
  nodes: Node[];
  edges: Edge[];
}
