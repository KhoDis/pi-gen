/**
 * NodeParameter Component for the Pi-Gen project
 *
 * This component provides a standardized way to display parameters
 * without an input handle, for use in provider nodes that don't accept inputs.
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface NodeParameterProps {
  /** Label for the parameter */
  label: string;
  /** Content to render in the parameter */
  children: React.ReactNode;
  /** Additional className for the container */
  className?: string;
}

/**
 * NodeParameter component
 *
 * This component creates a parameter without an input handle.
 * It's designed for parameters in provider nodes that don't accept inputs.
 */
export const NodeParameter: React.FC<NodeParameterProps> = ({
  label,
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col w-full py-1 px-4", className)}>
      <div className="flex items-center w-full">
        {/* Content area */}
        <div className="flex-1 flex flex-col">
          <span className="text-sm font-medium">{label}</span>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
};
