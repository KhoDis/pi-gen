/**
 * Graph Store for the Pi-Gen project
 *
 * This file defines the central state store for the application using Zustand.
 */

import { create } from "zustand";
import { nanoid } from "nanoid";
import {
  Node,
  Edge,
  NodeId,
  Position,
  NodeParams,
  NodeData,
  HandleType,
} from "../types/nodes";
import { nodeRegistry } from "../registry/NodeRegistry";

/**
 * Interface for the graph state
 */
interface GraphState {
  // State
  nodes: Node[];
  edges: Edge[];
  selectedNodeIds: NodeId[];

  // Node operations
  addNode: <P extends NodeParams>(
    type: string,
    position: Position,
    params?: Partial<P>,
  ) => Node<P>;
  updateNodePosition: (id: NodeId, position: Position) => void;
  updateNodeParams: <P extends NodeParams>(
    id: NodeId,
    params: Partial<P>,
  ) => void;
  removeNode: (id: NodeId) => void;

  // Edge operations
  addEdge: (
    source: NodeId,
    sourceHandle: string,
    target: NodeId,
    targetHandle: string,
  ) => Edge | null;
  removeEdge: (id: string) => void;
  removeEdgesForHandle: (
    nodeId: NodeId,
    handleId: string,
    handleType: HandleType,
  ) => void;

  // Selection operations
  selectNode: (id: NodeId) => void;
  deselectNode: (id: NodeId) => void;
  clearSelection: () => void;

  // Utility operations
  getNode: <P extends NodeParams = NodeParams>(
    id: NodeId,
  ) => Node<P> | undefined;
  getEdge: (id: string) => Edge | undefined;
}

/**
 * Create the graph store
 */
export const useGraphStore = create<GraphState>((set, get) => ({
  // Initial state
  nodes: [],
  edges: [],
  selectedNodeIds: [],

  // Node operations
  addNode: <P extends NodeParams>(
    type: string,
    position: Position,
    params?: Partial<P>,
  ) => {
    const nodeType = nodeRegistry.get<P>(type);
    if (!nodeType) {
      throw new Error(`Unknown node type: ${type}`);
    }

    const defaultParams = nodeType.defaultParams;
    const mergedParams = { ...defaultParams, ...params } as P;

    const newNode: Node<P> = {
      id: nanoid(),
      type,
      position,
      data: {
        params: mergedParams,
      } as NodeData<P>,
    };

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));

    return newNode;
  },

  updateNodePosition: (id, position) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, position } : node,
      ),
    }));
  },

  updateNodeParams: <P extends NodeParams>(id: NodeId, params: Partial<P>) => {
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              params: {
                ...node.data.params,
                ...params,
              },
            },
          };
        }
        return node;
      }),
    }));
  },

  removeNode: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id,
      ),
      selectedNodeIds: state.selectedNodeIds.filter((nodeId) => nodeId !== id),
    }));
  },

  // Edge operations
  addEdge: (source, sourceHandle, target, targetHandle) => {
    // Prevent connecting a node to itself
    if (source === target) {
      return null;
    }

    // Prevent duplicate connections
    const isDuplicate = get().edges.some(
      (edge) =>
        edge.source === source &&
        edge.target === target &&
        edge.sourceHandle === sourceHandle &&
        edge.targetHandle === targetHandle,
    );

    if (isDuplicate) {
      return null;
    }

    // Prevent multiple connections to the same target handle
    const existingTargetConnection = get().edges.find(
      (edge) => edge.target === target && edge.targetHandle === targetHandle,
    );

    if (existingTargetConnection) {
      // Remove the existing connection to the target handle
      get().removeEdge(existingTargetConnection.id);
    }

    // Create the new edge
    const newEdge: Edge = {
      id: `${source}-${sourceHandle}-${target}-${targetHandle}`,
      source,
      sourceHandle,
      target,
      targetHandle,
      type: "removable",
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));

    return newEdge;
  },

  removeEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));
  },

  // Remove edges connected to a specific node handle
  removeEdgesForHandle: (
    nodeId: NodeId,
    handleId: string,
    handleType: "source" | "target",
  ) => {
    set((state) => ({
      edges: state.edges.filter((edge) => {
        if (handleType === "source") {
          return !(edge.source === nodeId && edge.sourceHandle === handleId);
        } else {
          return !(edge.target === nodeId && edge.targetHandle === handleId);
        }
      }),
    }));
  },

  // Selection operations
  selectNode: (id) => {
    set((state) => ({
      selectedNodeIds: state.selectedNodeIds.includes(id)
        ? state.selectedNodeIds
        : [...state.selectedNodeIds, id],
    }));
  },

  deselectNode: (id) => {
    set((state) => ({
      selectedNodeIds: state.selectedNodeIds.filter((nodeId) => nodeId !== id),
    }));
  },

  clearSelection: () => {
    set({ selectedNodeIds: [] });
  },

  // Utility operations
  getNode: <P extends NodeParams = NodeParams>(id: NodeId) => {
    return get().nodes.find((node) => node.id === id) as Node<P> | undefined;
  },

  getEdge: (id: string) => {
    return get().edges.find((edge) => edge.id === id);
  },
}));
