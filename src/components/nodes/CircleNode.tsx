/**
 * Circle Node Component for the Pi-Gen project
 */

import React, { useCallback } from "react";
import { NodeComponentProps } from "../../core/types/nodes.new";
import { useGraphStore } from "../../core/store/graphStore";
import { RGBA } from "../../core/models/Layer";
import { Layer } from "../../core/models/Layer";
import { createLayerValue, LayerValue } from "../../core/types/values.new";
import { nodeRegistry } from "../../core/registry/NodeRegistry.new";
import {
  EvaluationContext,
  EvaluationResult,
} from "../../core/types/evaluation.new";
import { useNodeParams } from "../../core/hooks/useNodeParams";
import { NumberParameter } from "../ui/number-parameter";
import { ColorParameter } from "../ui/color-parameter";
import { NodeOutput } from "../ui/node-output";
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
  BaseNodeFooter,
} from "../base-node";

interface CircleNodeParams {
  radius: number;
  color: RGBA;
}

const CircleNodeComponent: React.FC<NodeComponentProps<CircleNodeParams>> = ({
  id,
  data,
}) => {
  const updateNodeParams = useGraphStore((state) => state.updateNodeParams);
  const params = useNodeParams<CircleNodeParams>(data);

  const handleRadiusChange = useCallback(
    (value: number) => updateNodeParams(id, { radius: value }),
    [id, updateNodeParams],
  );

  const handleColorChange = useCallback(
    (value: RGBA) => updateNodeParams(id, { color: value }),
    [id, updateNodeParams],
  );

  return (
    <BaseNode className="w-[250px]">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle>Circle</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        <NumberParameter
          id="radius"
          label="Radius"
          value={params.radius}
          onChange={handleRadiusChange}
          min={1}
          max={100}
        />

        <ColorParameter
          id="color"
          label="Color"
          value={params.color}
          onChange={handleColorChange}
        />
      </BaseNodeContent>

      <BaseNodeFooter>
        <NodeOutput id="layer" label="Layer" />
      </BaseNodeFooter>
    </BaseNode>
  );
};

function evaluateCircleNode(
  ctx: EvaluationContext<
    { radius: "number"; color: "color" },
    CircleNodeParams
  >,
): EvaluationResult<{ layer: LayerValue }> {
  try {
    const radius = ctx.getInput("radius");
    const color = ctx.getInput("color");

    const size = radius * 2;
    const layer = new Layer(size, size);
    const centerX = radius;
    const centerY = radius;

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

    return {
      success: true,
      outputs: {
        layer: createLayerValue(layer),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        nodeId: ctx.nodeId,
        code: "CIRCLE_EVALUATION_ERROR",
      },
    };
  }
}

nodeRegistry.register({
  type: "circle",
  label: "Circle",
  category: "Shapes",
  description: "Generates a circle shape",
  inputs: {
    radius: { id: "radius", label: "Radius", type: "number", required: false },
    color: { id: "color", label: "Color", type: "color", required: false },
  },
  outputs: {
    layer: { id: "layer", label: "Layer", type: "layer", required: true },
  },
  defaultParams: {
    radius: 10,
    color: { r: 255, g: 0, b: 0, a: 1 },
  },
  component: CircleNodeComponent,
  evaluate: evaluateCircleNode,
});

export const CircleNode = CircleNodeComponent;
