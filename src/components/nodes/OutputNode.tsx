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
import { Handle, Position } from "@xyflow/react";
import { createLayerValue } from "../../core/types/values";

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
const OutputNodeContent: React.FC<NodeComponentProps> = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // We'll use a ref to store the layer data
  // In a real implementation, this would come from the graph evaluator
  const layerRef = useRef<Layer | null>(null);

  // For demonstration purposes, create a simple layer if none exists
  useEffect(() => {
    if (!layerRef.current) {
      const demoLayer = new Layer(100, 100);

      // Draw a simple pattern
      for (let x = 0; x < 100; x++) {
        for (let y = 0; y < 100; y++) {
          if ((x + y) % 10 < 5) {
            demoLayer.setPixel(x, y, { r: 255, g: 0, b: 0, a: 1 });
          }
        }
      }

      layerRef.current = demoLayer;
    }

    // Render the layer
    renderLayer();
  }, []);

  // Function to render the layer to the canvas
  const renderLayer = () => {
    const canvas = canvasRef.current;
    const layer = layerRef.current;

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
  };

  return (
    <div className="space-y-4 p-2">
      {/* Input handle */}
      <div className="relative">
        <label className="text-sm font-medium">Input Layer</label>
        <Handle
          type="target"
          position={Position.Left}
          id="layer"
          style={{
            backgroundColor: "#4ade80",
            width: 10,
            height: 10,
            top: 10,
          }}
        />
      </div>

      {/* Canvas output */}
      <div className="border border-gray-300 dark:border-gray-700 rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          className="pixelated" // Apply pixelated rendering
          style={{
            width: "100%",
            imageRendering: "pixelated", // For modern browsers
          }}
        />
      </div>

      {/* Download button */}
      <button
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => {
          if (!canvasRef.current || !layerRef.current) return;

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
