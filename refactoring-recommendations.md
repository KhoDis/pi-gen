# Refactoring Recommendations for Pi-Gen

This document outlines specific refactoring recommendations for the Pi-Gen project, focusing on addressing the architectural issues identified in the analysis.

## 1. Type System Refactoring

### Current Issues:

- Overly complex conditional types
- Type casting and assertions
- Lack of proper type guards

### Recommendations:

1. **Replace the current TypedValue with proper interfaces:**

```typescript
// BEFORE
export type TypedValue<T extends HandleType = HandleType> = {
  type: T;
  value: HandleValueType<T>;
};

type HandleValueType<T extends HandleType> = T extends "number"
  ? number
  : T extends "color"
    ? RGBA
    : T extends "layer"
      ? Layer
      : never;

// AFTER
export interface Value {
  readonly type: string;
}

export interface NumberValue extends Value {
  readonly type: "number";
  readonly value: number;
}

export interface ColorValue extends Value {
  readonly type: "color";
  readonly value: RGBA;
}

export interface LayerValue extends Value {
  readonly type: "layer";
  readonly value: Layer;
}

export type ValueType = NumberValue | ColorValue | LayerValue;
```

2. **Add proper type guards:**

```typescript
export const isNumberValue = (value: Value): value is NumberValue =>
  value.type === "number";

export const isColorValue = (value: Value): value is ColorValue =>
  value.type === "color";

export const isLayerValue = (value: Value): value is LayerValue =>
  value.type === "layer";
```

3. **Add value creation functions:**

```typescript
export const createNumberValue = (value: number): NumberValue => ({
  type: "number",
  value,
});

export const createColorValue = (
  r: number,
  g: number,
  b: number,
  a: number,
): ColorValue => ({
  type: "color",
  value: { r, g, b, a },
});

export const createLayerValue = (layer: Layer): LayerValue => ({
  type: "layer",
  value: layer,
});
```

## 2. Node System Refactoring

### Current Issues:

- Tight coupling between node UI and logic
- Hard-coded node types
- Inconsistent node structure

### Recommendations:

1. **Create a node registry:**

```typescript
class NodeRegistry {
  private nodeTypes: Map<string, NodeType<any, any, any>> = new Map();

  register<
    P extends NodeParams,
    I extends Record<string, Value>,
    O extends Record<string, Value>,
  >(nodeType: NodeType<P, I, O>): void {
    this.nodeTypes.set(nodeType.type, nodeType);
  }

  get(type: string): NodeType<any, any, any> | undefined {
    return this.nodeTypes.get(type);
  }

  getAll(): NodeType<any, any, any>[] {
    return Array.from(this.nodeTypes.values());
  }
}

export const nodeRegistry = new NodeRegistry();
```

2. **Define a clear NodeType interface:**

```typescript
export interface NodeType<
  P extends NodeParams,
  I extends Record<string, Value>,
  O extends Record<string, Value>,
> {
  type: string;
  label: string;
  category: string;
  description: string;
  inputs: Port[];
  outputs: Port[];
  defaultParams: P;
  component: React.ComponentType<{
    id: NodeId;
    data: NodeData<P>;
    selected: boolean;
  }>;
  evaluate: (inputs: I, params: P) => O;
}
```

3. **Separate node UI from logic:**

```typescript
// BEFORE
export function CircleNode({ data, id }: NodeProps<CircleNode>) {
  // UI and logic mixed together
}

// AFTER
const CircleNodeComponent: React.FC<{
  id: NodeId;
  data: { params: CircleNodeParams };
  selected: boolean;
}> = ({ id, data }) => {
  // UI only
};

function evaluateCircleNode(
  inputs: CircleNodeInputs,
  params: CircleNodeParams,
): CircleNodeOutputs {
  // Logic only
}

// Register separately
nodeRegistry.register({
  type: "circle",
  component: CircleNodeComponent,
  evaluate: evaluateCircleNode,
  // ...other properties
});
```

