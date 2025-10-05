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
import { Position } from "@xyflow/react";

// Import shadcn/ui components
import { Slider } from "../ui/slider";
import { Input } from "../ui/input";
import { ColorPicker } from "../ui/color-picker";

// Import React Flow UI components
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
  BaseNodeFooter,
} from "../base-node";
import { LabeledHandle } from "../labeled-handle";

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
        {/* Radius Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <LabeledHandle
              id="radius"
              type="target"
              position={Position.Left}
              title="Radius"
            />
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
        </div>

        {/* Color Control */}
        <div className="space-y-2">
          <LabeledHandle
            id="color"
            type="target"
            position={Position.Left}
            title="Color"
          />
          <ColorPicker value={color} onChange={handleColorChange} />
        </div>
      </BaseNodeContent>

      <BaseNodeFooter>
        <div className="flex w-full items-center justify-between">
          <span className="text-xs text-muted-foreground">Output</span>
          <LabeledHandle
            id="layer"
            type="source"
            position={Position.Right}
            title="Layer"
          />
        </div>
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
