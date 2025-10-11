/**
 * Display Node Component for the Pi-Gen project
 *
 * This component displays the final output of the node graph.
 */

import React, { useEffect, useRef, useMemo } from "react";
import { NodeComponentProps } from "@/core/registry/NodeRegistry";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { EvaluationContext } from "@/core/types/evaluation";
import { createLayerValue, isLayerValue } from "@/core/types/values";
import { useGraphStore } from "@/core/store/graphStore";
import { createGraphEvaluator } from "@/core/engine/GraphEvaluator";

// Import specialized parameter components
import { NodeInput } from "@/components/ui/node-input";

// Import React Flow UI components
import {
  BaseNode,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeContent,
  BaseNodeFooter,
} from "@/components/base/BaseNode";

/**
 * Display node parameters
 */
export interface DisplayNodeParams {
  // No parameters needed for the display node
}

/**
 * Display node component
 *
 * This component displays the final rendered image from the node graph.
 */
const DisplayNodeComponent: React.FC<NodeComponentProps> = ({ id }) => {
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

  // Use the GraphEvaluator to evaluate the graph and get the layer
  const layer = useMemo(() => {
    if (!inputEdge || !sourceNode) return undefined;

    try {
      // Create a graph evaluator with the current nodes and edges
      const evaluator = createGraphEvaluator(
        graphStore.nodes,
        graphStore.edges,
      );

      // Evaluate the graph starting from this node
      const results = evaluator.evaluateNode(id);

      // Get the layer from the input
      const layerValue = results.layer;

      // Return the layer if it exists
      if (layerValue && isLayerValue(layerValue)) {
        return layerValue.value;
      }

      return undefined;
    } catch (error) {
      console.error("Error evaluating graph:", error);
      return undefined;
    }
  }, [id, sourceNode, inputEdge, graphStore.nodes, graphStore.edges]);

  const errorText = useMemo(() => {
    try {
      // If layer computed fine, no error
      if (layer) return undefined;
      // Re-run to capture error message explicitly
      const evaluator = createGraphEvaluator(
        graphStore.nodes,
        graphStore.edges,
      );
      evaluator.evaluateNode(id);
      return undefined;
    } catch (err) {
      return err instanceof Error ? err.message : String(err);
    }
  }, [id, layer, graphStore.nodes, graphStore.edges]);

  // Render the layer to the canvas when it changes
  useEffect(() => {
    const canvas = canvasRef.current;

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
  }, [layer]);

  return (
    <BaseNode className="w-[250px]" data-render-key={Math.random()}>
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle>Display</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        {errorText && (
          <div className="mb-2 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {errorText}
          </div>
        )}
        {/* Input Parameter with Canvas */}
        <NodeInput id="layer" label="Layer Input" valueType="layer">
          <div className="border border-gray-300 dark:border-gray-700 rounded overflow-hidden mt-2">
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
        </NodeInput>
      </BaseNodeContent>

      <BaseNodeFooter className="px-4">
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
      </BaseNodeFooter>
    </BaseNode>
  );
};

/**
 * Display node evaluator function
 *
 * This node doesn't transform data, it just passes through the input layer.
 */
function evaluateDisplayNode(ctx: EvaluationContext) {
  // Get the input layer
  const layer = ctx.getLayerInput("layer");

  // Return the layer as a proper Value object
  return {
    layer: createLayerValue(layer),
  };
}

// Register the display node type
nodeRegistry.register({
  type: "display",
  label: "Display",
  category: "Output",
  description: "Displays the final output image",
  inputs: [{ id: "layer", label: "Layer", type: "layer", required: true }],
  outputs: [],
  defaultParams: {},
  component: DisplayNodeComponent,
  evaluate: evaluateDisplayNode,
});

// Export the display node component
export const DisplayNode = DisplayNodeComponent;
