# Type System Implementation Plan

This document outlines the step-by-step plan for implementing the new type system for Pi-Gen.

## Phase 1: Core Value Types

### 1. Refactor `values.ts`

Create a clean implementation of value types using discriminated unions:

```typescript
// Base value interface with generic type parameters
export interface BaseValue<T extends string, V> {
  readonly type: T;
  readonly value: V;
}

// Specific value types
export type NumberValue = BaseValue<"number", number>;
export type StringValue = BaseValue<"string", string>;
export type BooleanValue = BaseValue<"boolean", boolean>;
export type ColorValue = BaseValue<"color", RGBA>;
export type LayerValue = BaseValue<"layer", Layer>;
export type Vector2Value = BaseValue<"vector2", { x: number; y: number }>;

// Union type of all possible values
export type Value =
  | NumberValue
  | StringValue
  | BooleanValue
  | ColorValue
  | LayerValue
  | Vector2Value;

// Type guard functions
export const isNumberValue = (value: Value): value is NumberValue =>
  value.type === "number";

// Factory functions
export const createNumberValue = (value: number): NumberValue => ({
  type: "number",
  value,
});

// Type mapping for generic contexts
export type ValueTypeMap = {
  number: number;
  string: string;
  boolean: boolean;
  color: RGBA;
  layer: Layer;
  vector2: { x: number; y: number };
};

// Helper type to extract the actual value type from a value type string
export type ExtractValueType<T extends keyof ValueTypeMap> = ValueTypeMap[T];
```

## Phase 2: Node Type Definitions

### 2. Refactor `nodes.ts`

Implement generic node type definitions:

```typescript
// Port definition with generic type parameter
export interface Port<T extends keyof ValueTypeMap = keyof ValueTypeMap> {
  id: string;
  label: string;
  type: T;
  required: boolean;
  controlsParam?: boolean;
}

// Parameter definition with generic type parameter
export interface ParamDef<T extends keyof ValueTypeMap = keyof ValueTypeMap> {
  id: string;
  label: string;
  type: T;
  defaultValue: ExtractValueType<T>;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  hidden?: boolean;
}

// Node type definition with generic type parameters
export interface NodeType<
  I extends Record<string, keyof ValueTypeMap> = {},
  O extends Record<string, keyof ValueTypeMap> = {},
  P extends Record<string, keyof ValueTypeMap> = {},
> {
  type: string;
  label: string;
  category: string;
  description: string;

  // Input and output port definitions
  inputs: {
    [K in keyof I]: Port<I[K]>;
  };

  outputs: {
    [K in keyof O]: Port<O[K]>;
  };

  // Parameter definitions
  params: {
    [K in keyof P]: ParamDef<P[K]>;
  };

  // Default parameter values
  defaultParams: {
    [K in keyof P]: ExtractValueType<P[K]>;
  };

  // Component renderer
  component: React.ComponentType<NodeComponentProps<P>>;

  // Evaluation function
  evaluate: NodeEvaluator<I, O, P>;
}

// Node component props with generic type parameter
export interface NodeComponentProps<
  P extends Record<string, keyof ValueTypeMap> = {},
> {
  id: NodeId;
  data: NodeData<P>;
  selected: boolean;
}

// Node data with generic type parameter
export interface NodeData<P extends Record<string, keyof ValueTypeMap> = {}> {
  params: {
    [K in keyof P]: ExtractValueType<P[K]>;
  };
}

// Node interface with generic type parameter
export interface Node<P extends Record<string, keyof ValueTypeMap> = {}> {
  id: NodeId;
  type: string;
  position: Position;
  data: NodeData<P>;
}
```

## Phase 3: Evaluation Context

### 3. Refactor `evaluation.ts`

Create a type-safe evaluation context:

