import { BaseNode } from "@/nodes/BaseNode.tsx";
import { Handle, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { AppNode, type OutputNode, TypedValue } from "./types.ts";
import { useEffect, useRef } from "react";
import { Layer } from "@/core/Layer.ts";
import { HANDLE_TYPES } from "@/handleTypes.ts";
import { Input } from "@/components/ui/input.tsx";
import useNodeActions from "@/use-node-actions.ts";
import { Slider } from "@/components/ui/slider.tsx";
import { createGraphEvaluator } from "@/evaluators";

export type OutputNodeData = {
  params: {
    width: number;
    height: number;
    scale: number;
  };
};

function isLayerValue(value: TypedValue): value is TypedValue<"layer"> {
  return value.type === "layer";
}

export function OutputNode({ data, id }: NodeProps<OutputNode>) {
  const { updateNodeData } = useNodeActions();
  const { getNodes, getEdges } = useReactFlow();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Default values
  const { width = 32, height = 32, scale = 10 } = data.params;

  useEffect(() => {
    const evaluateAndRender = () => {
      const nodes = getNodes() as AppNode[];
      const edges = getEdges();

      try {
        const graphEvaluator = createGraphEvaluator(nodes, edges);
        const result = graphEvaluator.evaluate(id); // Evaluate OutputNode itself
        const resultLayer = result["layer-input"]; // We're expecting Layer here

        if (!isLayerValue(resultLayer)) {
          throw new Error(`Unexpected layer type: ${resultLayer.type}`);
        }

        renderLayer(resultLayer.value);
      } catch (error) {
        console.error("Graph evaluation error:", error);
        clearCanvas();
      }
    };

    const renderLayer = (layer: Layer) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${width * scale}px`;
      canvas.style.height = `${height * scale}px`;

      // Draw the layer
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const imageData = layer.toImageData();
      ctx.putImageData(imageData, 0, 0);
    };

    const clearCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Initial render
    evaluateAndRender();

    // Optional: Set up auto-update when dependencies change
    const handleUpdate = () => evaluateAndRender();
    window.addEventListener("graph-updated", handleUpdate);

    return () => {
      window.removeEventListener("graph-updated", handleUpdate);
    };
  }, [width, height, scale, getNodes, getEdges]);

  return (
    <BaseNode title="Output">
      <Handle
        type="target"
        position={Position.Left}
        id="layer-input"
        style={{
          backgroundColor: HANDLE_TYPES.layer.color,
          width: 12,
          height: 12,
        }}
      />

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Canvas Size
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs">Width</label>
              <Input
                type="number"
                min={1}
                max={256}
                value={width}
                onChange={(e) =>
                  updateNodeData(id, {
                    params: {
                      ...data.params,
                      width: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <label className="text-xs">Height</label>
              <Input
                type="number"
                min={1}
                max={256}
                value={height}
                onChange={(e) =>
                  updateNodeData(id, {
                    params: {
                      ...data.params,
                      height: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Scale
          </label>
          <Slider
            min={1}
            max={20}
            step={1}
            value={[scale]}
            onValueChange={([value]) =>
              updateNodeData(id, {
                params: {
                  ...data.params,
                  scale: value,
                },
              })
            }
          />
        </div>

        <div className="border rounded-md overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full bg-gray-100 dark:bg-gray-800"
            style={{
              imageRendering: "pixelated",
            }}
          />
        </div>
      </div>
    </BaseNode>
  );
}