## 3. Evaluation System Refactoring

### Current Issues:

- Inefficient recursive evaluation
- Poor error handling
- Manual cache management

### Recommendations:

1. **Implement topological sorting for evaluation:**

```typescript
class GraphEvaluator {
  // ...

  private sortNodesByDependency(): NodeId[] {
    const visited = new Set<NodeId>();
    const sorted: NodeId[] = [];

    const visit = (nodeId: NodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Get outgoing edges
      const outgoingEdges = this.edges.filter((e) => e.source === nodeId);

      // Visit dependencies first
      for (const edge of outgoingEdges) {
        visit(edge.target);
      }

      sorted.push(nodeId);
    };

    // Start with output nodes
    const outputNodes = this.nodes.filter((n) => n.type === "output");
    for (const node of outputNodes) {
      visit(node.id);
    }

    return sorted.reverse();
  }

  evaluateGraph(): Map<NodeId, Record<string, Value>> {
    this.clearCache();
    const sortedNodes = this.sortNodesByDependency();

    for (const nodeId of sortedNodes) {
      this.evaluateNode(nodeId);
    }

    return this.cache;
  }

  // ...
}
```

2. **Improve error handling:**

```typescript
class GraphEvaluator {
  // ...

  evaluateNode(nodeId: NodeId): Record<string, Value> {
    try {
      // Evaluation logic
    } catch (error) {
      // Enhance error with context
      const node = this.nodes.find((n) => n.id === nodeId);
      const enhancedError = new Error(
        `Error evaluating node ${nodeId} (${node?.type}): ${error.message}`,
      );
      enhancedError.stack = error.stack;
      throw enhancedError;
    }
  }

  // ...
}
```

3. **Implement selective re-evaluation:**

```typescript
class GraphEvaluator {
  private dirtyNodes: Set<NodeId> = new Set();

  markNodeDirty(nodeId: NodeId): void {
    this.dirtyNodes.add(nodeId);

    // Mark dependent nodes as dirty
    const dependentEdges = this.edges.filter((e) => e.source === nodeId);
    for (const edge of dependentEdges) {
      this.markNodeDirty(edge.target);
    }
  }

  evaluateGraph(): Map<NodeId, Record<string, Value>> {
    const sortedNodes = this.sortNodesByDependency();

    for (const nodeId of sortedNodes) {
      if (this.dirtyNodes.has(nodeId) || !this.cache.has(nodeId)) {
        this.evaluateNode(nodeId);
      }
    }

    this.dirtyNodes.clear();
    return this.cache;
  }

  // ...
}
```

## 4. State Management Refactoring

### Current Issues:

- Global event listeners
- Imperative updates
- No central state

### Recommendations:

1. **Implement a proper state store:**

```typescript
import create from "zustand";

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeIds: NodeId[];

  // Actions
  addNode: (type: string, position: Position) => Node;
  updateNodePosition: (id: NodeId, position: Position) => void;
  updateNodeParams: <P extends NodeParams>(
    id: NodeId,
    params: Partial<P>,
  ) => void;
  removeNode: (id: NodeId) => void;
  addEdge: (
    source: NodeId,
    sourceHandle: string,
    target: NodeId,
    targetHandle: string,
  ) => Edge;
  removeEdge: (id: string) => void;
  selectNode: (id: NodeId) => void;
  deselectNode: (id: NodeId) => void;
  clearSelection: () => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  // State and actions implementation
}));
```

2. **Replace direct DOM events with store subscriptions:**

```typescript
// BEFORE
window.addEventListener("graph-updated", handleUpdate);

// AFTER
useEffect(() => {
  const unsubscribe = useGraphStore.subscribe(
    (state) => [state.nodes, state.edges],
    () => {
      // Handle update
    },
    { equalityFn: shallow },
  );

  return unsubscribe;
}, []);
```

3. **Implement undo/redo with command pattern:**

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

interface HistoryState {
  past: Command[];
  future: Command[];

