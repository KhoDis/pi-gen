/**
 * Evaluation types for the Pi-Gen project
 *
 * Re-export types from the engine for convenience
 */

import type { Value } from "@/core/types/values";
import type { EvaluationContext } from "@/core/engine/GraphEngine";
export type { Value, EvaluationContext };

/**
 * Result of evaluating a node
 */
export type EvaluationResult = Record<string, Value>;

/**
 * Node evaluator function type
 */
export type NodeEvaluator = (ctx: EvaluationContext) => EvaluationResult;
