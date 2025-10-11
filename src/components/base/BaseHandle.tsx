import { forwardRef } from "react";
import type { CSSProperties } from "react";
import { Handle, type HandleProps } from "@xyflow/react";

import { cn } from "@/lib/utils";

export type BaseHandleProps = HandleProps & {
  /** Visual variant based on value type (e.g., "layer", "color", "number", "option", etc.) */
  variant?: string;
};

export const BaseHandle = forwardRef<HTMLDivElement, BaseHandleProps>(
  ({ className, children, variant, style, ...props }, ref) => {
    const {
      bg,
      border,
      radius,
    }: { bg: string; border: string; radius: number } = (() => {
      switch (variant) {
        case "layer":
          return { bg: "#60a5fa", border: "#3b82f6", radius: 2 }; // blue-400/blue-500
        case "color":
          return { bg: "#f472b6", border: "#ec4899", radius: 9999 }; // pink-400/pink-500
        case "number":
          return { bg: "#f59e0b", border: "#d97706", radius: 9999 }; // amber-500/amber-600
        case "boolean":
          return { bg: "#34d399", border: "#10b981", radius: 9999 }; // emerald-400/500
        case "string":
          return { bg: "#94a3b8", border: "#64748b", radius: 9999 }; // slate-400/500
        case "vector2":
          return { bg: "#22d3ee", border: "#06b6d4", radius: 3 }; // cyan-400/500
        case "option":
          return { bg: "#a78bfa", border: "#8b5cf6", radius: 9999 }; // violet-400/500
        default:
          return { bg: "#e2e8f0", border: "#cbd5e1", radius: 9999 }; // slate-200/300
      }
    })();

    const inlineStyle: CSSProperties = {
      width: 11,
      height: 11,
      borderRadius: radius,
      backgroundColor: bg,
      borderColor: border,
      ...(style || {}),
    };

    return (
      <Handle
        ref={ref}
        className={cn("transition", className)}
        style={inlineStyle}
        {...props}
      >
        {children}
      </Handle>
    );
  },
);

BaseHandle.displayName = "BaseHandle";
