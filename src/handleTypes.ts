import { ConnectionType } from "@/nodes/types.ts";

export const HANDLE_TYPES: Record<
  ConnectionType,
  {
    color: string;
    label: string;
  }
> = {
  layer: { color: "#4ade80", label: "Layer" },
  color: { color: "#f472b6", label: "Color" },
  number: { color: "#60a5fa", label: "Number" },
  option: { color: "#a78bfa", label: "Option" },
};
