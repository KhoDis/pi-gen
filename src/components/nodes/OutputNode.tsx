/**
 * Output Node Component for the Pi-Gen project
 *
 * This component displays the final output of the node graph.
 */

import React, { useEffect, useRef } from "react";
import { NodeComponentProps } from "../../core/registry/NodeRegistry";
import { createNodeComponent } from "./BaseNode";
import { nodeRegistry } from "../../core/registry/NodeRegistry";
import { EvaluationContext } from "../../core/types/evaluation";
import { Layer } from "../../core/models/Layer";
import { Position } from "@xyflow/react";
import { createLayerValue } from "../../core/types/values";
import { useGraphStore } from "../../core/store/graphStore";
import { ParamField } from "../ui/param-field";
import { RGBA } from "../../core/models/Layer";

/**
 * Output node parameters
 */
export interface OutputNodeParams {
  // No parameters needed for the output node
}

/**
 * Output node component
 *
 * This component displays the final rendered image from the node graph.
 */
const OutputNodeContent: React.FC<NodeComponentProps> = ({ id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphStore = useGraphStore();

  // Find the input edge connected to this node's layer input
  const inputEdge = graphStore.edges.find(
    (edge) => edge.target === id && edge.targetHandle === "layer",
  );

  // Get the source node of the input edge
  const sourceNode = inputEdge
    ? graphStore.nodes.find((node) => node.id === inputEdge.source)
    : undefined;

  // Function to evaluate the graph and get the layer
  const getLayer = (): Layer | undefined => {
    if (!sourceNode) return undefined;

    // In a real implementation, this would use the graph evaluator
    // For now, we'll create a simple circle as a placeholder
    const radius = (sourceNode.data.params?.radius as number) || 10;
    const color = (sourceNode.data.params?.color as RGBA) || {
      r: 255,
      g: 0,
      b: 0,
      a: 1,
    };

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

    return layer;
  };

  // Render the layer to the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const layer = getLayer();

    if (!canvas || !layer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions to match the layer
    canvas.width = layer.width;
    canvas.height = layer.height;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each pixel from the layer
    for (let x = 0; x < layer.width; x++) {
      for (let y = 0; y < layer.height; y++) {
        const pixel = layer.getPixel(x, y);
        if (pixel) {
          ctx.fillStyle = `rgba(${pixel.r}, ${pixel.g}, ${pixel.b}, ${pixel.a})`;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
  }, [sourceNode, graphStore.edges]);

  // Get the layer for rendering
  const layer = getLayer();

  return (
    <div>
      {/* Input handle */}
      <ParamField
        label="Input Layer"
        leftHandle={{
          id: "layer",
          type: "target",
          position: Position.Left,
          style: { backgroundColor: "#4ade80" },
        }}
      >
        <div className="h-4"></div>
      </ParamField>

      {/* Canvas output */}
      <div className="px-3 py-2">
        <div className="border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
          {layer ? (
            <canvas
              ref={canvasRef}
              className="pixelated" // Apply pixelated rendering
              style={{
                width: "100%",
                imageRendering: "pixelated", // For modern browsers
              }}
            />
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-gray-500">
              Connect a layer to see output
            </div>
          )}
        </div>
      </div>

      {/* Download button */}
      <div className="px-3 pb-3">
        <button
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!layer}
          onClick={() => {
            if (!canvasRef.current || !layer) return;

            // Create a download link for the canvas
            const link = document.createElement("a");
            link.download = "pi-gen-output.png";
            link.href = canvasRef.current.toDataURL("image/png");
            link.click();
          }}
        >
          Download Image
        </button>
      </div>
    </div>
  );
};

/**
 * Output node evaluator function
 *
 * This node doesn't transform data, it just passes through the input layer.
 */
function evaluateOutputNode(ctx: EvaluationContext) {
  // Get the input layer
  const layer = ctx.getLayerInput("layer");

  // Return the layer as a proper Value object
  return {
    layer: createLayerValue(layer),
  };
}

// Register the output node type
nodeRegistry.register({
  type: "output",
  label: "Output",
  category: "Output",
  description: "Displays the final output image",
  inputs: [{ id: "layer", label: "Layer", type: "layer", required: true }],
  outputs: [],
  defaultParams: {},
  component: OutputNodeContent,
  evaluate: evaluateOutputNode,
});

// Create the output node component
export const OutputNode = createNodeComponent("output");