```typescript
// Evaluation error interface
export interface EvaluationError {
  message: string;
  code?: string;
  inputId?: string;
  nodeId?: string;
}

// Evaluation result with generic type parameter
export type EvaluationResult<
  O extends Record<string, Value> = Record<string, Value>,
> = { success: true; outputs: O } | { success: false; error: EvaluationError };

// Evaluation context with generic type parameters
export interface EvaluationContext<
  I extends Record<string, keyof ValueTypeMap> = {},
  P extends Record<string, keyof ValueTypeMap> = {},
> {
  nodeId: NodeId;

  // Get raw input value
  getRawInput(id: keyof I): Value | undefined;

  // Type-safe input getters
  getInput<K extends keyof I>(id: K): ExtractValueType<I[K]>;

  // Type-safe parameter getters
  getParam<K extends keyof P>(id: K): ExtractValueType<P[K]>;

  // Check if input is connected
  hasInput(id: keyof I): boolean;

  // Get all inputs
  getAllInputs(): Record<string, Value>;

  // Get all parameters
  getAllParams(): {
    [K in keyof P]: ExtractValueType<P[K]>;
  };
}

// Node evaluator function type with generic type parameters
export type NodeEvaluator<
  I extends Record<string, keyof ValueTypeMap> = {},
  O extends Record<string, keyof ValueTypeMap> = {},
  P extends Record<string, keyof ValueTypeMap> = {},
> = (ctx: EvaluationContext<I, P>) => EvaluationResult<{
  [K in keyof O]: BaseValue<O[K], ExtractValueType<O[K]>>;
}>;
```

## Phase 4: Node Registry

### 4. Refactor `NodeRegistry.ts`

Implement a type-safe node registry:

```typescript
// Node registry class with generic type parameters
export class TypedNodeRegistry {
  private nodeTypes = new Map<string, NodeType<any, any, any>>();

  // Register a node type
  register<
    I extends Record<string, keyof ValueTypeMap>,
    O extends Record<string, keyof ValueTypeMap>,
    P extends Record<string, keyof ValueTypeMap>,
  >(nodeType: NodeType<I, O, P>): void {
    this.nodeTypes.set(nodeType.type, nodeType);
  }

  // Get a node type by its identifier
  get<
    I extends Record<string, keyof ValueTypeMap>,
    O extends Record<string, keyof ValueTypeMap>,
    P extends Record<string, keyof ValueTypeMap>,
  >(type: string): NodeType<I, O, P> | undefined {
    return this.nodeTypes.get(type) as NodeType<I, O, P> | undefined;
  }

  // Get all registered node types
  getAll(): NodeTypeEntry[] {
    return Array.from(this.nodeTypes.values()).map((nodeType) => ({
      type: nodeType.type,
      label: nodeType.label,
      category: nodeType.category,
      description: nodeType.description,
      component: nodeType.component,
    }));
  }

  // Get node types grouped by category
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

  // Get component types for ReactFlow
  getComponentTypes(): Record<
    string,
    React.ComponentType<NodeComponentProps<any>>
  > {
    const result: Record<
      string,
      React.ComponentType<NodeComponentProps<any>>
    > = {};

    this.nodeTypes.forEach((nodeType, type) => {
      result[type] = nodeType.component;
    });

    return result;
  }
}

// Create a singleton instance
export const nodeRegistry = new TypedNodeRegistry();
```

## Phase 5: Graph Evaluator

### 5. Refactor `GraphEvaluator.ts`

Update the graph evaluator to use the new type system:

