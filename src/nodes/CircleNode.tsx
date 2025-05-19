import {
  Handle,
  NodeProps,
  Position,
  useUpdateNodeInternals,
} from "@xyflow/react";
import { type CircleNode } from "./types.ts";
import { BaseNode } from "@/nodes/BaseNode.tsx";
import { Input } from "@/components/ui/input.tsx";
import { ColorPicker } from "@/components/ui/color-picker.tsx";
import { RGBA } from "@/core/Layer.ts";
import { useCallback, useEffect } from "react";
import useNodeActions from "@/use-node-actions.ts";
import { HANDLE_TYPES } from "@/handleTypes.ts";
import { Slider } from "@/components/ui/slider.tsx";

export interface CircleNodeParams {
  radius: number;
  color: RGBA;
}

export type CircleNodeData = {
  params: CircleNodeParams;
};

export function CircleNode({ data, id }: NodeProps<CircleNode>) {
  const { updateNodeData } = useNodeActions();
  const updateNodeInternals = useUpdateNodeInternals();

  const handleRadiusChange = useCallback(
    (value: number) => {
      updateNodeData(id, {
        ...data,
        params: {
          ...data.params,
          radius: value,
        },
      });
    },
    [id, data, updateNodeData],
  );

  const handleColorChange = useCallback(
    (color: RGBA) => {
      updateNodeData(id, {
        ...data,
        params: {
          ...data.params,
          color,
        },
      });
    },
    [id, data, updateNodeData],
  );

  // Update node internals when params change (for proper handle positioning)
  useEffect(() => {
    updateNodeInternals(id);
  }, [data.params, id, updateNodeInternals]);

  return (
    <BaseNode title="Circle">
      <Handle
        type="source"
        position={Position.Right}
        id="layer-output"
        style={{
          backgroundColor: HANDLE_TYPES.layer.color,
          width: 12,
          height: 12,
        }}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Radius
          </label>
          <div className="flex gap-2 items-center">
            <Slider
              min={1}
              max={50}
              step={1}
              value={[data.params.radius]}
              onValueChange={([value]) => handleRadiusChange(value)}
              className="flex-1"
            />
            <Input
              type="number"
              min={1}
              max={50}
              value={data.params.radius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-16"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Color
          </label>
          <ColorPicker value={data.params.color} onChange={handleColorChange} />
        </div>
      </div>
    </BaseNode>
  );
}
