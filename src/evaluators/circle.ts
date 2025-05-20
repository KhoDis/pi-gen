import { Layer } from "@/core/Layer.ts";
import { EvaluationContext, EvaluationResult } from "@/nodes/types.ts";

export function evaluateCircleNode(ctx: EvaluationContext): EvaluationResult {
  const radius = ctx.getInputValue<"number">("radius").value;
  const color = ctx.getInputValue<"color">("color").value;

  const layer = new Layer(radius * 2, radius * 2);
  const cx = radius;
  const cy = radius;

  for (let x = 0; x < radius * 2; x++) {
    for (let y = 0; y < radius * 2; y++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= radius * radius) {
        layer.setPixel(x, y, color);
      }
    }
  }

  return {
    output: {
      type: "layer",
      value: layer,
    },
  };
}
