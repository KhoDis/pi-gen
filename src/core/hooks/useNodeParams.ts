/**
 * Hook for accessing node parameters with proper typing and default values
 *
 * This hook provides a clean, type-safe way to access node parameters while
 * maintaining a single source of truth for default values in the node registry.
 */

import { NodeData, NodeParams } from "@/core/types/nodes";
import { nodeRegistry } from "@/core/registry/NodeRegistry";

/**
 * Hook for accessing node parameters with proper typing and default values
 * @param nodeType The node type identifier
 * @param data The node data from props
 * @returns The node parameters with defaults applied
 */
export function useNodeParams<P extends NodeParams>(
  nodeType: string,
  data: NodeData,
): P {
  // Get node type from registry
  const nodeTypeInfo = nodeRegistry.get<P>(nodeType);
  if (!nodeTypeInfo) {
    throw new Error(`Node type ${nodeType} not found in registry`);
  }

  // Merge default params with actual params
  const params = { ...nodeTypeInfo.defaultParams, ...data.params } as P;
  return params;
}
