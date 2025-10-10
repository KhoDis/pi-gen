/**
 * NodeOutput Component for the Pi-Gen project
 *
 * This component provides a standardized way to display output parameters
 * with a handle on the right side and a label.
 */

import React from "react";
import { Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { BaseHandle } from "@/components/base/BaseHandle";

export interface NodeOutputProps {
  /** ID for the output handle */
  id: string;
  /** Label for the output parameter */
  label: string;
  /** Additional className for the container */
  className?: string;
}

/**
 * NodeOutput component
 *
 * This component creates an output parameter with a handle on the right side
 * and a label. It's designed for output parameters that typically just have
 * labels with output handles.
 */
export const NodeOutput: React.FC<NodeOutputProps> = ({
  id,
  label,
  className,
}) => {
  return (
    <div className={cn("flex items-center w-full py-1", className)}>
      {/* Label - aligned to the right */}
      <div className="flex-1 text-right">
        <span className="text-sm font-medium">{label}</span>
      </div>

      {/* Output handle - always on the right */}
      <div className="w-4 flex justify-end items-center relative">
        <BaseHandle id={id} type="source" position={Position.Right} />
      </div>
    </div>
  );
};
