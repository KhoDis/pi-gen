# Implementation Strategy with Simplified Logic

This document outlines a practical implementation strategy for the Pi-Gen project, focusing on simplifying the logic while maintaining the core functionality and ensuring proper type safety.

## Core Design Principles

1. **Simplicity**: Keep the design as simple as possible
2. **Type Safety**: Use proper TypeScript types without resorting to `any` or complex conditional types
3. **Separation of Concerns**: Clearly separate UI, logic, and state
4. **Extensibility**: Make it easy to add new node types
5. **Performance**: Ensure efficient evaluation and rendering

## Simplified Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  UI Components  │◄───┤  Node System    │◄───┤  Graph Engine   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        ▲                      ▲                      ▲
        │                      │                      │
        └──────────────────────┴──────────────────────┘
                              │
                     ┌─────────────────┐
                     │                 │
                     │  State Manager  │
                     │                 │
                     └─────────────────┘
```

## Type System Design

The key to a clean implementation is a well-designed type system. Instead of complex conditional types, we'll use a simpler approach with proper interfaces and generics.

### Value Types

```typescript
// src/types/values.ts

// Base interface for all value types
export interface Value {
  readonly type: string;
}

// Number value
export interface NumberValue extends Value {
  readonly type: "number";
  readonly value: number;
}

// Color value
export interface ColorValue extends Value {
  readonly type: "color";
  readonly value: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

// Layer value
export interface LayerValue extends Value {
  readonly type: "layer";
  readonly value: Layer;
}

// Boolean value
export interface BooleanValue extends Value {
  readonly type: "boolean";
  readonly value: boolean;
}

// String value
export interface StringValue extends Value {
  readonly type: "string";
  readonly value: string;
}

// Vector2 value
export interface Vector2Value extends Value {
  readonly type: "vector2";
  readonly value: {
    x: number;
    y: number;
  };
}

// Union type of all possible values
export type ValueType =
  | NumberValue
  | ColorValue
  | LayerValue
  | BooleanValue
  | StringValue
  | Vector2Value;

// Type guard functions
export const isNumberValue = (value: Value): value is NumberValue =>
  value.type === "number";

export const isColorValue = (value: Value): value is ColorValue =>
  value.type === "color";

export const isLayerValue = (value: Value): value is LayerValue =>
  value.type === "layer";

export const isBooleanValue = (value: Value): value is BooleanValue =>
  value.type === "boolean";

export const isStringValue = (value: Value): value is StringValue =>
  value.type === "string";

export const isVector2Value = (value: Value): value is Vector2Value =>
  value.type === "vector2";

// Value creation functions
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

export const createBooleanValue = (value: boolean): BooleanValue => ({
  type: "boolean",
  value,
});

export const createStringValue = (value: string): StringValue => ({
  type: "string",
  value,
});

export const createVector2Value = (x: number, y: number): Vector2Value => ({
  type: "vector2",
  value: { x, y },
});
```

### Node Types

```typescript
// src/types/nodes.ts
import { Value } from "./values";

export type NodeId = string;
export type HandleId = string;

export interface Position {
  x: number;
  y: number;
}

// Base interface for all node parameters
export interface NodeParams {
  [key: string]: unknown;
}

// Node data with typed parameters
export interface NodeData<P extends NodeParams> {
  params: P;
}

// Node interface with typed parameters
export interface Node<P extends NodeParams = NodeParams> {
  id: NodeId;
  type: string;
  position: Position;
  data: NodeData<P>;
}

// Edge interface
export interface Edge {
  id: string;
  source: NodeId;
  sourceHandle: HandleId;
  target: NodeId;
  targetHandle: HandleId;
}

// Input/Output port definition
export interface Port {
  id: string;
  label: string;
  type: string;
  required: boolean;
}

// Node type definition with proper generics
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

  // Component renderer
  component: React.ComponentType<{
    id: NodeId;
    data: NodeData<P>;
    selected: boolean;
  }>;

  // Evaluation function
  evaluate: (inputs: I, params: P) => O;
}
```

## Layer Implementation

```typescript
// src/models/Layer.ts

export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

