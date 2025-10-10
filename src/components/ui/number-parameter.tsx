/**
 * NumberParameter Component for the Pi-Gen project
 *
 * This component provides a specialized input parameter for number values
 * with a slider and/or input field.
 */

import React from "react";
import { Input } from "@/components/ui/input";
import { NodeInput } from "@/components/ui/node-input";

export interface NumberParameterProps {
  /** ID for the input handle */
  id: string;
  /** Label for the parameter */
  label: string;
  /** Current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Whether to show the slider (default: true) */
  showSlider?: boolean;
  /** Whether to show the input field (default: true) */
  showInput?: boolean;
  /** Additional className for the container */
  className?: string;
}

/**
 * NumberParameter component
 *
 * This component creates a specialized input parameter for number values
 * with a slider and/or input field.
 */
export const NumberParameter: React.FC<NumberParameterProps> = ({
  id,
  label,
  value,
  onChange,
  showInput = true,
  className,
}) => {
  return (
    <NodeInput id={id} label={label} className={className}>
      <div className="flex items-center gap-2 w-full">
        {showInput && (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full h-8"
          />
        )}
      </div>
    </NodeInput>
  );
};
