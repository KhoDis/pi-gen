/**
 * Blend node evaluation and registration for the Pi-Gen project
 */
import { Layer, RGBA } from "@/core/models";
import { createLayerValue } from "@/core/types/values";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";

type BlendMode = "normal" | "multiply" | "screen";

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function blendChannel(a: number, b: number, mode: BlendMode): number {
  if (mode === "multiply") return Math.floor((a * b) / 255);
  if (mode === "screen") return 255 - Math.floor(((255 - a) * (255 - b)) / 255);
  return b; // normal takes top channel before opacity lerp
}

function lerp(a: number, b: number, t: number): number {
  return Math.round(a * (1 - t) + b * t);
}

function getPixelOrTransparent(layer: Layer, x: number, y: number): RGBA {
  return layer.getPixel(x, y) ?? { r: 0, g: 0, b: 0, a: 0 };
}

/**
 * Blend two layers with an opacity and mode.
 * A = base/background, B = top/foreground.
 */
function evaluateBlendNode(ctx: EvaluationContext) {
  const base = ctx.getLayerInput("base");
  const top = ctx.getLayerInput("top");
  const opacity = clamp01(ctx.getNumberInput("opacity"));
  const modeRaw = ctx.getStringInput("mode");
  const mode: BlendMode = ((): BlendMode => {
    if (modeRaw === "multiply" || modeRaw === "screen") return modeRaw;
    return "normal";
  })();

  const width = Math.max(base.width, top.width);
  const height = Math.max(base.height, top.height);

  const out = new Layer(width, height);

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const A = getPixelOrTransparent(base, x, y);
      const B = getPixelOrTransparent(top, x, y);

      const modeR = blendChannel(A.r, B.r, mode);
      const modeG = blendChannel(A.g, B.g, mode);
      const modeB = blendChannel(A.b, B.b, mode);

      const r = lerp(A.r, modeR, opacity);
      const g = lerp(A.g, modeG, opacity);
      const b = lerp(A.b, modeB, opacity);
      const a = clamp01(A.a * (1 - opacity) + B.a * opacity);

      if (a > 0) out.setPixel(x, y, { r, g, b, a });
    }
  }

  return { layer: createLayerValue(out) };
}

// Register the blend node type
nodeRegistry.register({
  type: "blend",
  label: "Blend",
  category: "Compositing",
  description: "Blend two layers with modes and opacity",
  inputs: [
    { id: "base", label: "Base", type: "layer", required: true },
    { id: "top", label: "Top", type: "layer", required: true },
    { id: "opacity", label: "Opacity", type: "number", required: false },
    { id: "mode", label: "Mode", type: "string", required: false },
  ],
  outputs: [{ id: "layer", label: "Layer", type: "layer", required: true }],
  defaultParams: {
    opacity: 1,
    mode: "normal",
  },
  evaluate: evaluateBlendNode,
});
