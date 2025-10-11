/**
 * Graph Evaluator for the Pi-Gen project
 *
 * This file defines the graph evaluator that processes the node graph and computes results.
 */

import { Node, Edge, NodeId, NodeParams } from "@/core/types/nodes";
import { Value } from "@/core/types/values";
import { EvaluationContext } from "@/core/types/evaluation";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { RGBA, Layer } from "../models";

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
      throw new Error(
        `Required input ${id} not connected for node ${this.nodeId}`,
      );
    }

    if (input.type !== expectedType) {
      throw new Error(
        `Type mismatch for input ${id} on node ${this.nodeId}: ` +
          `expected ${expectedType}, got ${input.type}`,
      );
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

  getOptionInput(id: string): string {
    return this.getTypedInput<string>(id, "option");
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
  evaluateGraph(startNodeId: NodeId): Map<NodeId, Record<string, Value>> {
    this.clearCache();

    // Sort nodes in topological order
    const sortedNodes = this.sortNodesByDependency(startNodeId);

    // Evaluate each node in order
    for (const nodeId of sortedNodes) {
      this.evaluateNode(nodeId);
    }

    return this.cache;
  }

  /**
   * Evaluate a single node
   * @param nodeId ID of the node to evaluate
   * @returns Evaluation result for the node
   */
  evaluateNode(nodeId: NodeId): Record<string, Value> {
    // Return cached result if available
    if (this.cache.has(nodeId)) {
      return this.cache.get(nodeId)!;
    }

    try {
      // Find the node
      const node = this.nodes.find((n) => n.id === nodeId);
      if (!node) {
        throw new Error(`Node not found: ${nodeId}`);
      }

      // Get the node type
      const nodeType = nodeRegistry.get(node.type);
      if (!nodeType) {
        throw new Error(`Unknown node type: ${node.type}`);
      }

      // Collect input values
      const inputs: Record<string, Value> = {};

      // Find all edges targeting this node
      const incomingEdges = this.edges.filter((e) => e.target === nodeId);

      // Process each input port
      for (const edge of incomingEdges) {
        // Evaluate the source node
        const sourceOutputs = this.evaluateNode(edge.source);
        const outputValue = sourceOutputs[edge.sourceHandle];

        if (outputValue) {
          inputs[edge.targetHandle] = outputValue;
        } else {
          throw new Error(
            `Source node ${edge.source} does not provide output ${edge.sourceHandle}`,
          );
        }
      }

      // Create evaluation context
      const context = new EvaluationContextImpl(
        nodeId,
        inputs,
        node.data.params,
      );

      // Evaluate the node
      const outputs = nodeType.evaluate(context);

      // Cache the result
      this.cache.set(nodeId, outputs);

      return outputs;
    } catch (error) {
      // Enhance error with context
      const enhancedError = new Error(
        `Error evaluating node ${nodeId}: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (error instanceof Error && error.stack) {
        enhancedError.stack = error.stack;
      }
      throw enhancedError;
    }
  }

  /**
   * Sort nodes by dependency order with cycle detection
   * @param startNodeId ID of the node to start from
   * @returns Array of node IDs in dependency order
   * @throws Error if a cycle is detected in the graph
   */
  private sortNodesByDependency(startNodeId: NodeId): NodeId[] {
    const visited = new Set<NodeId>();
    const visiting = new Set<NodeId>(); // Track nodes currently being visited
    const sorted: NodeId[] = [];

    const visit = (nodeId: NodeId, path: NodeId[] = []) => {
      if (visited.has(nodeId)) return;

      // Cycle detection: if we encounter a node we're currently visiting, there's a cycle
      if (visiting.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        const cycle = [...path.slice(cycleStart), nodeId];
        throw new Error(
          `Cycle detected in node graph: ${cycle.join(" -> ")}\n` +
            `Please remove the circular dependency to continue.`,
        );
      }

      visiting.add(nodeId);
      const currentPath = [...path, nodeId];

      // Find all edges where this node is the target
      const incomingEdges = this.edges.filter((e) => e.target === nodeId);

      // Visit dependencies first
      for (const edge of incomingEdges) {
        visit(edge.source, currentPath);
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
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
