"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { Input } from "@/components/ui/input";
import { RGBA } from "@/core/models";

export function ColorPicker({
  value,
  onChange,
}: {
  value: RGBA;
  onChange: (color: RGBA) => void;
}) {
  const [open, setOpen] = useState(false);

  // Convert Pixel to hex string
  const toHex = ({ r, g, b }: RGBA) => {
    return `#${[r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")}`;
  };

  // Convert hex string to Pixel
  const fromHex = (hex: string): RGBA => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
          a: value.a, // Preserve alpha
        }
      : value;
  };

  const [hex, setHex] = useState(toHex(value));

  const handleChange = (newHex: string) => {
    setHex(newHex);
    onChange(fromHex(newHex));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-2">
          <div
            className="h-4 w-4 rounded border"
            style={{ backgroundColor: toHex(value) }}
          />
          <span>{toHex(value)}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-2">
        <HexColorPicker color={hex} onChange={handleChange} />
        <div className="flex items-center gap-2">
          <HexColorInput
            color={hex}
            onChange={handleChange}
            prefixed
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm">Alpha:</span>
          <Input
            type="number"
            min="0"
            max="1"
            step="0.1"
            value={value.a}
            onChange={(e) =>
              onChange({ ...value, a: parseFloat(e.target.value) })
            }
            className="w-20"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
