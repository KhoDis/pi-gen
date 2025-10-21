import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";

function evaluate(ctx: EvaluationContext) {
  const value = ctx.getNumber("value");
  // eslint-disable-next-line no-console
  console.debug(`[Dev:LogNumber] ${ctx.nodeId} value=`, value);
  return {};
}

nodeRegistry.register({
  type: "dev.log-number",
  label: "Log Number",
  category: "Dev",
  description: "Console.log a number input",
  inputs: [{ id: "value", label: "Value", type: "number", required: false }],
  outputs: [],
  defaultParams: { value: 0 },
  evaluate,
});
