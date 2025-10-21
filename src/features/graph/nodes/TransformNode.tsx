/**
 * Transform (translate) node evaluation and registration for the Pi-Gen project
 */
import { Layer } from "@/core/models";
import { createLayerValue } from "@/core/types/values";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";

function evaluateTransformNode(ctx: EvaluationContext) {
  const input = ctx.getLayer("layer");
  const dx = ctx.getNumber("dx");
  const dy = ctx.getNumber("dy");

  const out = new Layer(input.width, input.height);

  for (let x = 0; x < input.width; x++) {
    for (let y = 0; y < input.height; y++) {
      const pixel = input.getPixel(x, y);
      if (!pixel) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && nx < out.width && ny >= 0 && ny < out.height) {
        out.setPixel(nx, ny, pixel);
      }
    }
  }

  return { layer: createLayerValue(out) };
}

// Register the transform node type
nodeRegistry.register({
  type: "transform",
  label: "Transform",
  category: "Transforms",
  description: "Translate a layer",
  inputs: [
    { id: "layer", label: "Layer", type: "layer", required: true },
    { id: "dx", label: "DX", type: "number", required: false },
    { id: "dy", label: "DY", type: "number", required: false },
  ],
  outputs: [{ id: "layer", label: "Layer", type: "layer", required: true }],
  defaultParams: {
    dx: 0,
    dy: 0,
  },
  evaluate: evaluateTransformNode,
});
