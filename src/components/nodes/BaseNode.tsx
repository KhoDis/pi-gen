/**
 * Base Node Component for the Pi-Gen project
 *
 * This component serves as the foundation for all node types.
 */

import React from "react";
import { NodeComponentProps } from "../../core/registry/NodeRegistry";
import { nodeRegistry } from "../../core/registry/NodeRegistry";

interface BaseNodeProps {
  title: string;
  type: string;
  selected: boolean;
  children: React.ReactNode;
}

/**
 * Base node component that provides common functionality for all nodes
 */
export const BaseNode: React.FC<BaseNodeProps> = ({
  title,
  type,
  selected,
  children,
}) => {
  return (
    <div
      className={`
        bg-white dark:bg-gray-800 
        rounded-md shadow-md 
        border-2 ${selected ? "border-blue-500" : "border-gray-200 dark:border-gray-700"}
        transition-colors
        w-60
        relative
        overflow-visible
      `}
      data-node-type={type}
    >
      {/* Node Header */}
      <div className="bg-blue-500 dark:bg-blue-600 text-white p-2">
        <h3 className="text-sm font-medium m-0">{title}</h3>
      </div>

      {/* Node Content - No padding here to allow fields to extend to edges */}
      <div className="node-content">{children}</div>
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
      >
        <NodeContent {...props} />
      </BaseNode>
    );
  };
}
