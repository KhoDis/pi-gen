/**
 * Number node evaluation and registration for the Pi-Gen project
 */
import { createNumberValue } from "@/core/types/values";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";

/**
 * Number node evaluator function
 */
function evaluateNumberNode(ctx: EvaluationContext) {
  // Get the number parameter
  const value = ctx.getNumber("value");

  // Return the number as output
  return {
    number: createNumberValue(value),
  };
}

// Register the number node type
nodeRegistry.register({
  type: "number",
  label: "Number",
  category: "Values",
  description: "Provides a numeric value",
  inputs: [{ id: "value", label: "Value", type: "number", required: false }],
  outputs: [{ id: "number", label: "Number", type: "number", required: true }],
  defaultParams: {
    value: 10,
  },
  evaluate: evaluateNumberNode,
});
