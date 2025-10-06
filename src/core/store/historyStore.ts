/**
 * History Store for the Pi-Gen project
 *
 * This file defines a history store for undo/redo functionality using Zustand.
 */

import { create } from "zustand";
import { useGraphStore } from "./graphStore";
import { Node, Edge, NodeId, Position, NodeParams } from "../types/nodes";

/**
 * Command interface for the command pattern
 */
export interface Command {
  execute: () => void;
  undo: () => void;
  description: string;
}

/**
 * Interface for the history state
 */
interface HistoryState {
  // State
  past: Command[];
  future: Command[];

  // Operations
  execute: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;

  // Utility
  canUndo: () => boolean;
  canRedo: () => boolean;
  getLastCommand: () => Command | undefined;
}

/**
 * Create the history store
 */
export const useHistoryStore = create<HistoryState>((set, get) => ({
  // Initial state
  past: [],
  future: [],

  // Operations
  execute: (command) => {
    command.execute();
    set((state) => ({
      past: [...state.past, command],
      future: [],
    }));
  },

  undo: () => {
    const { past } = get();
    if (past.length === 0) return;

    const command = past[past.length - 1];
    command.undo();

    set((state) => ({
      past: state.past.slice(0, -1),
      future: [command, ...state.future],
    }));
  },

  redo: () => {
    const { future } = get();
    if (future.length === 0) return;

    const command = future[0];
    command.execute();

    set((state) => ({
      past: [...state.past, command],
      future: state.future.slice(1),
    }));
  },

  clear: () => {
    set({ past: [], future: [] });
  },

  // Utility
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  getLastCommand: () => {
    const { past } = get();
    return past.length > 0 ? past[past.length - 1] : undefined;
  },
}));

/**
 * Command factory functions
 */

/**
 * Create a command to add a node
 */
export function createAddNodeCommand<P extends NodeParams>(
  type: string,
  position: Position,
  params?: Partial<P>,
): Command {
  let nodeId: NodeId | null = null;

  return {
    execute: () => {
      const node = useGraphStore.getState().addNode(type, position, params);
      nodeId = node.id;
    },
    undo: () => {
      if (nodeId) {
        useGraphStore.getState().removeNode(nodeId);
      }
    },
    description: `Add ${type} node`,
  };
}

/**
 * Create a command to remove a node
 */
export function createRemoveNodeCommand(id: NodeId): Command {
  let node: Node | undefined;
  let connectedEdges: Edge[] = [];

  return {
    execute: () => {
      const state = useGraphStore.getState();
      node = state.getNode(id);
      connectedEdges = state.edges.filter(
        (edge) => edge.source === id || edge.target === id,
      );
      state.removeNode(id);
    },
    undo: () => {
      if (node) {
        const state = useGraphStore.getState();
        // Add the node back
        const newNode = state.addNode(
          node.type,
          node.position,
          node.data.params,
        );

        // Add the edges back
        for (const edge of connectedEdges) {
          if (edge.source === id) {
            state.addEdge(
              newNode.id,
              edge.sourceHandle,
              edge.target,
              edge.targetHandle,
            );
          } else if (edge.target === id) {
            state.addEdge(
              edge.source,
              edge.sourceHandle,
              newNode.id,
              edge.targetHandle,
            );
          }
        }
      }
    },
    description: `Remove node`,
  };
}

/**
 * Create a command to update node parameters
 */
export function createUpdateNodeParamsCommand<P extends NodeParams>(
  id: NodeId,
  params: Partial<P>,
): Command {
  const previousParams: Partial<P> = {};

  return {
    execute: () => {
      const state = useGraphStore.getState();
      const node = state.getNode<P>(id);
      if (node) {
        // Save previous values for the parameters being updated
        for (const key in params) {
          if (key in node.data.params) {
            previousParams[key as keyof P] = node.data.params[
              key as keyof P
            ] as P[keyof P];
          }
        }
      }
      state.updateNodeParams(id, params);
    },
    undo: () => {
      useGraphStore.getState().updateNodeParams(id, previousParams);
    },
    description: `Update node parameters`,
  };
}

/**
 * Create a command to add an edge
 */
export function createAddEdgeCommand(
  source: NodeId,
  sourceHandle: string,
  target: NodeId,
  targetHandle: string,
): Command {
  let edgeId: string | null = null;

  return {
    execute: () => {
      const edge = useGraphStore
        .getState()
        .addEdge(source, sourceHandle, target, targetHandle);
      if (edge) {
        edgeId = edge.id;
      }
    },
    undo: () => {
      if (edgeId) {
        useGraphStore.getState().removeEdge(edgeId);
      }
    },
    description: `Add connection`,
  };
}

/**
 * Create a command to remove an edge
 */
export function createRemoveEdgeCommand(id: string): Command {
  let edge: Edge | undefined;

  return {
    execute: () => {
      const state = useGraphStore.getState();
      edge = state.getEdge(id);
      state.removeEdge(id);
    },
    undo: () => {
      if (edge) {
        useGraphStore
          .getState()
          .addEdge(
            edge.source,
            edge.sourceHandle,
            edge.target,
            edge.targetHandle,
          );
      }
    },
    description: `Remove connection`,
  };
}

/**
 * Create a command to update node position
 */
export function createUpdateNodePositionCommand(
  id: NodeId,
  position: Position,
): Command {
  let previousPosition: Position | undefined;

  return {
    execute: () => {
      const state = useGraphStore.getState();
      const node = state.getNode(id);
      if (node) {
        previousPosition = node.position;
      }
      state.updateNodePosition(id, position);
    },
    undo: () => {
      if (previousPosition) {
        useGraphStore.getState().updateNodePosition(id, previousPosition);
      }
    },
    description: `Move node`,
  };
}
