/**
 * Core value types for the Pi-Gen project
 *
 * This file defines the type system for values that can be passed between nodes.
 * It uses a clean interface-based approach instead of complex conditional types.
 */

import { Layer } from "@/core/models";

/**
 * Base interface for all value types
 */
export interface Value {
  readonly type: string;
  readonly value: unknown;
}

/**
 * Number value
 */
export interface NumberValue extends Value {
  readonly type: "number";
  readonly value: number;
}

/**
 * Color value (RGBA)
 */
export interface ColorValue extends Value {
  readonly type: "color";
  readonly value: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

/**
 * Layer value
 */
export interface LayerValue extends Value {
  readonly type: "layer";
  readonly value: Layer;
}

/**
 * Boolean value
 */
export interface BooleanValue extends Value {
  readonly type: "boolean";
  readonly value: boolean;
}

/**
 * String value
 */
export interface StringValue extends Value {
  readonly type: "string";
  readonly value: string;
}

/**
 * Vector2 value
 */
export interface Vector2Value extends Value {
  readonly type: "vector2";
  readonly value: {
    x: number;
    y: number;
  };
}

/**
 * Union type of all possible values
 */
export type ValueType =
  | NumberValue
  | ColorValue
  | LayerValue
  | BooleanValue
  | StringValue
  | Vector2Value
  | OptionValue;

/**
 * Option value (enumerated string)
 */
export interface OptionValue extends Value {
  readonly type: "option";
  readonly value: string;
}

/**
 * Type guard for NumberValue
 */
export const isNumberValue = (value: Value): value is NumberValue =>
  value.type === "number";

/**
 * Type guard for ColorValue
 */
export const isColorValue = (value: Value): value is ColorValue =>
  value.type === "color";

/**
 * Type guard for LayerValue
 */
export const isLayerValue = (value: Value): value is LayerValue =>
  value.type === "layer";

/**
 * Type guard for BooleanValue
 */
export const isBooleanValue = (value: Value): value is BooleanValue =>
  value.type === "boolean";

/**
 * Type guard for StringValue
 */
export const isStringValue = (value: Value): value is StringValue =>
  value.type === "string";

/**
 * Type guard for Vector2Value
 */
export const isVector2Value = (value: Value): value is Vector2Value =>
  value.type === "vector2";

/**
 * Type guard for OptionValue
 */
export const isOptionValue = (value: Value): value is OptionValue =>
  value.type === "option";

/**
 * Create a number value
 */
export const createNumberValue = (value: number): NumberValue => ({
  type: "number",
  value,
});

/**
 * Create a color value
 */
export const createColorValue = (
  r: number,
  g: number,
  b: number,
  a: number,
): ColorValue => ({
  type: "color",
  value: { r, g, b, a },
});

/**
 * Create a layer value
 */
export const createLayerValue = (layer: Layer): LayerValue => ({
  type: "layer",
  value: layer,
});

/**
 * Create a boolean value
 */
export const createBooleanValue = (value: boolean): BooleanValue => ({
  type: "boolean",
  value,
});

/**
 * Create a string value
 */
export const createStringValue = (value: string): StringValue => ({
  type: "string",
  value,
});

/**
 * Create a vector2 value
 */
export const createVector2Value = (x: number, y: number): Vector2Value => ({
  type: "vector2",
  value: { x, y },
});

/**
 * Create an option value
 */
export const createOptionValue = (value: string): OptionValue => ({
  type: "option",
  value,
});