```typescript
// Implementation of the EvaluationContext interface
class TypedEvaluationContext<
  I extends Record<string, keyof ValueTypeMap>,
  P extends Record<string, keyof ValueTypeMap>,
> implements EvaluationContext<I, P>
{
  constructor(
    public readonly nodeId: NodeId,
    private inputValues: Record<string, Value>,
    private params: Record<string, any>,
  ) {}

  getRawInput(id: keyof I): Value | undefined {
    return this.inputValues[id as string];
  }

  getInput<K extends keyof I>(id: K): ExtractValueType<I[K]> {
    const input = this.inputValues[id as string];

    if (!input) {
      // If input is not connected, use the default value from params
      if (id in this.params) {
        return this.params[id as string];
      }

      throw {
        message: `Required input ${String(id)} not connected`,
        nodeId: this.nodeId,
        inputId: id,
        code: "MISSING_INPUT",
      };
    }

    if (input.type !== String(id)) {
      throw {
        message: `Type mismatch for input ${String(id)}: expected ${String(id)}, got ${input.type}`,
        nodeId: this.nodeId,
        inputId: id,
        code: "TYPE_MISMATCH",
      };
    }

    return input.value as ExtractValueType<I[K]>;
  }

  getParam<K extends keyof P>(id: K): ExtractValueType<P[K]> {
    return this.params[id as string];
  }

  hasInput(id: keyof I): boolean {
    return id in this.inputValues;
  }

  getAllInputs(): Record<string, Value> {
    return { ...this.inputValues };
  }

  getAllParams(): { [K in keyof P]: ExtractValueType<P[K]> } {
    return { ...this.params } as { [K in keyof P]: ExtractValueType<P[K]> };
  }
}

// Graph evaluator class
export class TypedGraphEvaluator {
  // Implementation similar to current GraphEvaluator but using the new type system
}
```

## Phase 6: Node Components

### 6. Refactor Node Components

Update node components to use the new type system:

```typescript
// Example: Circle node with proper typing
interface CircleNodeInputs {
  radius: "number";
  color: "color";
}

interface CircleNodeOutputs {
  layer: "layer";
}

interface CircleNodeParams {
  radius: "number";
  color: "color";
}

const CircleNodeComponent: React.FC<NodeComponentProps<CircleNodeParams>> = ({
  id,
  data,
}) => {
  // Implementation using the new type system
};

function evaluateCircleNode(
  ctx: EvaluationContext<CircleNodeInputs, CircleNodeParams>,
): EvaluationResult<{
  layer: LayerValue;
}> {
  // Implementation using the new type system
}

// Register the circle node type
nodeRegistry.register<CircleNodeInputs, CircleNodeOutputs, CircleNodeParams>({
  type: "circle",
  label: "Circle",
  category: "Shapes",
  description: "Generates a circle shape",
  inputs: {
    radius: { id: "radius", label: "Radius", type: "number", required: false },
    color: { id: "color", label: "Color", type: "color", required: false },
  },
  outputs: {
    layer: { id: "layer", label: "Layer", type: "layer", required: true },
  },
  params: {
    radius: {
      id: "radius",
      label: "Radius",
      type: "number",
      defaultValue: 10,
      min: 1,
      max: 100,
      step: 1,
    },
    color: {
      id: "color",
      label: "Color",
      type: "color",
      defaultValue: { r: 255, g: 0, b: 0, a: 1 },
    },
  },
  defaultParams: {
    radius: 10,
    color: { r: 255, g: 0, b: 0, a: 1 },
  },
  component: CircleNodeComponent,
  evaluate: evaluateCircleNode,
});
```

## Phase 7: UI Components

### 7. Refactor UI Components

Update UI components to work with the new type system:

```typescript
// Example: NumberParameter component with proper typing
export interface NumberParameterProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
  showInput?: boolean;
  className?: string;
  disabled?: boolean;
}

export const NumberParameter: React.FC<NumberParameterProps> = ({
  id,
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showSlider = true,
  showInput = true,
  className,
  disabled = false,
}) => {
  // Implementation using the new type system
};
```

## Phase 8: Integration and Testing

### 8. Integration

1. Update imports and references throughout the codebase
2. Fix any type errors that arise from the refactoring
3. Ensure all components work with the new type system

### 9. Testing

1. Create unit tests for the new type system
2. Test all node types with the new system
3. Verify that graph evaluation works correctly
4. Test edge cases and error handling

## Timeline

1. **Phase 1 (Core Value Types)**: 1 day
2. **Phase 2 (Node Type Definitions)**: 1 day
3. **Phase 3 (Evaluation Context)**: 1 day
4. **Phase 4 (Node Registry)**: 1 day
5. **Phase 5 (Graph Evaluator)**: 2 days
6. **Phase 6 (Node Components)**: 2-3 days
7. **Phase 7 (UI Components)**: 1-2 days
8. **Phase 8 (Integration and Testing)**: 2-3 days

Total estimated time: 10-14 days
