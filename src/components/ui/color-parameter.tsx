/**
 * ColorParameter Component for the Pi-Gen project
 *
 * This component provides a specialized input parameter for color values
 * with a color picker.
 */

import React from "react";
import { RGBA } from "@/core/models";
import { ColorPicker } from "./color-picker";
import { NodeInput } from "./node-input";

export interface ColorParameterProps {
  /** ID for the input handle */
  id: string;
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
 * ColorParameter component
 *
 * This component creates a specialized input parameter for color values
 * with a color picker.
 */
export const ColorParameter: React.FC<ColorParameterProps> = ({
  id,
  label,
  value,
  onChange,
  className,
}) => {
  return (
    <NodeInput id={id} label={label} className={className}>
      <ColorPicker value={value} onChange={onChange} />
    </NodeInput>
  );
};
