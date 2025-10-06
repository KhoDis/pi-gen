/**
 * ProviderColorParameter Component for the Pi-Gen project
 *
 * This component provides a specialized parameter for color values
 * without an input handle, for use in provider nodes.
 */

import React from "react";
import { RGBA } from "@/core/models/Layer";
import { ColorPicker } from "./color-picker";
import { NodeParameter } from "./node-parameter";

export interface ProviderColorParameterProps {
  /** Label for the parameter */
  label: string;
  /** Current color value */
  value: RGBA;
  /** Callback when color changes */
  onChange: (value: RGBA) => void;
  /** Additional className for the container */
  className?: string;
}

/**
 * ProviderColorParameter component
 *
 * This component creates a specialized parameter for color values
 * without an input handle, for use in provider nodes.
 */
export const ProviderColorParameter: React.FC<ProviderColorParameterProps> = ({
  label,
  value,
  onChange,
  className,
}) => {
  return (
    <NodeParameter label={label} className={className}>
      <ColorPicker value={value} onChange={onChange} />
    </NodeParameter>
  );
};
