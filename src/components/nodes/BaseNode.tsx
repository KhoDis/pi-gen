/**
 * Base Node Component for the Pi-Gen project
 *
 * This component serves as the foundation for all node types.
 */

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { NodeComponentProps } from "../../core/registry/NodeRegistry";
import { nodeRegistry } from "../../core/registry/NodeRegistry";
import { Port } from "../../core/types/nodes";

interface BaseNodeProps {
  title: string;
  type: string;
  selected: boolean;
  inputs?: Port[];
  outputs?: Port[];
  children: React.ReactNode;
}

/**
 * Get the color for a handle based on its type
 */
function getHandleColor(type: string): string {
  switch (type) {
    case "number":
      return "#60a5fa"; // blue
    case "color":
      return "#f472b6"; // pink
    case "layer":
      return "#4ade80"; // green
    case "boolean":
      return "#a78bfa"; // purple
    case "string":
      return "#fbbf24"; // yellow
    case "vector2":
      return "#f97316"; // orange
    default:
      return "#94a3b8"; // gray
  }
}

/**
 * Base node component that provides common functionality for all nodes
 */
export const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  type,
  selected,
  inputs = [],
  outputs = [],
  children,
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        rounded-md shadow-md 
        border-2 ${selected ? "border-blue-500" : "border-gray-200 dark:border-gray-700"}
        overflow-hidden
        transition-colors
        w-60
      `}
      data-node-type={type}
    >
      {/* Node Header */}
      <div className="bg-blue-500 dark:bg-blue-600 text-white p-2">
        <h3 className="text-sm font-medium m-0">{title}</h3>
      </div>

      {/* Node Content */}
      <div className="p-3 relative">
        {/* Input Handles */}
        {inputs.map((input: Port, index: number) => (
          <div
            key={input.id}
            className="absolute left-0 transform -translate-x-1/2"
            style={{ top: `${40 + index * 20}px` }}
          >
            <Handle
              type="target"
              position={Position.Left}
              id={input.id}
              style={{
                backgroundColor: getHandleColor(input.type),
                width: 10,
                height: 10,
              }}
            />
            <span className="text-xs ml-2">{input.label}</span>
          </div>
        ))}

        {/* Node Content (parameters, etc.) */}
        {children}

        {/* Output Handles */}
        {outputs.map((output: Port, index: number) => (
          <div
            key={output.id}
            className="absolute right-0 transform translate-x-1/2 text-right"
            style={{ top: `${40 + index * 20}px` }}
          >
            <span className="text-xs mr-2">{output.label}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={output.id}
              style={{
                backgroundColor: getHandleColor(output.type),
                width: 10,
                height: 10,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Higher-order component to create a node component from a node type
 */
export function createNodeComponent(
  nodeType: string,
): React.FC<NodeComponentProps> {
  return (props) => {
    const nodeTypeInfo = nodeRegistry.get(nodeType);

    if (!nodeTypeInfo) {
      return (
        <div className="bg-red-100 p-2 rounded border border-red-500">
          <div className="text-red-500 font-bold">
            Unknown node type: {nodeType}
          </div>
        </div>
      );
    }

    // Create a component instance using JSX
    const NodeContent = nodeTypeInfo.component;

    return (
      <BaseNode
        title={nodeTypeInfo.label}
        type={nodeType}
        selected={props.selected}
        inputs={nodeTypeInfo.inputs}
        outputs={nodeTypeInfo.outputs}
      >
        <NodeContent {...props} />
      </BaseNode>
    );
  };
}
