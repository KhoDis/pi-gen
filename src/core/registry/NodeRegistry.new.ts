/**
 * Node Registry for the Pi-Gen project
 *
 * This file implements a type-safe registry for node types.
 */

import {
  NodeType,
  NodeTypeEntry,
  NodeComponentProps,
} from "../types/nodes.new";
import { ValueTypeMap } from "../types/values.new";

/**
 * NodeRegistry class for managing node types with type safety
 */
export class NodeRegistry {
  private nodeTypes = new Map<
    string,
    NodeType<
      Record<string, keyof ValueTypeMap>,
      Record<string, keyof ValueTypeMap>,
      Record<string, keyof ValueTypeMap>
    >
  >();

  // Type assertion for internal storage flexibility
  private unsafeSetNodeType<
    I extends Record<string, keyof ValueTypeMap>,
    O extends Record<string, keyof ValueTypeMap>,
    P extends Record<string, keyof ValueTypeMap>,
  >(type: string, nodeType: NodeType<I, O, P>) {
    this.nodeTypes.set(
      type,
      nodeType as unknown as NodeType<
        Record<string, keyof ValueTypeMap>,
        Record<string, keyof ValueTypeMap>,
        Record<string, keyof ValueTypeMap>
      >,
    );
  }

  /**
   * Register a node type with proper typing
   */
  register<
    I extends Record<string, keyof ValueTypeMap>,
    O extends Record<string, keyof ValueTypeMap>,
    P extends Record<string, keyof ValueTypeMap>,
  >(nodeType: NodeType<I, O, P>): void {
    if (this.nodeTypes.has(nodeType.type)) {
      console.warn(
        `Node type '${nodeType.type}' is already registered. Overwriting.`,
      );
    }
    this.unsafeSetNodeType(nodeType.type, nodeType);
  }

  /**
   * Get a node type by its identifier with proper typing
   */
  get<
    I extends Record<string, keyof ValueTypeMap>,
    O extends Record<string, keyof ValueTypeMap>,
    P extends Record<string, keyof ValueTypeMap>,
  >(type: string): NodeType<I, O, P> | undefined {
    return this.nodeTypes.get(type) as NodeType<I, O, P> | undefined;
  }

  /**
   * Get all registered node types
   */
  getAll(): NodeTypeEntry[] {
    return Array.from(this.nodeTypes.values()).map((nodeType) => ({
      type: nodeType.type,
      label: nodeType.label,
      category: nodeType.category,
      description: nodeType.description,
    }));
  }

  /**
   * Get node types grouped by category
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
   */
  getComponentTypes(): Record<
    string,
    React.ComponentType<NodeComponentProps<Record<string, keyof ValueTypeMap>>>
  > {
    const result: Record<
      string,
      React.ComponentType<
        NodeComponentProps<Record<string, keyof ValueTypeMap>>
      >
    > = {};

    this.nodeTypes.forEach((nodeType, type) => {
      result[type] = nodeType.component;
    });

    return result;
  }
}

/**
 * Singleton instance of NodeRegistry
 */
export const nodeRegistry = new NodeRegistry();
