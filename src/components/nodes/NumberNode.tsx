/**
 * Number Node Component for the Pi-Gen project
 *
 * This component implements a node that provides a numeric value.
 */

import React, { useCallback } from "react";
import { NodeComponentProps } from "../../core/registry/NodeRegistry";
import { useGraphStore } from "../../core/store/graphStore";
import { createNumberValue } from "../../core/types/values";
import { nodeRegistry } from "../../core/registry/NodeRegistry";
import { EvaluationContext } from "../../core/types/evaluation";
import { NodeParams } from "../../core/types/nodes";
import { useNodeParams } from "../../core/hooks/useNodeParams";

// Import specialized parameter components
import { ProviderNumberParameter } from "../ui/provider-number-parameter";
import { NodeOutput } from "../ui/node-output";

// Import React Flow UI components
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
  BaseNodeFooter,
} from "../base-node";

/**
 * Number node parameters
 */
export interface NumberNodeParams extends NodeParams {
  value: number;
  min: number;
  max: number;
}

/**
 * Number node component
 *
 * This component provides a number input that outputs a numeric value.
 */
const NumberNodeComponent: React.FC<NodeComponentProps> = ({ id, data }) => {
  const updateNodeParams = useGraphStore((state) => state.updateNodeParams);

  // Get parameters with proper typing and default values
  const params = useNodeParams<NumberNodeParams>("number", data);
  const { value, min, max } = params;

  // Handle value change
  const handleValueChange = useCallback(
    (newValue: number) => {
      updateNodeParams(id, { value: newValue });
    },
    [id, updateNodeParams],
  );

  // Handle min change
  const handleMinChange = useCallback(
    (newMin: number) => {
      updateNodeParams(id, { min: newMin });
    },
    [id, updateNodeParams],
  );

  // Handle max change
  const handleMaxChange = useCallback(
    (newMax: number) => {
      updateNodeParams(id, { max: newMax });
    },
    [id, updateNodeParams],
  );

  return (
    <BaseNode className="w-[250px]">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle>Number</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        {/* Value Parameter */}
        <ProviderNumberParameter
          label="Value"
          value={value}
          onChange={handleValueChange}
          min={min}
          max={max}
        />

        {/* Min Parameter */}
        <ProviderNumberParameter
          label="Min"
          value={min}
          onChange={handleMinChange}
          min={-1000}
          max={max}
          showSlider={false}
          inputSize="medium"
        />

        {/* Max Parameter */}
        <ProviderNumberParameter
          label="Max"
          value={max}
          onChange={handleMaxChange}
          min={min}
          max={1000}
          showSlider={false}
          inputSize="medium"
        />
      </BaseNodeContent>

      <BaseNodeFooter>
        {/* Output Parameter */}
        <NodeOutput id="number" label="Number" />
      </BaseNodeFooter>
    </BaseNode>
  );
};

/**
 * Number node evaluator function
 */
function evaluateNumberNode(ctx: EvaluationContext) {
  // Get the number parameter
  const value = ctx.getNumberInput("value");

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
  inputs: [],
  outputs: [{ id: "number", label: "Number", type: "number", required: true }],
  defaultParams: {
    value: 10,
    min: 0,
    max: 100,
  },
  component: NumberNodeComponent,
  evaluate: evaluateNumberNode,
});

// Export the number node component
export const NumberNode = NumberNodeComponent;
