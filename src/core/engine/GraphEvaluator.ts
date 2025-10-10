/**
 * Graph Evaluator for the Pi-Gen project
 *
 * This file defines the graph evaluator that processes the node graph and computes results.
 */

import { Node, Edge, NodeId, NodeParams } from "../types/nodes";
import { Value } from "../types/values";
import {
  EvaluationContext,
  EvaluationError,
  EvaluationResult,
} from "../types/evaluation";
import { nodeRegistry } from "../registry/NodeRegistry";
import { RGBA } from "../models/Layer";
import { Layer } from "../models/Layer";

/**
 * Result cache for node evaluation
 */
type EvaluationCache = Map<NodeId, Record<string, Value>>;

/**
 * Implementation of the EvaluationContext interface
 */
class EvaluationContextImpl implements EvaluationContext {
  private inputValues: Record<string, Value> = {};
  private params: NodeParams;

  constructor(
    public readonly nodeId: NodeId,
    inputs: Record<string, Value>,
    params: NodeParams,
  ) {
    this.inputValues = { ...inputs };
    this.params = params;
  }

  getInput(id: string): Value | undefined {
    return this.inputValues[id];
  }

  getTypedInput<T>(id: string, expectedType: string): T {
    const input = this.inputValues[id];

    if (!input) {
      // If input is not connected, use the default value from params
      if (id in this.params) {
        return this.params[id] as T;
      }

      // If no default value is available, throw an error
      const error: EvaluationError = {
        message: `Required input ${id} not connected`,
        nodeId: this.nodeId,
        inputId: id,
        code: "MISSING_INPUT",
      };
      throw error;
    }

    if (input.type !== expectedType) {
      const error: EvaluationError = {
        message: `Type mismatch for input ${id}: expected ${expectedType}, got ${input.type}`,
        nodeId: this.nodeId,
        inputId: id,
        code: "TYPE_MISMATCH",
      };
      throw error;
    }

    return input.value as T;
  }

  getNumberInput(id: string): number {
    return this.getTypedInput<number>(id, "number");
  }

  getColorInput(id: string): RGBA {
    return this.getTypedInput<RGBA>(id, "color");
  }

  getLayerInput(id: string): Layer {
    return this.getTypedInput<Layer>(id, "layer");
  }

  getBooleanInput(id: string): boolean {
    return this.getTypedInput<boolean>(id, "boolean");
  }

  getStringInput(id: string): string {
    return this.getTypedInput<string>(id, "string");
  }

  getVector2Input(id: string): { x: number; y: number } {
    return this.getTypedInput<{ x: number; y: number }>(id, "vector2");
  }

  hasInput(id: string): boolean {
    return id in this.inputValues;
  }

  getRawInput(id: string): Value | undefined {
    return this.inputValues[id];
  }

  getAllInputs(): Record<string, Value> {
    return { ...this.inputValues };
  }

  getParams(): NodeParams {
    return { ...this.params };
  }

  // Legacy method for backward compatibility
  getInputValue(id: string, type: string): unknown {
    return this.getTypedInput(id, type);
  }
}

/**
 * GraphEvaluator class for evaluating node graphs
 */
export class GraphEvaluator {
  private nodes: Node[];
  private edges: Edge[];
  private cache: EvaluationCache = new Map();

