/**
 * Graph Engine - All-in-one solution for evaluating node graphs
 *
 * This is a clean, unified engine that handles all graph evaluation logic.
 * Everything you need to understand is in this single file.
 */

import { Node, Edge, NodeId } from "@/core/types/nodes";
import { Value } from "@/core/types/values";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { useDebugStore } from "@/core/store/debugStore";
import { RGBA, Layer } from "@/core/models";

/**
 * Evaluation context - provides inputs and parameters to node evaluators
 */
export class EvaluationContext {
  constructor(
    public readonly nodeId: NodeId,
    private inputs: Record<string, Value>,
    private params: Record<string, any>,
  ) {}

  // Get input with type checking and fallback to params
  getInput<T>(id: string, type: string): T {
    const input = this.inputs[id];

    if (!input) {
      // Fallback to parameter if not connected
      if (id in this.params) {
        return this.params[id] as T;
      }
      throw new Error(
        `Required input ${id} not connected for node ${this.nodeId}`,
      );
    }

    if (input.type !== type) {
      throw new Error(
        `Type mismatch for input ${id}: expected ${type}, got ${input.type}`,
      );
    }

    return input.value as T;
  }

  // Convenience methods for common types
  getNumber(id: string): number {
    return this.getInput<number>(id, "number");
  }
  getColor(id: string): RGBA {
    return this.getInput<RGBA>(id, "color");
  }
  getLayer(id: string): Layer {
    return this.getInput<Layer>(id, "layer");
  }
  getBoolean(id: string): boolean {
    return this.getInput<boolean>(id, "boolean");
  }
  getString(id: string): string {
    return this.getInput<string>(id, "string");
  }
  getOption(id: string): string {
    return this.getInput<string>(id, "option");
  }
  getVector2(id: string): { x: number; y: number } {
    return this.getInput<{ x: number; y: number }>(id, "vector2");
  }

  hasInput(id: string): boolean {
    return id in this.inputs;
  }
  getParams(): Record<string, any> {
    return { ...this.params };
  }

}

/**
 * Graph Engine - Everything in one place, easy to understand
 */
export class GraphEngine {
  private cache = new Map<NodeId, Record<string, Value>>();
  private nodesById = new Map<NodeId, Node>();
  private incomingEdges = new Map<NodeId, Edge[]>();
  private outgoingEdges = new Map<NodeId, Edge[]>();

  // Debug tracking (only in development)
  private debugItems: Array<{
    nodeId: NodeId;
    ms: number;
    fromCache: boolean;
    error?: string;
  }> = [];
  private cacheHits = 0;
  private startTime = 0;

  constructor(nodes: Node[], edges: Edge[]) {
    // Build lookup maps
    this.nodesById = new Map(nodes.map((n) => [n.id, n]));

    for (const edge of edges) {
      // Incoming edges
      if (!this.incomingEdges.has(edge.target)) {
        this.incomingEdges.set(edge.target, []);
      }
      this.incomingEdges.get(edge.target)!.push(edge);

      // Outgoing edges
      if (!this.outgoingEdges.has(edge.source)) {
        this.outgoingEdges.set(edge.source, []);
      }
      this.outgoingEdges.get(edge.source)!.push(edge);
    }
  }

  /**
   * Evaluate the entire graph starting from a node
   */
  evaluateGraph(startNodeId: NodeId): Map<NodeId, Record<string, Value>> {
    this.clearCache();
    this.resetDebug();

    const sortedNodes = this.sortNodesByDependency(startNodeId);

    for (const nodeId of sortedNodes) {
      this.evaluateNode(nodeId);
    }

    this.publishDebugSummary();
    return this.cache as any; // Type compatibility
  }

