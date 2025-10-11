/**
 * Gradient (linear) node evaluation and registration for the Pi-Gen project
 */
import { Layer, RGBA } from "@/core/models";
import { createLayerValue } from "@/core/types/values";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";

function lerp(a: number, b: number, t: number): number {
  return Math.round(a * (1 - t) + b * t);
}

function mixColor(a: RGBA, b: RGBA, t: number): RGBA {
  return {
    r: lerp(a.r, b.r, t),
    g: lerp(a.g, b.g, t),
    b: lerp(a.b, b.b, t),
    a: a.a * (1 - t) + b.a * t,
  };
}

function evaluateGradientNode(ctx: EvaluationContext) {
  const width = Math.max(1, ctx.getNumberInput("width"));
  const height = Math.max(1, ctx.getNumberInput("height"));
  const colorA = ctx.getColorInput("colorA");
  const colorB = ctx.getColorInput("colorB");
  const axis = ctx.getStringInput("axis"); // "x" or "y"

  const out = new Layer(width, height);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const t =
        axis === "y" ? y / Math.max(1, height - 1) : x / Math.max(1, width - 1);
      out.setPixel(x, y, mixColor(colorA, colorB, t));
    }
  }

  return { layer: createLayerValue(out) };
}

// Register the gradient node type
nodeRegistry.register({
  type: "gradient",
  label: "Gradient",
  category: "Generators",
  description: "Generate a linear gradient layer",
  inputs: [
    { id: "width", label: "Width", type: "number", required: false },
    { id: "height", label: "Height", type: "number", required: false },
    { id: "colorA", label: "Color A", type: "color", required: false },
    { id: "colorB", label: "Color B", type: "color", required: false },
    { id: "axis", label: "Axis", type: "string", required: false },
  ],
  outputs: [{ id: "layer", label: "Layer", type: "layer", required: true }],
  defaultParams: {
    width: 64,
    height: 64,
    colorA: { r: 0, g: 0, b: 0, a: 1 },
    colorB: { r: 255, g: 255, b: 255, a: 1 },
    axis: "x",
  },
  evaluate: evaluateGradientNode,
});
