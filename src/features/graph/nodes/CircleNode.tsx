/**
 * Circle node evaluation and registration for the Pi-Gen project
 */
import { Layer } from "@/core/models";
import { createLayerValue } from "@/core/types/values";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";

/**
 * Circle node evaluator function
 */
function evaluateCircleNode(ctx: EvaluationContext) {
  // Get values directly from context with type safety
  // These will throw appropriate errors if inputs are missing or of wrong type
  const radius = ctx.getNumberInput("radius");
  const color = ctx.getColorInput("color");

  // Create a layer with the circle
  const size = radius * 2;
  const layer = new Layer(size, size);
  const centerX = radius;
  const centerY = radius;

  // Draw the circle
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        layer.setPixel(x, y, color);
      }
    }
  }

  // Return the layer as output
  return {
    layer: createLayerValue(layer),
  };
}

// Register the circle node type
nodeRegistry.register({
  type: "circle",
  label: "Circle",
  category: "Shapes",
  description: "Generates a circle shape",
  inputs: [
    { id: "radius", label: "Radius", type: "number", required: false },
    { id: "color", label: "Color", type: "color", required: false },
  ],
  outputs: [{ id: "layer", label: "Layer", type: "layer", required: true }],
  defaultParams: {
    radius: 10,
    color: { r: 255, g: 0, b: 0, a: 1 },
  },
  evaluate: evaluateCircleNode,
});
