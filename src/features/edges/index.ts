import type { EdgeTypes } from "@xyflow/react";
import { RemovableEdge } from "@/features/edges/RemovableEdge";

// Custom edge types
export const edgeTypes = {
  removable: RemovableEdge,
} satisfies EdgeTypes;
