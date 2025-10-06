/**
 * ProviderNumberParameter Component for the Pi-Gen project
 *
 * This component provides a specialized parameter for number values
 * without an input handle, for use in provider nodes.
 */

import React from "react";
import { Slider } from "./slider";
import { Input } from "./input";
import { NodeParameter } from "./node-parameter";

export interface ProviderNumberParameterProps {
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
  /** Input size (default: 'medium') */
  inputSize?: "small" | "medium" | "large";
}

/**
 * ProviderNumberParameter component
 *
 * This component creates a specialized parameter for number values
 * without an input handle, for use in provider nodes.
 */
export const ProviderNumberParameter: React.FC<
  ProviderNumberParameterProps
> = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showSlider = true,
  showInput = true,
  className,
  inputSize = "medium",
}) => {
  // Determine input width based on size
  const inputWidthClass = {
    small: "w-12",
    medium: "w-16",
    large: "w-20",
  }[inputSize];

  return (
    <NodeParameter label={label} className={className}>
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
            step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`${inputWidthClass} h-8`}
          />
        )}
      </div>
    </NodeParameter>
  );
};
