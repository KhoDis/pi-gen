/**
 * Evaluation types for the Pi-Gen project
 *
 * This file defines types related to the evaluation of nodes in the graph.
 */

import { NodeId, NodeParams } from "@/core/types/nodes";
import { Value } from "@/core/types/values";
import { RGBA, Layer } from "@/core/models";

/**
 * Evaluation context provided to node evaluators
 */
export interface EvaluationContext {
  /**
   * ID of the node being evaluated
   */
  nodeId: NodeId;

  /**
   * Get raw input value with runtime type information
   * @param id Input handle ID
   * @returns The input value or undefined if not connected
   */
  getInput(id: string): Value | undefined;

  /**
   * Get the value of an input with type checking
   * If the input is not connected, it will use the default value from the node's parameters
   * @param id Input handle ID
   * @param expectedType Expected type of the input
   * @returns The input value with the correct type
   * @throws Error if input type doesn't match expected type or if input is not available
   */
  getTypedInput<T>(id: string, expectedType: string): T;

  /**
   * Get a number input value
   * @param id Input handle ID
   * @returns The number value
   * @throws Error if input is not a number or not available
   */
  getNumberInput(id: string): number;

  /**
   * Get a color input value
   * @param id Input handle ID
   * @returns The color value
   * @throws Error if input is not a color or not available
   */
  getColorInput(id: string): RGBA;

  /**
   * Get a layer input value
   * @param id Input handle ID
   * @returns The layer value
   * @throws Error if input is not a layer or not available
   */
  getLayerInput(id: string): Layer;

  /**
   * Get a boolean input value
   * @param id Input handle ID
   * @returns The boolean value
   * @throws Error if input is not a boolean or not available
   */
  getBooleanInput(id: string): boolean;

  /**
   * Get a string input value
   * @param id Input handle ID
   * @returns The string value
   * @throws Error if input is not a string or not available
   */
  getStringInput(id: string): string;

  /**
   * Get a vector2 input value
   * @param id Input handle ID
   * @returns The vector2 value
   * @throws Error if input is not a vector2 or not available
   */
  getVector2Input(id: string): { x: number; y: number };

  /**
   * Check if an input is connected
   * @param id Input handle ID
   * @returns True if the input is connected
   */
  hasInput(id: string): boolean;

  /**
   * Get all input values
   * @returns Record of all input values
   */
  getAllInputs(): Record<string, Value>;

  /**
   * Get the node's parameters
   * @returns The node's parameters
   */
  getParams(): NodeParams;
}

/**
 * Result of evaluating a node
 */
export type EvaluationResult = Record<string, Value>;

/**
 * Node evaluator function type
 */
export type NodeEvaluator = (ctx: EvaluationContext) => EvaluationResult;