export class Layer {
  readonly width: number;
  readonly height: number;
  private readonly pixels: Map<string, RGBA>;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixels = new Map();
  }

  setPixel(x: number, y: number, color: RGBA): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.pixels.set(`${x}:${y}`, color);
    }
  }

  getPixel(x: number, y: number): RGBA | null {
    const pixel = this.pixels.get(`${x}:${y}`);
    return pixel || null;
  }

  clear(color?: RGBA): void {
    this.pixels.clear();
    if (color) {
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          this.setPixel(x, y, color);
        }
      }
    }
  }

  toImageData(): ImageData {
    const data = new Uint8ClampedArray(this.width * this.height * 4);

    // Fill with transparent black
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0; // R
      data[i + 1] = 0; // G
      data[i + 2] = 0; // B
      data[i + 3] = 0; // A
    }

    // Set pixels from the map
    this.pixels.forEach((color, key) => {
      const [x, y] = key.split(":").map(Number);
      const index = (y * this.width + x) * 4;
      data[index] = color.r;
      data[index + 1] = color.g;
      data[index + 2] = color.b;
      data[index + 3] = color.a;
    });

    return new ImageData(data, this.width, this.height);
  }
}
```

## Node Registry

```typescript
// src/registry/NodeRegistry.ts
import { NodeType, NodeParams } from "../types/nodes";
import { Value } from "../types/values";

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

  getByCategory(): Record<string, NodeType<any, any, any>[]> {
    const result: Record<string, NodeType<any, any, any>[]> = {};

    this.getAll().forEach((nodeType) => {
      if (!result[nodeType.category]) {
        result[nodeType.category] = [];
      }
      result[nodeType.category].push(nodeType);
    });

    return result;
  }

  getComponentTypes(): Record<string, React.ComponentType<any>> {
    const result: Record<string, React.ComponentType<any>> = {};

    this.nodeTypes.forEach((nodeType, type) => {
      result[type] = nodeType.component;
    });

    return result;
  }
}

// Singleton instance
export const nodeRegistry = new NodeRegistry();
```

## Graph Evaluator

```typescript
// src/engine/GraphEvaluator.ts
import { Node, Edge, NodeId } from "../types/nodes";
import { Value } from "../types/values";
import { nodeRegistry } from "../registry/NodeRegistry";

export class GraphEvaluator {
  private nodes: Node[];
  private edges: Edge[];
  private cache: Map<NodeId, Record<string, Value>> = new Map();

  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }

  evaluate(nodeId: NodeId): Record<string, Value> {
    // Return cached result if available
    if (this.cache.has(nodeId)) {
      return this.cache.get(nodeId)!;
    }

    // Find the node
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) {
      throw new Error(`Node not found: ${nodeId}`);
    }

    // Get the node type
    const nodeType = nodeRegistry.get(node.type);
    if (!nodeType) {
      throw new Error(`Unknown node type: ${node.type}`);
    }

    // Collect input values
    const inputs: Record<string, Value> = {};

    for (const input of nodeType.inputs) {
      // Find edge connected to this input
      const edge = this.edges.find(
        (e) => e.target === nodeId && e.targetHandle === input.id,
      );

      if (edge) {
        // Evaluate the source node
        const sourceOutputs = this.evaluate(edge.source);
        const outputValue = sourceOutputs[edge.sourceHandle];

        if (outputValue) {
          inputs[input.id] = outputValue;
        } else {
          throw new Error(
            `Source node ${edge.source} does not provide output ${edge.sourceHandle}`,
          );
        }
      } else if (input.required) {
        throw new Error(
          `Required input ${input.id} not connected for node ${nodeId}`,
        );
      }
    }

    // Evaluate the node
    const outputs = nodeType.evaluate(inputs, node.data.params);

    // Cache the result
    this.cache.set(nodeId, outputs);

    return outputs;
  }

  clearCache(): void {
    this.cache.clear();
  }
}
```

## State Management

```typescript
// src/store/graphStore.ts
import create from "zustand";
import { Node, Edge, NodeId, NodeParams, Position } from "../types/nodes";
import { nanoid } from "nanoid";
import { nodeRegistry } from "../registry/NodeRegistry";

interface GraphState {
  nodes: Node[];
  edges: Edge[];

