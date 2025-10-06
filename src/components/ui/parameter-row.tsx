/**
 * Parameter Row Component for the Pi-Gen project
 *
 * This component provides a standardized way to display parameter controls
 * with properly positioned handles at the edges of the node.
 */

import React from "react";
import { Position } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { BaseHandle, type BaseHandleProps } from "@/components/base-handle";

export interface ParameterRowProps {
  /** Optional label for the parameter */
  label?: string;
  /** Props for the left handle (omit position as it's always Position.Left) */
  leftHandleProps?: Omit<BaseHandleProps, "position"> & { id: string };
  /** Props for the right handle (omit position as it's always Position.Right) */
  rightHandleProps?: Omit<BaseHandleProps, "position"> & { id: string };
  /** Content to render in the parameter row */
  children: React.ReactNode;
  /** Additional className for the row container */
  className?: string;
}

/**
 * ParameterRow component
 *
 * This component creates a parameter row with fixed-width slots for handles
 * on both sides, ensuring consistent control positioning regardless of whether
 * handles are present.
 */
export const ParameterRow: React.FC<ParameterRowProps> = ({
  leftHandleProps,
  rightHandleProps,
  children,
  className = "",
}) => {
  return (
    <div className={cn("flex flex-col w-full", className)}>
      {/* Main row with handle slots */}
      <div className="flex items-center w-full">
        {/* Left handle slot - fixed width */}
        <div className="w-4 flex justify-start items-center relative">
          {leftHandleProps && (
            <BaseHandle position={Position.Left} {...leftHandleProps} />
          )}
        </div>

        {/* Content area - takes remaining space */}
        <div className="flex-1">{children}</div>

        {/* Right handle slot - fixed width */}
        <div className="w-4 flex justify-end items-center relative">
          {rightHandleProps && (
            <BaseHandle position={Position.Right} {...rightHandleProps} />
          )}
        </div>
      </div>
    </div>
  );
};