  /**
   * Create a new GraphEvaluator
   * @param nodes Array of nodes in the graph
   * @param edges Array of edges in the graph
   */
  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  /**
   * Evaluate the entire graph starting from the specified node
   * @param startNodeId ID of the node to start evaluation from
   * @returns Evaluation results for all nodes in the graph
   */
  evaluateGraph(startNodeId: NodeId): EvaluationResult {
    this.clearCache();

    try {
      // Sort nodes in topological order
      const sortedNodes = this.sortNodesByDependency(startNodeId);

      // Evaluate each node in order
      for (const nodeId of sortedNodes) {
        const result = this.evaluateNode(nodeId);

        // Stop evaluation if there's an error
        if (!result.success) {
          return result;
        }
      }

      // Return success if all nodes evaluated successfully
      return {
        success: true,
        outputs: this.cache.get(startNodeId) || {},
      };
    } catch (error) {
      // Handle unexpected errors
      return {
        success: false,
        error: {
          message: `Graph evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
          code: "GRAPH_EVALUATION_FAILED",
        },
      };
    }
  }

  /**
   * Evaluate a single node
   * @param nodeId ID of the node to evaluate
   * @returns Evaluation result for the node
   */
  evaluateNode(nodeId: NodeId): EvaluationResult {
    // Return cached result if available
    if (this.cache.has(nodeId)) {
      return { success: true, outputs: this.cache.get(nodeId)! };
    }

    try {
      // Find the node
      const node = this.nodes.find((n) => n.id === nodeId);
      if (!node) {
        return {
          success: false,
          error: {
            message: `Node not found: ${nodeId}`,
            nodeId,
            code: "NODE_NOT_FOUND",
          },
        };
      }

      // Get the node type
      const nodeType = nodeRegistry.get(node.type);
      if (!nodeType) {
        return {
          success: false,
          error: {
            message: `Unknown node type: ${node.type}`,
            nodeId,
            code: "UNKNOWN_NODE_TYPE",
          },
        };
      }

      // Collect input values
      const inputs: Record<string, Value> = {};

      // Find all edges targeting this node
      const incomingEdges = this.edges.filter((e) => e.target === nodeId);

      // Process each input port
      for (const edge of incomingEdges) {
        // Evaluate the source node
        const sourceResult = this.evaluateNode(edge.source);

        if (!sourceResult.success) {
          // Propagate error from source node
          return sourceResult;
        }

        const outputValue = sourceResult.outputs[edge.sourceHandle];

        if (outputValue) {
          inputs[edge.targetHandle] = outputValue;
        } else {
          return {
            success: false,
            error: {
              message: `Source node ${edge.source} does not provide output ${edge.sourceHandle}`,
              nodeId,
              code: "MISSING_OUTPUT",
              inputId: edge.targetHandle,
            },
          };
        }
      }

      // Create evaluation context
      const context = new EvaluationContextImpl(
        nodeId,
        inputs,
        node.data.params,
      );

      try {
        // Evaluate the node
        const result = nodeType.evaluate(context);

        // If successful, cache the outputs
        if (result.success) {
          this.cache.set(nodeId, result.outputs);
        }

        return result;
      } catch (error) {
        // Handle errors thrown during evaluation
        if (error && typeof error === "object" && "message" in error) {
          // It's already an EvaluationError
          return {
            success: false,
            error: {
              ...(error as EvaluationError),
              nodeId: nodeId, // Ensure nodeId is set
            },
          };
        } else {
          // Convert generic error to EvaluationError
          return {
            success: false,
            error: {
              message: String(error),
              nodeId,
              code: "EVALUATION_ERROR",
            },
          };
        }
      }
    } catch (error) {
      // Handle unexpected errors
      return {
        success: false,
        error: {
          message: `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
          nodeId,
          code: "UNEXPECTED_ERROR",
        },
      };
    }
  }

  /**
   * Sort nodes by dependency order
   * @param startNodeId ID of the node to start from
   * @returns Array of node IDs in dependency order
   */
  private sortNodesByDependency(startNodeId: NodeId): NodeId[] {
    const visited = new Set<NodeId>();
    const sorted: NodeId[] = [];

    const visit = (nodeId: NodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Find all edges where this node is the target
      const incomingEdges = this.edges.filter((e) => e.target === nodeId);

      // Visit dependencies first
      for (const edge of incomingEdges) {
        visit(edge.source);
      }

      sorted.push(nodeId);
    };

    // Start with the specified node
    visit(startNodeId);

    return sorted;
  }

  /**
   * Clear the evaluation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Mark a node as dirty (needs re-evaluation)
   * @param nodeId ID of the node to mark as dirty
   */
  markNodeDirty(nodeId: NodeId): void {
    // Remove the node from the cache
    this.cache.delete(nodeId);

    // Find all edges where this node is the source
    const outgoingEdges = this.edges.filter((e) => e.source === nodeId);

    // Mark dependent nodes as dirty
    for (const edge of outgoingEdges) {
      this.markNodeDirty(edge.target);
    }
  }
}

/**
 * Create a new GraphEvaluator
 * @param nodes Array of nodes in the graph
 * @param edges Array of edges in the graph
 * @returns A new GraphEvaluator instance
 */
export function createGraphEvaluator(
  nodes: Node[],
  edges: Edge[],
): GraphEvaluator {
  return new GraphEvaluator(nodes, edges);
}
