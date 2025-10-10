/**
 * Circle Node Component for the Pi-Gen project
 *
 * This component implements a node that generates a circle shape.
 */

import React, { useCallback } from "react";
import { NodeComponentProps } from "../../core/registry/NodeRegistry";
import { useGraphStore } from "../../core/store/graphStore";
import { RGBA } from "../../core/models/Layer";
import { Layer } from "../../core/models/Layer";
import { createLayerValue } from "../../core/types/values";
import { nodeRegistry } from "../../core/registry/NodeRegistry";
import { EvaluationContext } from "../../core/types/evaluation";
import { NodeParams } from "../../core/types/nodes";
import { useNodeParams } from "../../core/hooks/useNodeParams";

// Import specialized parameter components
import { NumberParameter } from "../ui/number-parameter";
import { ColorParameter } from "../ui/color-parameter";
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
 * Circle node parameters
 */
export interface CircleNodeParams extends NodeParams {
  radius: number;
  color: RGBA;
}

/**
 * Circle node component
 *
 * This component provides the parameter controls for a circle node.
 */
const CircleNodeComponent: React.FC<NodeComponentProps> = ({ id, data }) => {
  const updateNodeParams = useGraphStore((state) => state.updateNodeParams);

  // Get parameters with proper typing and default values
  const params = useNodeParams<CircleNodeParams>("circle", data);
  const { radius, color } = params;

  // Handle parameter changes
  const handleRadiusChange = useCallback(
    (value: number) => {
      updateNodeParams(id, { radius: value });
    },
    [id, updateNodeParams],
  );

  const handleColorChange = useCallback(
    (value: RGBA) => {
      updateNodeParams(id, { color: value });
    },
    [id, updateNodeParams],
  );

  return (
    <BaseNode className="w-[250px]">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle>Circle</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        {/* Input Parameters */}
        <NumberParameter
          id="radius"
          label="Radius"
          value={radius}
          onChange={handleRadiusChange}
        />

        <ColorParameter
          id="color"
          label="Color"
          value={color}
          onChange={handleColorChange}
        />
      </BaseNodeContent>

      <BaseNodeFooter>
        {/* Output Parameters */}
        <NodeOutput id="layer" label="Layer" />
      </BaseNodeFooter>
    </BaseNode>
  );
};

/**
 * Circle node evaluator function
 */
function evaluateCircleNode(ctx: EvaluationContext) {
  // Get values directly from context with type safety
  // These will throw appropriate errors if inputs are missing or of wrong type
  const radius = ctx.getNumberInput("radius");
  const color = ctx.getColorInput("color");

  // Create a layer with the circle
  const size = radius * 2;
  const layer = new Layer(size, size);
  const centerX = radius;
  const centerY = radius;

  // Draw the circle
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        layer.setPixel(x, y, color);
      }
    }
  }

  // Return the layer as output
  return {
    layer: createLayerValue(layer),
  };
}

// Register the circle node type
nodeRegistry.register({
  type: "circle",
  label: "Circle",
  category: "Shapes",
  description: "Generates a circle shape",
  inputs: [
    { id: "radius", label: "Radius", type: "number", required: false },
    { id: "color", label: "Color", type: "color", required: false },
  ],
  outputs: [{ id: "layer", label: "Layer", type: "layer", required: true }],
  defaultParams: {
    radius: 10,
    color: { r: 255, g: 0, b: 0, a: 1 },
  },
  component: CircleNodeComponent,
  evaluate: evaluateCircleNode,
});

// Export the circle node component
export const CircleNode = CircleNodeComponent;
