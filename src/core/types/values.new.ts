/**
 * Core value types for the Pi-Gen project
 *
 * This file defines the type system for values that can be passed between nodes.
 * It uses a discriminated union approach with generic type parameters for type safety.
 */

import { Layer } from "../models/Layer";
import { RGBA } from "../models/Layer";

/**
 * Base value interface with generic type parameters
 */
export interface BaseValue<T extends string, V> {
  readonly type: T;
  readonly value: V;
}

/**
 * Number value
 */
export type NumberValue = BaseValue<"number", number>;

/**
 * String value
 */
export type StringValue = BaseValue<"string", string>;

/**
 * Boolean value
 */
export type BooleanValue = BaseValue<"boolean", boolean>;

/**
 * Color value (RGBA)
 */
export type ColorValue = BaseValue<"color", RGBA>;

/**
 * Layer value
 */
export type LayerValue = BaseValue<"layer", Layer>;

/**
 * Vector2 value
 */
export type Vector2Value = BaseValue<"vector2", { x: number; y: number }>;

/**
 * Union type of all possible values
 */
export type Value =
  | NumberValue
  | StringValue
  | BooleanValue
  | ColorValue
  | LayerValue
  | Vector2Value;

/**
 * Type guard for NumberValue
 */
export const isNumberValue = (value: Value): value is NumberValue =>
  value.type === "number";

/**
 * Type guard for StringValue
 */
export const isStringValue = (value: Value): value is StringValue =>
  value.type === "string";

/**
 * Type guard for BooleanValue
 */
export const isBooleanValue = (value: Value): value is BooleanValue =>
  value.type === "boolean";

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
 * Type guard for Vector2Value
 */
export const isVector2Value = (value: Value): value is Vector2Value =>
  value.type === "vector2";

/**
 * Create a number value
 */
export const createNumberValue = (value: number): NumberValue => ({
  type: "number",
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
 * Create a boolean value
 */
export const createBooleanValue = (value: boolean): BooleanValue => ({
  type: "boolean",
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
 * Create a vector2 value
 */
export const createVector2Value = (x: number, y: number): Vector2Value => ({
  type: "vector2",
  value: { x, y },
});

/**
 * Type mapping for generic contexts
 */
export type ValueTypeMap = {
  number: number;
  string: string;
  boolean: boolean;
  color: RGBA;
  layer: Layer;
  vector2: { x: number; y: number };
};

/**
 * Helper type to extract the actual value type from a value type string
 */
export type ExtractValueType<T extends keyof ValueTypeMap> = ValueTypeMap[T];

/**
 * Helper type to create a value object from a type string
 */
export type CreateValue<T extends keyof ValueTypeMap> = T extends "number"
  ? NumberValue
  : T extends "string"
    ? StringValue
    : T extends "boolean"
      ? BooleanValue
      : T extends "color"
        ? ColorValue
        : T extends "layer"
          ? LayerValue
          : T extends "vector2"
            ? Vector2Value
            : never;

/**
 * Factory function to create a value of the specified type
 */
export function createValue<T extends keyof ValueTypeMap>(
  type: T,
  value: ValueTypeMap[T],
): CreateValue<T> {
  switch (type) {
    case "number":
      return createNumberValue(value as number) as CreateValue<T>;
    case "string":
      return createStringValue(value as string) as CreateValue<T>;
    case "boolean":
      return createBooleanValue(value as boolean) as CreateValue<T>;
    case "color": {
      const color = value as RGBA;
      return createColorValue(
        color.r,
        color.g,
        color.b,
        color.a,
      ) as CreateValue<T>;
    }
    case "layer":
      return createLayerValue(value as Layer) as CreateValue<T>;
    case "vector2": {
      const vec = value as { x: number; y: number };
      return createVector2Value(vec.x, vec.y) as CreateValue<T>;
    }
    default:
      throw new Error(`Unsupported value type: ${type}`);
  }
}