  execute: (command: Command) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

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
}));
```

## 5. UI Component Refactoring

### Current Issues:

- Inconsistent styling
- Duplicated code
- Poor separation of concerns

### Recommendations:

1. **Create a BaseNode component:**

```typescript
export const BaseNode: React.FC<{
  id: NodeId;
  type: string;
  selected: boolean;
  children: React.ReactNode;
}> = ({ id, type, selected, children }) => {
  const nodeType = nodeRegistry.get(type);

  if (!nodeType) {
    return (
      <div className="bg-red-100 p-2 rounded border border-red-500">
        <div className="text-red-500 font-bold">Unknown node type: {type}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded shadow-md border ${selected ? 'border-blue-500' : 'border-gray-200'}`}>
      <div className="bg-blue-500 text-white text-sm font-medium p-2 rounded-t">
        {nodeType.label}
      </div>
      <div className="p-3">
        {children}
      </div>
    </div>
  );
};
```

2. **Create reusable UI components:**

```typescript
export const NodeInput: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1">{label}</label>
    {children}
  </div>
);

export const NodeSlider: React.FC<{
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}> = ({ value, min, max, onChange }) => (
  <div className="flex items-center gap-2">
    <Slider
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className="flex-1"
    />
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="w-16 p-1 border rounded"
    />
  </div>
);
```

3. **Implement port handles as a separate component:**

```typescript
export const PortHandle: React.FC<{
  id: string;
  type: string;
  position: 'left' | 'right';
  label: string;
}> = ({ id, type, position, label }) => {
  const getHandleColor = (type: string): string => {
    switch (type) {
      case 'number': return '#60a5fa';
      case 'color': return '#f472b6';
      case 'layer': return '#4ade80';
      default: return '#94a3b8';
    }
  };

  return (
    <div className={`absolute ${position === 'left' ? 'left-0' : 'right-0'} flex items-center`}>
      <Handle
        type={position === 'left' ? 'target' : 'source'}
        position={position === 'left' ? Position.Left : Position.Right}
        id={id}
        style={{ background: getHandleColor(type) }}
      />
      <span className="text-xs ml-1 mr-1">{label}</span>
    </div>
  );
};
```

## 6. Project Structure Refactoring

### Current Issues:

- Inconsistent file structure
- No clear separation of concerns
- Duplicate code

### Recommendations:

1. **Reorganize project structure:**

```
/src
  /components          # UI components
    /ui                # Generic UI components
    /nodes             # Node UI components
    /handles           # Handle components
    /canvas            # Canvas components
  /core                # Core domain models
    /models            # Domain models (Layer, etc.)
    /types             # Type definitions
    /registry          # Node registry
  /engine              # Evaluation engine
    /evaluator.ts      # Graph evaluator
    /commands.ts       # Command pattern implementation
  /store               # State management
    /graphStore.ts     # Graph state
    /historyStore.ts   # Undo/redo history
  /nodes               # Node definitions
    /circle            # Circle node
      /component.tsx   # UI component
      /evaluator.ts    # Evaluation logic
      /index.ts        # Registration
    /output            # Output node
      /component.tsx   # UI component
      /evaluator.ts    # Evaluation logic
      /index.ts        # Registration
  /utils               # Utility functions
  /hooks               # Custom hooks
  /constants           # Constants and configuration
```

2. **Create index files for better imports:**

```typescript
// src/components/index.ts
export * from "./ui/Button";
export * from "./ui/Slider";
export * from "./nodes/BaseNode";
export * from "./handles/PortHandle";

// src/core/types/index.ts
export * from "./nodes";
export * from "./values";
export * from "./common";

// src/nodes/index.ts
import "./circle";
import "./rectangle";
import "./output";
// This file just imports all node definitions to register them
```

3. **Create a node factory:**

```typescript
// src/core/registry/nodeFactory.ts
import { NodeType, NodeParams, Node, NodeId, Position } from "../types";
import { nodeRegistry } from "./nodeRegistry";
import { nanoid } from "nanoid";

export function createNode<P extends NodeParams>(
  type: string,
  position: Position,
  params?: Partial<P>,
): Node<P> {
  const nodeType = nodeRegistry.get(type);
  if (!nodeType) {
    throw new Error(`Unknown node type: ${type}`);
  }

  return {
    id: nanoid(),
    type,
    position,
    data: {
      params: {
        ...nodeType.defaultParams,
        ...params,
      } as P,
    },
  };
}
```

## 7. Performance Optimizations

### Current Issues:

- Inefficient evaluation
- Unnecessary re-renders
- No memoization

### Recommendations:

1. **Memoize expensive calculations:**

```typescript
import { useMemo } from "react";

// In components
const nodeOutputs = useMemo(() => {
  try {
    return evaluator.evaluate(id);
  } catch (error) {
    console.error(error);
    return null;
  }
}, [id, evaluator]);
```

2. **Use React.memo for components:**

```typescript
export const CircleNodeComponent = React.memo(({ id, data, selected }) => {
  // Component implementation
});
```

3. **Implement selective re-rendering:**

```typescript
// Custom hook for node data
function useNodeData<P extends NodeParams>(
  nodeId: NodeId,
): {
  params: P;
  updateParams: (params: Partial<P>) => void;
} {
  const params = useGraphStore(
    (state) => state.nodes.find((n) => n.id === nodeId)?.data.params as P,
    shallow,
  );

  const updateParams = useGraphStore((state) => state.updateNodeParams);

  return {
    params,
    updateParams: (newParams) => updateParams(nodeId, newParams),
  };
}
```

## 8. Error Handling Improvements

### Current Issues:

- Generic error messages
- No error boundaries
- Poor error reporting

### Recommendations:

1. **Implement error boundaries:**

```typescript
class NodeErrorBoundary extends React.Component<{
  nodeId: NodeId;
  children: React.ReactNode;
}> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`Error in node ${this.props.nodeId}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 p-3 rounded border border-red-500">
          <h3 className="text-red-700 font-bold">Error in node</h3>
          <p className="text-red-600 text-sm">{this.state.error?.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

2. **Enhance error messages:**

```typescript
function evaluateNode(nodeId: NodeId): Record<string, Value> {
  try {
    // Evaluation logic
  } catch (error) {
    throw new Error(`Error evaluating node ${nodeId}: ${error.message}`, {
      cause: error,
    });
  }
}
```

3. **Add validation:**

```typescript
function validateConnection(
  source: NodeId,
  sourceHandle: string,
  target: NodeId,
  targetHandle: string,
): boolean {
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);

  if (!sourceNode || !targetNode) {
    return false;
  }

  const sourceNodeType = nodeRegistry.get(sourceNode.type);
  const targetNodeType = nodeRegistry.get(targetNode.type);

  if (!sourceNodeType || !targetNodeType) {
    return false;
  }

  const sourceOutput = sourceNodeType.outputs.find(
    (o) => o.id === sourceHandle,
  );
  const targetInput = targetNodeType.inputs.find((i) => i.id === targetHandle);

  if (!sourceOutput || !targetInput) {
    return false;
  }

  return sourceOutput.type === targetInput.type;
}
```

## Implementation Priority

When implementing these refactoring recommendations, follow this priority order:

1. **Type System Refactoring**: This forms the foundation for all other improvements
2. **Node System Refactoring**: Establishes the core architecture
3. **State Management Refactoring**: Provides a solid base for UI interactions
4. **Evaluation System Refactoring**: Improves the core functionality
5. **UI Component Refactoring**: Enhances the user experience
6. **Project Structure Refactoring**: Makes the codebase more maintainable
7. **Performance Optimizations**: Improves application responsiveness
8. **Error Handling Improvements**: Makes the application more robust

By following these refactoring recommendations, the Pi-Gen project will become more maintainable, extensible, and performant, while providing a better developer and user experience.
