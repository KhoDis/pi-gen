/**
 * Color node evaluation and registration for the Pi-Gen project
 */
import { createColorValue } from "@/core/types/values";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";

/**
 * Color node evaluator function
 */
function evaluateColorNode(ctx: EvaluationContext) {
  // Get the color parameter
  const color = ctx.getColorInput("color");

  // Return the color as output
  return {
    color: createColorValue(color.r, color.g, color.b, color.a),
  };
}

// Register the color node type
nodeRegistry.register({
  type: "color",
  label: "Color",
  category: "Values",
  description: "Provides a color value",
  inputs: [{ id: "color", label: "Color", type: "color", required: false }],
  outputs: [{ id: "color", label: "Color", type: "color", required: true }],
  defaultParams: {
    color: { r: 255, g: 0, b: 0, a: 1 },
  },
  evaluate: evaluateColorNode,
});
