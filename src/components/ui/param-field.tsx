/**
 * Parameter Field Component for the Pi-Gen project
 *
 * This component provides a standardized way to display parameter fields
 * with properly positioned handles at the edges of the node.
 */

import React from "react";
import { Handle, Position } from "@xyflow/react";

export interface HandleConfig {
  id: string;
  type: "source" | "target";
  position: Position;
  style?: React.CSSProperties;
}

export interface ParamFieldProps {
  label: string;
  children: React.ReactNode;
  leftHandle?: HandleConfig;
  rightHandle?: HandleConfig;
  className?: string;
}

/**
 * ParamField component
 *
 * This component creates a parameter field with handles positioned at the edges.
 * It extends to the full width of the node container to ensure handles are at the edge.
 */
export const ParamField: React.FC<ParamFieldProps> = ({
  label,
  children,
  leftHandle,
  rightHandle,
  className = "",
}) => {
  return (
    <div
      className={`relative border-b border-gray-200 dark:border-gray-700 py-2 ${className}`}
    >
      {/* Left handle */}
      {leftHandle && (
        <Handle
          type={leftHandle.type}
          position={Position.Left}
          id={leftHandle.id}
          style={{
            left: 0,
            top: 20,
            ...leftHandle.style,
          }}
        />
      )}

      {/* Parameter content */}
      <div className="px-3">
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div>{children}</div>
      </div>

      {/* Right handle */}
      {rightHandle && (
        <Handle
          type={rightHandle.type}
          position={Position.Right}
          id={rightHandle.id}
          style={{
            right: 0,
            top: 20,
            ...rightHandle.style,
          }}
        />
      )}
    </div>
  );
};
