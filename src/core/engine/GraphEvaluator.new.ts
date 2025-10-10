/**
 * Graph Evaluator for the Pi-Gen project
 *
 * This file implements the graph evaluation engine using the new type system.
 */

import { NodeId, Node, Edge } from "../types/nodes.new";
import { Value, ValueTypeMap, ExtractValueType } from "../types/values.new";
import {
  EvaluationContext,
  EvaluationResult,
  NodeEvaluator,
} from "../types/evaluation.new";
import { nodeRegistry } from "../registry/NodeRegistry.new";

/**
 * Implementation of the EvaluationContext interface
 */
class EvaluationContextImpl<
  I extends Record<string, keyof ValueTypeMap>,
  P extends Record<string, keyof ValueTypeMap>,
> implements EvaluationContext<I, P>
{
  private inputValues: Record<string, Value> = {};
  private params: Record<string, unknown>;

  constructor(
    public readonly nodeId: NodeId,
    inputs: Record<string, Value>,
    params: Record<string, unknown>,
  ) {
    this.inputValues = { ...inputs };
    this.params = params;
  }

  getInput<K extends keyof I>(id: K): ExtractValueType<I[K]> {
    const input = this.inputValues[id as string];
    if (!input) {
      throw {
        message: `Input ${String(id)} not connected`,
        nodeId: this.nodeId,
        inputId: id as string,
        code: "MISSING_INPUT",
      };
    }
    return input.value as ExtractValueType<I[K]>;
  }

  getParam<K extends keyof P>(id: K): ExtractValueType<P[K]> {
    return this.params[id as string] as ExtractValueType<P[K]>;
  }

  hasInput(id: keyof I): boolean {
    return id in this.inputValues;
  }

  getParams(): {
    [K in keyof P]: ExtractValueType<P[K]>;
  } {
    return this.params as {
      [K in keyof P]: ExtractValueType<P[K]>;
    };
  }
}

/**
 * GraphEvaluator class for evaluating node graphs
 */
export class GraphEvaluator {
  constructor(
    private nodes: Node[],
    private edges: Edge[],
  ) {}

  /**
   * Evaluate the graph starting from the specified node
   */
  evaluateGraph(): EvaluationResult {
    try {
      // Implementation of graph evaluation
      // Would include topological sorting and node evaluation
      return { success: true, outputs: {} };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : String(error),
          code: "GRAPH_EVALUATION_ERROR",
        },
      };
    }
  }
}

/**
 * Create a new GraphEvaluator instance
 */
export function createGraphEvaluator(
  nodes: Node[],
  edges: Edge[],
): GraphEvaluator {
  return new GraphEvaluator(nodes, edges);
}
