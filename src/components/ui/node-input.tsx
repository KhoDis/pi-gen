/**
 * NodeInput Component for the Pi-Gen project
 *
 * This component provides a standardized way to display input parameters
 * with a handle on the left side and customizable content.
 */

import React from "react";
import { Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { BaseHandle } from "@/components/base-handle";

export interface NodeInputProps {
  /** ID for the input handle */
  id: string;
  /** Label for the input parameter */
  label: string;
  /** Content to render in the input parameter */
  children: React.ReactNode;
  /** Additional className for the container */
  className?: string;
}

/**
 * NodeInput component
 *
 * This component creates an input parameter with a handle on the left side
 * and customizable content. It's designed for input parameters that can have
 * various controls (sliders, inputs, etc.).
 */
export const NodeInput: React.FC<NodeInputProps> = ({
  id,
  label,
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col w-full py-1 pr-4", className)}>
      <div className="flex items-center w-full">
        {/* Input handle - always on the left */}
        <div className="w-4 flex justify-start items-center relative">
          <BaseHandle id={id} type="target" position={Position.Left} />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col">
          <span className="text-sm font-medium">{label}</span>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
};
