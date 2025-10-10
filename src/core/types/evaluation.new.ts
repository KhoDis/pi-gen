/**
 * Evaluation types for the Pi-Gen project
 *
 * This file defines types related to node evaluation and execution.
 */

import { NodeId } from "./nodes.new";
import { Value, ValueTypeMap, ExtractValueType } from "./values.new";

/**
 * Standardized error structure for evaluation
 */
export interface EvaluationError {
  message: string;
  code?: string;
  nodeId?: NodeId;
  inputId?: string;
}

/**
 * Evaluation result that can be either successful or an error
 */
export interface EvaluationResult<
  O extends Record<string, Value> = Record<string, Value>,
> {
  success: boolean;
  outputs?: O;
  error?: EvaluationError;
}

/**
 * Evaluation context interface with generic type parameters
 */
export interface EvaluationContext<
  I extends Record<string, keyof ValueTypeMap> = Record<string, never>,
  P extends Record<string, keyof ValueTypeMap> = Record<string, never>,
> {
  /**
   * ID of the node being evaluated
   */
  nodeId: NodeId;

  /**
   * Get input value with type checking
   */
  getInput<K extends keyof I>(id: K): ExtractValueType<I[K]>;

  /**
   * Get parameter value
   */
  getParam<K extends keyof P>(id: K): ExtractValueType<P[K]>;

  /**
   * Check if an input is connected
   */
  hasInput(id: keyof I): boolean;

  /**
   * Get all parameters
   */
  getParams(): {
    [K in keyof P]: ExtractValueType<P[K]>;
  };
}

/**
 * Node evaluator function type with generic type parameters
 */
export type NodeEvaluator<
  I extends Record<string, keyof ValueTypeMap> = Record<string, never>,
  O extends Record<string, keyof ValueTypeMap> = Record<string, never>,
  P extends Record<string, keyof ValueTypeMap> = Record<string, never>,
> = (ctx: EvaluationContext<I, P>) => EvaluationResult<{
  [K in keyof O]: Value & { type: O[K] };
}>;
