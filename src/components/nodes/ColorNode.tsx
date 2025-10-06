/**
 * Color Node Component for the Pi-Gen project
 *
 * This component implements a node that provides a color value.
 */

import React, { useCallback } from "react";
import { NodeComponentProps } from "../../core/registry/NodeRegistry";
import { useGraphStore } from "../../core/store/graphStore";
import { RGBA } from "../../core/models/Layer";
import { createColorValue } from "../../core/types/values";
import { nodeRegistry } from "../../core/registry/NodeRegistry";
import { EvaluationContext } from "../../core/types/evaluation";
import { NodeParams } from "../../core/types/nodes";
import { useNodeParams } from "../../core/hooks/useNodeParams";

// Import specialized parameter components
import { ProviderColorParameter } from "../ui/provider-color-parameter";
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
 * Color node parameters
 */
export interface ColorNodeParams extends NodeParams {
  color: RGBA;
}

/**
 * Color node component
 *
 * This component provides a color picker that outputs a color value.
 */
const ColorNodeComponent: React.FC<NodeComponentProps> = ({ id, data }) => {
  const updateNodeParams = useGraphStore((state) => state.updateNodeParams);

  // Get parameters with proper typing and default values
  const params = useNodeParams<ColorNodeParams>("color", data);
  const { color } = params;

  // Handle color change
  const handleColorChange = useCallback(
    (value: RGBA) => {
      updateNodeParams(id, { color: value });
    },
    [id, updateNodeParams],
  );

  return (
    <BaseNode className="w-[250px]">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle>Color</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        {/* Color Parameter */}
        <ProviderColorParameter
          label="Color"
          value={color}
          onChange={handleColorChange}
        />
      </BaseNodeContent>

      <BaseNodeFooter>
        {/* Output Parameter */}
        <NodeOutput id="color" label="Color" />
      </BaseNodeFooter>
    </BaseNode>
  );
};

/**
 * Color node evaluator function
 */
function evaluateColorNode(ctx: EvaluationContext) {
  // Get the color parameter
  const color = ctx.getColorInput("color");

  // Return the color as output
  return {
    color: createColorValue(color.r, color.g, color.b, color.a),
  };
}

// Register the color node type
nodeRegistry.register({
  type: "color",
  label: "Color",
  category: "Values",
  description: "Provides a color value",
  inputs: [],
  outputs: [{ id: "color", label: "Color", type: "color", required: true }],
  defaultParams: {
    color: { r: 255, g: 0, b: 0, a: 1 },
  },
  component: ColorNodeComponent,
  evaluate: evaluateColorNode,
});

// Export the color node component
export const ColorNode = ColorNodeComponent;
