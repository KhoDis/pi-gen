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
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { ColorPicker } from "../ui/color-picker";
import { Card } from "../ui/card";

/**
 * Circle node parameters
 */
export interface CircleNodeParams extends NodeParams {
  radius: number;
  color: RGBA;
}

/**
 * Circle node component
 */
const CircleNodeContent: React.FC<NodeComponentProps> = ({
  id,
  data,
  // selected is provided by the framework but not used in this component
}) => {
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
    <Card className="p-4 w-[280px] shadow-md">
      <div className="text-lg font-semibold mb-4">Circle</div>

      <div className="space-y-6">
        {/* Radius Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="radius">Radius</Label>
            <Input
              id="radius-input"
              type="number"
              min={1}
              max={100}
              value={radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-16 h-8"
            />
          </div>
          <Slider
            id="radius"
            min={1}
            max={100}
            step={1}
            value={[radius]}
            onValueChange={(values) => handleRadiusChange(values[0])}
          />
        </div>

        {/* Color Control */}
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <ColorPicker value={color} onChange={handleColorChange} />
        </div>
      </div>
    </Card>
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
