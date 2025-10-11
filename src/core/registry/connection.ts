import { nodeRegistry } from "@/core/registry/NodeRegistry";
import type { Node } from "@/core/types/nodes";

export function getPortTypeForNode(
  nodes: Node[],
  nodeId: string,
  handleId: string,
  handleType: "source" | "target",
): string | undefined {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) return undefined;
  const def = nodeRegistry.get(node.type);
  if (!def) return undefined;
  const ports = handleType === "source" ? def.outputs : def.inputs;
  return ports.find((p) => p.id === handleId)?.type;
}

export function arePortsCompatible(
  nodes: Node[],
  sourceId: string,
  sourceHandle: string,
  targetId: string,
  targetHandle: string,
): boolean {
  if (!sourceId || !targetId || !sourceHandle || !targetHandle) return true;
  if (sourceId === targetId) return false;

  const sourceType = getPortTypeForNode(
    nodes,
    sourceId,
    sourceHandle,
    "source",
  );
  const targetType = getPortTypeForNode(
    nodes,
    targetId,
    targetHandle,
    "target",
  );

  if (!sourceType || !targetType) return true;
  return sourceType === targetType;
}
