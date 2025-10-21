/**
 * Grid (checkerboard) node evaluation and registration for the Pi-Gen project
 */
import { Layer } from "@/core/models";
import { createLayerValue } from "@/core/types/values";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";

function evaluateGridNode(ctx: EvaluationContext) {
  const width = Math.max(1, ctx.getNumber("width"));
  const height = Math.max(1, ctx.getNumber("height"));
  const cell = Math.max(1, ctx.getNumber("cell"));
  const colorA = ctx.getColor("colorA");
  const colorB = ctx.getColor("colorB");

  const out = new Layer(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cx = Math.floor(x / cell);
      const cy = Math.floor(y / cell);
      const useA = (cx + cy) % 2 === 0;
      out.setPixel(x, y, useA ? colorA : colorB);
    }
  }

  return { layer: createLayerValue(out) };
}

// Register the grid node type
nodeRegistry.register({
  type: "grid",
  label: "Grid",
  category: "Generators",
  description: "Generate a checkerboard grid",
  inputs: [
    { id: "width", label: "Width", type: "number", required: false },
    { id: "height", label: "Height", type: "number", required: false },
    { id: "cell", label: "Cell Size", type: "number", required: false },
    { id: "colorA", label: "Color A", type: "color", required: false },
    { id: "colorB", label: "Color B", type: "color", required: false },
  ],
  outputs: [{ id: "layer", label: "Layer", type: "layer", required: true }],
  defaultParams: {
    width: 64,
    height: 64,
    cell: 8,
    colorA: { r: 0, g: 0, b: 0, a: 1 },
    colorB: { r: 255, g: 255, b: 255, a: 1 },
  },
  evaluate: evaluateGridNode,
});
