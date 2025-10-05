/**
 * Circle Node Component for the Pi-Gen project
 *
 * This component implements a node that generates a circle shape.
 */

import React, { useCallback } from "react";
import { NodeComponentProps } from "../../core/registry/NodeRegistry";
import { useGraphStore } from "../../core/store/graphStore";
import { RGBA } from "../../core/models/Layer";
import { createNodeComponent } from "./BaseNode";
import { Layer } from "../../core/models/Layer";
import { createLayerValue } from "../../core/types/values";
import { nodeRegistry } from "../../core/registry/NodeRegistry";
import { EvaluationContext } from "../../core/types/evaluation";
import { NodeParams } from "../../core/types/nodes";
import { useNodeParams } from "../../core/hooks/useNodeParams";

// Import shadcn/ui components
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { ColorPicker } from "../ui/color-picker";
import { Handle, Position } from "@xyflow/react";

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
 * This component only provides the parameter controls.
 * The outer container and header are provided by BaseNode.
 */
const CircleNodeContent: React.FC<NodeComponentProps> = ({ id, data }) => {
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
    <div className="space-y-4 p-2">
      {/* Radius Control */}
      <div className="space-y-2 relative">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Radius</label>
          <Input
            type="number"
            min={1}
            max={100}
            value={radius}
            onChange={(e) => handleRadiusChange(Number(e.target.value))}
            className="w-16 h-8"
          />
        </div>
        <Slider
          min={1}
          max={100}
          step={1}
          value={[radius]}
          onValueChange={(values) => handleRadiusChange(values[0])}
        />
        <Handle
          type="target"
          position={Position.Left}
          id="radius"
          style={{
            backgroundColor: "#60a5fa",
            width: 10,
            height: 10,
            top: 20,
          }}
        />
      </div>

      {/* Color Control */}
      <div className="space-y-2 relative">
        <label className="text-sm font-medium">Color</label>
        <ColorPicker value={color} onChange={handleColorChange} />
        <Handle
          type="target"
          position={Position.Left}
          id="color"
          style={{
            backgroundColor: "#f472b6",
            width: 10,
            height: 10,
            top: 20,
          }}
        />
      </div>

      {/* Output */}
      <div className="relative h-6 mt-4">
        <div className="h-6 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500">
          Layer Output
        </div>
        <Handle
          type="source"
          position={Position.Right}
          id="layer"
          style={{
            backgroundColor: "#4ade80",
            width: 10,
            height: 10,
            top: 3,
          }}
        />
      </div>
    </div>
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
  component: CircleNodeContent,
  evaluate: evaluateCircleNode,
});

// Create the circle node component
export const CircleNode = createNodeComponent("circle");