  /**
   * Evaluate a single node
   */
  evaluateNode(nodeId: NodeId): Record<string, Value> {
    this.startDebug();

    // Return cached result if available
    if (this.cache.has(nodeId)) {
      this.cacheHits++;
      this.debugItems.push({ nodeId, ms: 0, fromCache: true });
      this.endDebug();
      return this.cache.get(nodeId)!;
    }

    try {
      const startMs = import.meta.env.DEV ? performance.now() : 0;

      const node = this.getNode(nodeId);
      const nodeType = nodeRegistry.get(node.type);
      if (!nodeType) {
        throw new Error(`Unknown node type: ${node.type}`);
      }

      const inputs = this.collectInputs(nodeId);
        const context = new EvaluationContext(nodeId, inputs, node.data.params);

      const outputs = nodeType.evaluate(context);
      this.cache.set(nodeId, outputs);

      this.recordDebug(nodeId, startMs);
      return outputs;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const enhancedError = new Error(
        `Error evaluating node ${nodeId}: ${message}`,
      );
      this.recordDebug(nodeId, 0, enhancedError.message);
      throw enhancedError;
    } finally {
      this.endDebug();
    }
  }

  /**
   * Clear the evaluation cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Mark a node as dirty (needs re-evaluation)
   */
  markNodeDirty(nodeId: NodeId): void {
    this.cache.delete(nodeId);

    // Recursively mark dependent nodes as dirty
    const outgoingEdges = this.outgoingEdges.get(nodeId) || [];
    for (const edge of outgoingEdges) {
      this.markNodeDirty(edge.target);
    }
  }

  // Private helper methods - all the logic in one place

  private getNode(nodeId: NodeId): Node {
    const node = this.nodesById.get(nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }
    return node;
  }

  private collectInputs(nodeId: NodeId): Record<string, Value> {
    const inputs: Record<string, Value> = {};
    const incomingEdges = this.incomingEdges.get(nodeId) || [];

    for (const edge of incomingEdges) {
      const sourceOutputs = this.evaluateNode(edge.source);
      const outputValue = sourceOutputs[edge.sourceHandle];

      if (outputValue !== undefined) {
        inputs[edge.targetHandle] = outputValue;
      } else {
        throw new Error(
          `Source node ${edge.source} does not provide output ${edge.sourceHandle}`,
        );
      }
    }

    return inputs;
  }

  private sortNodesByDependency(startNodeId: NodeId): NodeId[] {
    const visited = new Set<NodeId>();
    const visiting = new Set<NodeId>();
    const sorted: NodeId[] = [];

    const visit = (nodeId: NodeId, path: NodeId[] = []) => {
      if (visited.has(nodeId)) return;

      // Cycle detection
      if (visiting.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        const cycle = [...path.slice(cycleStart), nodeId];
        throw new Error(`Cycle detected: ${cycle.join(" -> ")}`);
      }

      visiting.add(nodeId);
      const currentPath = [...path, nodeId];

      // Visit dependencies first
      const incomingEdges = this.incomingEdges.get(nodeId) || [];
      for (const edge of incomingEdges) {
        visit(edge.source, currentPath);
      }

      visiting.delete(nodeId);
      visited.add(nodeId);
      sorted.push(nodeId);
    };

    visit(startNodeId);
    return sorted;
  }

  // Debug methods - only run in development
  private resetDebug(): void {
    if (!import.meta.env.DEV) return;
    this.startTime = performance.now();
    this.debugItems = [];
    this.cacheHits = 0;
  }

  private startDebug(): void {
    if (!import.meta.env.DEV) return;
  }

  private endDebug(): void {
    if (!import.meta.env.DEV) return;
  }

  private recordDebug(nodeId: NodeId, startMs: number, error?: string): void {
    if (!import.meta.env.DEV) return;

    const ms = performance.now() - startMs;
    this.debugItems.push({ nodeId, ms, fromCache: false, error });
  }

  private publishDebugSummary(): void {
    if (!import.meta.env.DEV) return;

    const totalMs = performance.now() - this.startTime;
    useDebugStore.getState().setSummary({
      totalMs,
      nodesEvaluated: this.debugItems.filter((i) => !i.fromCache && !i.error)
        .length,
      cacheHits: this.cacheHits,
      items: this.debugItems.slice(),
      timestamp: Date.now(),
    });
  }
}

/**
 * Create a new GraphEngine
 */
export function createGraphEngine(
  nodes: Node[],
  edges: Edge[],
): GraphEngine {
  return new GraphEngine(nodes, edges);
}
