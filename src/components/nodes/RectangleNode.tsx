/**
 * Rectangle Node Component for the Pi-Gen project
 *
 * This component implements a node that generates a rectangle shape.
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
 * Rectangle node parameters
 */
export interface RectangleNodeParams extends NodeParams {
  width: number;
  height: number;
  color: RGBA;
}

/**
 * Rectangle node component
 *
 * This component provides the parameter controls for a rectangle node.
 */
const RectangleNodeComponent: React.FC<NodeComponentProps> = ({ id, data }) => {
  const updateNodeParams = useGraphStore((state) => state.updateNodeParams);

  // Get parameters with proper typing and default values
  const params = useNodeParams<RectangleNodeParams>("rectangle", data);
  const { width, height, color } = params;

  // Handle parameter changes
  const handleWidthChange = useCallback(
    (value: number) => {
      updateNodeParams(id, { width: value });
    },
    [id, updateNodeParams],
  );

  const handleHeightChange = useCallback(
    (value: number) => {
      updateNodeParams(id, { height: value });
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
        <BaseNodeHeaderTitle>Rectangle</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        {/* Input Parameters */}
        <NumberParameter
          id="width"
          label="Width"
          value={width}
          onChange={handleWidthChange}
          min={1}
          max={100}
        />

        <NumberParameter
          id="height"
          label="Height"
          value={height}
          onChange={handleHeightChange}
          min={1}
          max={100}
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
 * Rectangle node evaluator function
 */
function evaluateRectangleNode(ctx: EvaluationContext) {
  // Get values directly from context with type safety
  // These will throw appropriate errors if inputs are missing or of wrong type
  const width = ctx.getNumberInput("width");
  const height = ctx.getNumberInput("height");
  const color = ctx.getColorInput("color");

  // Create a layer with the rectangle
  const layer = new Layer(width, height);

  // Draw the rectangle (fill the entire layer)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      layer.setPixel(x, y, color);
    }
  }

  // Return the layer as output
  return {
    layer: createLayerValue(layer),
  };
}

// Register the rectangle node type
nodeRegistry.register({
  type: "rectangle",
  label: "Rectangle",
  category: "Shapes",
  description: "Generates a rectangle shape",
  inputs: [
    { id: "width", label: "Width", type: "number", required: false },
    { id: "height", label: "Height", type: "number", required: false },
    { id: "color", label: "Color", type: "color", required: false },
  ],
  outputs: [{ id: "layer", label: "Layer", type: "layer", required: true }],
  defaultParams: {
    width: 20,
    height: 10,
    color: { r: 0, g: 128, b: 255, a: 1 },
  },
  component: RectangleNodeComponent,
  evaluate: evaluateRectangleNode,
});

// Export the rectangle node component
export const RectangleNode = RectangleNodeComponent;
