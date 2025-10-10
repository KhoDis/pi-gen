/**
 * ProviderNumberParameter Component for the Pi-Gen project
 *
 * This component provides a specialized parameter for number values
 * without an input handle, for use in provider nodes.
 */

import React from "react";
import { Input } from "./input";
import { NodeParameter } from "./node-parameter";

export interface ProviderNumberParameterProps {
  /** Label for the parameter */
  label: string;
  /** Current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Whether to show the input field (default: true) */
  showInput?: boolean;
  /** Additional className for the container */
  className?: string;
}

/**
 * ProviderNumberParameter component
 *
 * This component creates a specialized parameter for number values
 * without an input handle, for use in provider nodes.
 */
export const ProviderNumberParameter: React.FC<
  ProviderNumberParameterProps
> = ({ label, value, onChange, showInput = true, className }) => {
  return (
    <NodeParameter label={label} className={className}>
      <div className="flex items-center gap-2">
        {showInput && (
          <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className={`w-full h-8`}
          />
        )}
      </div>
    </NodeParameter>
  );
};
