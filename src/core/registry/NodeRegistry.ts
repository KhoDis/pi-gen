/**
 * Node Registry for the Pi-Gen project
 *
 * This file defines a registry for node types, allowing for dynamic registration
 * and retrieval of node types.
 */

import { NodeParams, NodeType, NodeId, NodeData } from "../types/nodes";
import React from "react";

/**
 * Base interface for node registry entries
 */
export interface NodeTypeEntry {
  type: string;
  label: string;
  category: string;
  description: string;
  component: React.ComponentType<NodeComponentProps>;
}

/**
 * Props for node components
 */
export interface NodeComponentProps {
  id: NodeId;
  data: NodeData;
  selected: boolean;
}

/**
 * NodeRegistry class for managing node types
 */
class NodeRegistry {
  /**
   * Map of node types by type identifier
   */
  private nodeTypes = new Map<string, NodeType>();

  /**
   * Register a node type
   * @param nodeType The node type to register
   */
  register<P extends NodeParams>(nodeType: NodeType<P>): void {
    if (this.nodeTypes.has(nodeType.type)) {
      console.warn(
        `Node type '${nodeType.type}' is already registered. It will be overwritten.`,
      );
    }

    // Type assertion is necessary here due to the generic constraints
    this.nodeTypes.set(nodeType.type, nodeType as unknown as NodeType);
  }

  /**
   * Get a node type by its identifier with proper typing
   * @param type The node type identifier
   * @returns The node type or undefined if not found
   */
  get<P extends NodeParams = NodeParams>(
    type: string,
  ): NodeType<P> | undefined {
    const nodeType = this.nodeTypes.get(type);
    if (!nodeType) return undefined;

    // Type assertion is necessary here due to the generic constraints
    return nodeType as unknown as NodeType<P>;
  }

  /**
   * Get all registered node types
   * @returns Array of all node types
   */
  getAll(): NodeTypeEntry[] {
    return Array.from(this.nodeTypes.values()).map((nodeType) => ({
      type: nodeType.type,
      label: nodeType.label,
      category: nodeType.category,
      description: nodeType.description,
      component: nodeType.component as React.ComponentType<NodeComponentProps>,
    }));
  }

  /**
   * Get node types grouped by category
   * @returns Record of node types by category
   */
  getByCategory(): Record<string, NodeTypeEntry[]> {
    const result: Record<string, NodeTypeEntry[]> = {};

    this.getAll().forEach((nodeType) => {
      if (!result[nodeType.category]) {
        result[nodeType.category] = [];
      }
      result[nodeType.category].push(nodeType);
    });

    return result;
  }

  /**
   * Get component types for ReactFlow
   * @returns Record of component types by node type
   */
  getComponentTypes(): Record<string, React.ComponentType<NodeComponentProps>> {
    const result: Record<string, React.ComponentType<NodeComponentProps>> = {};

    this.nodeTypes.forEach((nodeType, type) => {
      // Type assertion is necessary here due to the generic constraints
      result[type] =
        nodeType.component as unknown as React.ComponentType<NodeComponentProps>;
    });

    return result;
  }
}

/**
 * Singleton instance of NodeRegistry
 */
export const nodeRegistry = new NodeRegistry();
