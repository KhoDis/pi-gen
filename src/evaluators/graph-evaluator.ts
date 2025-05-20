import {
  AppNode,
  EvaluationContext,
  EvaluationResult,
  EvaluatorRegistry,
  HandleId,
  HandleType,
  NodeId,
  TypedValue,
} from "@/nodes/types.ts";
import { Edge } from "@xyflow/react";

class GraphEvaluator {
  nodes: AppNode[];
  edges: Edge[];
  registry: EvaluatorRegistry;
  cache: Map<NodeId, EvaluationResult> = new Map();

  constructor(nodes: AppNode[], edges: Edge[], registry: EvaluatorRegistry) {
    this.nodes = nodes;
    this.edges = edges;
    this.registry = registry;
  }

  evaluate(nodeId: NodeId): EvaluationResult {
    if (this.cache.has(nodeId)) return this.cache.get(nodeId)!;

    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) throw new Error("Missing node");

    if (!node.type) throw new Error(`No type for node ${nodeId}`);

    const evaluator = this.registry[node.type];
    if (!evaluator) throw new Error(`No evaluator for ${node.type}`);

    const ctx = this.createContextFor(nodeId);
    const result = evaluator(ctx, node);
    this.cache.set(nodeId, result);
    return result;
  }

  createContextFor(nodeId: NodeId): EvaluationContext {
    return {
      nodeId,
      getInputValue: <T extends HandleType>(
        handleId: HandleId,
      ): TypedValue<T> => {
        const incoming = this.edges.find(
          (e) => e.target === nodeId && e.targetHandle === handleId,
        );
        if (!incoming)
          throw new Error(`Missing input ${handleId} on ${nodeId}`);

        const result = this.evaluate(incoming.source);

        if (!incoming.sourceHandle)
          throw new Error(`No output from ${incoming.source}`);

        const val = result[incoming.sourceHandle];
        if (!val)
          throw new Error(
            `No output from ${incoming.source}.${incoming.sourceHandle}`,
          );
        return val as TypedValue<T>;
      },
    };
  }
}

export default GraphEvaluator;
