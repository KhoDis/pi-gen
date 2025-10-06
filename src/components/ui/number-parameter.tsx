/**
 * NumberParameter Component for the Pi-Gen project
 *
 * This component provides a specialized input parameter for number values
 * with a slider and/or input field.
 */

import React from "react";
import { Slider } from "./slider";
import { Input } from "./input";
import { NodeInput } from "./node-input";

export interface NumberParameterProps {
  /** ID for the input handle */
  id: string;
  /** Label for the parameter */
  label: string;
  /** Current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Minimum value (default: 0) */
  min?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Step value (default: 1) */
  step?: number;
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
  min = 0,
  max = 100,
  step = 1,
  showSlider = true,
  showInput = true,
  className,
}) => {
  return (
    <NodeInput id={id} label={label} className={className}>
      <div className="flex items-center gap-2">
        {showSlider && (
          <Slider
            min={min}
            max={max}
            step={step}
            value={[value]}
            onValueChange={(values) => onChange(values[0])}
            className="flex-1"
          />
        )}

        {showInput && (
          <Input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 h-8"
          />
        )}
      </div>
    </NodeInput>
  );
};
