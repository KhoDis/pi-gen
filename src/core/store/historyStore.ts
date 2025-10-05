/**
 * History Store for the Pi-Gen project
 *
 * This file defines a history store for undo/redo functionality using the command pattern.
 */

import { create } from "zustand";

/**
 * Command interface for the command pattern
 */
export interface Command {
  /**
   * Execute the command
   */
  execute: () => void;

  /**
   * Undo the command
   */
  undo: () => void;

  /**
   * Get a description of the command
   */
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
      future: [], // Clear the future when a new command is executed
    }));
  },

  undo: () => {
    const { past } = get();

    if (past.length === 0) {
      return;
    }

    const command = past[past.length - 1];
    command.undo();

    set((state) => ({
      past: state.past.slice(0, -1),
      future: [command, ...state.future],
    }));
  },

  redo: () => {
    const { future } = get();

    if (future.length === 0) {
      return;
    }

    const command = future[0];
    command.execute();

    set((state) => ({
      past: [...state.past, command],
      future: state.future.slice(1),
    }));
  },

  clear: () => {
    set({
      past: [],
      future: [],
    });
  },

  // Utility
  canUndo: () => {
    return get().past.length > 0;
  },

  canRedo: () => {
    return get().future.length > 0;
  },

  getLastCommand: () => {
    const { past } = get();
    return past.length > 0 ? past[past.length - 1] : undefined;
  },
}));

/**
 * Command factory for adding a node
 */
export function createAddNodeCommand(
  execute: () => void,
  undo: () => void,
): Command {
  return {
    execute,
    undo,
    description: "Add Node",
  };
}

/**
 * Command factory for removing a node
 */
export function createRemoveNodeCommand(
  execute: () => void,
  undo: () => void,
): Command {
  return {
    execute,
    undo,
    description: "Remove Node",
  };
}

/**
 * Command factory for updating node parameters
 */
export function createUpdateNodeParamsCommand(
  execute: () => void,
  undo: () => void,
): Command {
  return {
    execute,
    undo,
    description: "Update Node Parameters",
  };
}

/**
 * Command factory for moving a node
 */
export function createMoveNodeCommand(
  execute: () => void,
  undo: () => void,
): Command {
  return {
    execute,
    undo,
    description: "Move Node",
  };
}

/**
 * Command factory for adding an edge
 */
export function createAddEdgeCommand(
  execute: () => void,
  undo: () => void,
): Command {
  return {
    execute,
    undo,
    description: "Add Connection",
  };
}

/**
 * Command factory for removing an edge
 */
export function createRemoveEdgeCommand(
  execute: () => void,
  undo: () => void,
): Command {
  return {
    execute,
    undo,
    description: "Remove Connection",
  };
}
