import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";

function evaluate(ctx: EvaluationContext) {
  const layer = ctx.getLayer("layer");
  // eslint-disable-next-line no-console
  console.debug(`[Dev:LogLayer] ${ctx.nodeId} size=`, {
    width: layer.width,
    height: layer.height,
  });
  return {};
}

nodeRegistry.register({
  type: "dev.log-layer",
  label: "Log Layer",
  category: "Dev",
  description: "Console.log layer info",
  inputs: [{ id: "layer", label: "Layer", type: "layer", required: false }],
  outputs: [],
  defaultParams: {},
  evaluate,
});
