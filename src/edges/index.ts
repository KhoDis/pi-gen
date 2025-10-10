import type { EdgeTypes } from "@xyflow/react";
import { RemovableEdge } from "@/components/removable-edge";

// Custom edge types
export const edgeTypes = {
  removable: RemovableEdge,
} satisfies EdgeTypes;
