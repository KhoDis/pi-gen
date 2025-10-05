/**
 * Parameter Field Component for the Pi-Gen project
 *
 * This component provides a standardized way to display node parameters
 * with associated input/output handles.
 */

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { Label } from "./label";

interface ParamFieldProps {
  label: string;
  inputId?: string;
  outputId?: string;
  inputType?: string;
  outputType?: string;
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
 * Parameter field component with handles
 */
export function ParamField({
  label,
  inputId,
  outputId,
  inputType = "number",
  outputType = "number",
  children,
}: ParamFieldProps) {
  return (
    <div className="relative flex items-center mb-4">
      {/* Input Handle */}
      {inputId && (
        <Handle
          type="target"
          position={Position.Left}
          id={inputId}
          style={{
            left: -10,
            backgroundColor: getHandleColor(inputType),
            width: 10,
            height: 10,
          }}
        />
      )}

      <div className="flex-1">
        <Label className="mb-1">{label}</Label>
        <div className="w-full">{children}</div>
      </div>

      {/* Output Handle */}
      {outputId && (
        <Handle
          type="source"
          position={Position.Right}
          id={outputId}
          style={{
            right: -10,
            backgroundColor: getHandleColor(outputType),
            width: 10,
            height: 10,
          }}
        />
      )}
    </div>
  );
}
