/**
 * Rectangle node evaluation and registration for the Pi-Gen project
 */
import { Layer } from "@/core/models";
import { createLayerValue } from "@/core/types/values";
import { nodeRegistry } from "@/core/registry/NodeRegistry";

import { EvaluationContext } from "@/core/types/evaluation";
/**
 * Rectangle node evaluator function
 */
function evaluateRectangleNode(ctx: EvaluationContext) {
  // Get values directly from context with type safety
  // These will throw appropriate errors if inputs are missing or of wrong type
  const width = ctx.getNumberInput("width");
  const height = ctx.getNumberInput("height");
  const color = ctx.getColorInput("color");

  // Create a layer with the rectangle
  const layer = new Layer(width, height);

  // Draw the rectangle (fill the entire layer)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      layer.setPixel(x, y, color);
    }
  }

  // Return the layer as output
  return {
    layer: createLayerValue(layer),
  };
}

// Register the rectangle node type
nodeRegistry.register({
  type: "rectangle",
  label: "Rectangle",
  category: "Shapes",
  description: "Generates a rectangle shape",
  inputs: [
    { id: "width", label: "Width", type: "number", required: false },
    { id: "height", label: "Height", type: "number", required: false },
    { id: "color", label: "Color", type: "color", required: false },
  ],
  outputs: [{ id: "layer", label: "Layer", type: "layer", required: true }],
  defaultParams: {
    width: 20,
    height: 10,
    color: { r: 0, g: 128, b: 255, a: 1 },
  },
  evaluate: evaluateRectangleNode,
});
// No custom React component needed; AutoNodeComponent will render UI