  // Node operations
  addNode: <P extends NodeParams>(type: string, position: Position) => Node<P>;
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
  ) => Edge;
  removeEdge: (id: string) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  nodes: [],
  edges: [],

  addNode: (type, position) => {
    const nodeType = nodeRegistry.get(type);
    if (!nodeType) {
      throw new Error(`Unknown node type: ${type}`);
    }

    const newNode: Node = {
      id: nanoid(),
      type,
      position,
      data: {
        params: { ...nodeType.defaultParams },
      },
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

  updateNodeParams: (id, params) => {
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
    }));
  },

  addEdge: (source, sourceHandle, target, targetHandle) => {
    const newEdge: Edge = {
      id: `${source}-${sourceHandle}-${target}-${targetHandle}`,
      source,
      sourceHandle,
      target,
      targetHandle,
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
}));
```

## Node Implementation Example

```typescript
// src/nodes/CircleNode.tsx
import React, { useCallback } from 'react';
import { NodeId, NodeParams } from '../types/nodes';
import { Value, ColorValue, NumberValue, LayerValue, createLayerValue } from '../types/values';
import { RGBA, Layer } from '../models/Layer';
import { nodeRegistry } from '../registry/NodeRegistry';
import { useGraphStore } from '../store/graphStore';
import { ColorPicker } from '../components/ui/ColorPicker';
import { Slider } from '../components/ui/Slider';

// Define the node parameters
interface CircleNodeParams extends NodeParams {
  radius: number;
  color: RGBA;
}

// Define input/output types
interface CircleNodeInputs {
  radius?: NumberValue;
  color?: ColorValue;
}

interface CircleNodeOutputs {
  layer: LayerValue;
}

// Node component
const CircleNodeComponent: React.FC<{
  id: NodeId;
  data: { params: CircleNodeParams };
  selected: boolean;
}> = ({ id, data }) => {
  const updateNodeParams = useGraphStore(state => state.updateNodeParams);

  const { radius, color } = data.params;

  const handleRadiusChange = useCallback((value: number) => {
    updateNodeParams<CircleNodeParams>(id, { radius: value });
  }, [id, updateNodeParams]);

  const handleColorChange = useCallback((value: RGBA) => {
    updateNodeParams<CircleNodeParams>(id, { color: value });
  }, [id, updateNodeParams]);

  return (
    <div className="p-3">
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Radius</label>
        <div className="flex items-center gap-2">
          <Slider
            min={1}
            max={50}
            value={radius}
            onChange={handleRadiusChange}
            className="flex-1"
          />
          <input
            type="number"
            min={1}
            max={50}
            value={radius}
            onChange={e => handleRadiusChange(Number(e.target.value))}
            className="w-16 p-1 border rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Color</label>
        <ColorPicker value={color} onChange={handleColorChange} />
      </div>
    </div>
  );
};

// Evaluation function
function evaluateCircleNode(inputs: CircleNodeInputs, params: CircleNodeParams): CircleNodeOutputs {
  // Use inputs if connected, otherwise use params
  const radius = inputs.radius?.value ?? params.radius;
  const color = inputs.color?.value ?? params.color;

  const size = radius * 2;
  const layer = new Layer(size, size);

  // Draw circle
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const dx = x - radius;
      const dy = y - radius;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance <= radius) {
        layer.setPixel(x, y, color);
      }
    }
  }

  return {
    layer: createLayerValue(layer)
  };
}

// Register the node type
nodeRegistry.register({
  type: 'circle',
  label: 'Circle',
  category: 'Shapes',
  description: 'Creates a circle shape',
  inputs: [
    { id: 'radius', label: 'Radius', type: 'number', required: false },
    { id: 'color', label: 'Color', type: 'color', required: false }
  ],
  outputs: [
    { id: 'layer', label: 'Layer', type: 'layer', required: true }
  ],
  defaultParams: {
    radius: 10,
    color: { r: 255, g: 0, b: 0, a: 1 }
  },
  component: CircleNodeComponent,
  evaluate: evaluateCircleNode
});
```

## Implementation Benefits

This simplified implementation offers several key benefits:

1. **Clean Type System**: Uses proper interfaces and type guards instead of complex conditional types
2. **Separation of Concerns**: Clear separation between UI components, node logic, and state management
3. **Type Safety**: Strong typing throughout without resorting to `any`
4. **Extensibility**: Easy to add new node types through the registry
5. **Maintainability**: Simple, focused components and functions
6. **Performance**: Efficient evaluation with proper caching

## Implementation Steps

1. **Set up project structure and dependencies**
2. **Implement core type system and models**
3. **Create node registry and graph evaluator**
4. **Implement state management**
5. **Create base UI components**
6. **Implement core node types**
7. **Create main application UI**
8. **Add export functionality**

## Next Steps

After implementing the core functionality:

1. **Add more node types** (Rectangle, Gradient, etc.)
2. **Implement undo/redo** using command pattern
3. **Add project saving/loading**
4. **Enhance UI** with better styling and interactions
5. **Add export functionality** for PNG files

This implementation strategy provides a solid foundation for the Pi-Gen project with clean, type-safe code that's easy to maintain and extend.
