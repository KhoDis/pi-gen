import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";

function evaluate(ctx: EvaluationContext) {
  const condition = ctx.getBooleanInput("condition");
  const message = ctx.getStringInput("message");
  if (!condition) {
    throw new Error(message || "Assertion failed");
  }
  return {};
}

nodeRegistry.register({
  type: "dev.assert",
  label: "Assert",
  category: "Dev",
  description: "Throw error if condition is false",
  inputs: [
    { id: "condition", label: "Condition", type: "boolean", required: false },
    { id: "message", label: "Message", type: "string", required: false },
  ],
  outputs: [],
  defaultParams: { condition: true, message: "Assertion failed" },
  evaluate,
});
