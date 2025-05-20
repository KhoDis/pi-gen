import {
  AppNode,
  EvaluationContext,
  EvaluationResult,
  EvaluatorRegistry,
} from "@/nodes/types.ts";
import type { Edge } from "@xyflow/react";
import GraphEvaluator from "@/evaluators/graph-evaluator.ts";
import { evaluateCircleNode } from "@/evaluators/circle.ts";

export * from "./circle";

export function evaluateOutputNode(ctx: EvaluationContext): EvaluationResult {
  const layer = ctx.getInputValue<"layer">("layer-input");
  return { "layer-input": layer }; // Just passes it through
}

export const evaluators: EvaluatorRegistry = {
  circle: evaluateCircleNode,
  output: evaluateOutputNode,
};

export function createGraphEvaluator(nodes: AppNode[], edges: Edge[]) {
  return new GraphEvaluator(nodes, edges, evaluators);
}
