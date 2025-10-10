# Type System Refactoring Analysis

## Current Issues

After analyzing the Pi-Gen codebase, I've identified several issues with the current type system:

1. **Overuse of `unknown` and `any` types**:
   - The `NodeParams` interface uses `[key: string]: unknown` which loses type safety
   - Type assertions are frequently used to overcome type system limitations
   - The `Value.value` property is typed as `unknown`

2. **Inconsistent parameter handling**:
   - Parameters are sometimes accessed directly from `node.data.params`
   - Other times they're accessed through the `EvaluationContext`
   - No consistent validation of parameter types

3. **Lack of type safety in node connections**:
   - No compile-time verification that connected nodes have compatible types
   - Type checking happens at runtime, leading to potential runtime errors

4. **Redundant type definitions**:
   - Multiple interfaces for similar concepts (e.g., `Port` vs input/output definitions)
   - Duplicate type definitions across files

5. **Limited extensibility**:
   - Adding new parameter types requires changes in multiple places
   - No clear pattern for extending the system with new value types

## Common Solutions in Node-Based Systems

Node-based visual programming systems typically solve these issues through:

1. **Strongly-typed ports and connections**:
   - Each port has a specific, statically-typed data type
   - Connections are validated at compile-time or design-time
   - Type errors are caught before runtime

2. **Generic node definitions**:
   - Nodes are defined with generic type parameters for inputs and outputs
   - Type constraints ensure compatibility between connected nodes
   - Type inference reduces the need for explicit type annotations

3. **Discriminated union types for values**:
   - Values are represented as discriminated unions with a `type` field
   - Type guards ensure type safety when accessing values
   - Pattern matching or switch statements handle different value types

4. **Parameter schemas with validation**:
   - Parameters are defined with schemas that include validation rules
   - Schemas are used to generate UI controls automatically
   - Runtime validation ensures parameter values meet constraints

5. **Dependency injection for extensibility**:
   - Registry pattern for node types and value types
   - Plugin architecture for adding new node types
   - Factory methods for creating values of different types

## Proposed Solution

Based on the analysis, I propose a comprehensive refactoring of the type system with these key components:

### 1. Strongly-Typed Values

Replace the current `Value` interface with a discriminated union of specific value types:

```typescript
// Base value interface
interface BaseValue<T extends string, V> {
  readonly type: T;
  readonly value: V;
}

// Specific value types
type NumberValue = BaseValue<"number", number>;
type StringValue = BaseValue<"string", string>;
type ColorValue = BaseValue<"color", RGBA>;
type LayerValue = BaseValue<"layer", Layer>;
// etc.

// Union type of all possible values
type Value = NumberValue | StringValue | ColorValue | LayerValue;
// etc.
```

### 2. Generic Node Definitions

Define nodes with generic type parameters for inputs and outputs:

```typescript
interface NodeType<
  I extends Record<string, Value["type"]> = {},
  O extends Record<string, Value["type"]> = {},
  P extends Record<string, Value["type"]> = {},
> {
  type: string;
  label: string;
  category: string;
  description: string;

  // Input and output port definitions
  inputs: {
    [K in keyof I]: {
      id: string;
      label: string;
      type: I[K];
      required: boolean;
    };
  };

  outputs: {
    [K in keyof O]: {
      id: string;
      label: string;
      type: O[K];
      required: boolean;
    };
  };

  // Parameter definitions
  params: {
    [K in keyof P]: {
      id: string;
      label: string;
      type: P[K];
      defaultValue: any; // Will be properly typed
      min?: number;
      max?: number;
      options?: string[];
      // etc.
    };
  };

  // Component renderer
  component: React.ComponentType<NodeComponentProps<P>>;

  // Evaluation function
  evaluate: NodeEvaluator<I, O, P>;
}
```

### 3. Type-Safe Evaluation Context

Create a type-safe evaluation context that enforces correct types:

```typescript
interface EvaluationContext<
  I extends Record<string, Value["type"]> = {},
  P extends Record<string, Value["type"]> = {},
> {
  nodeId: NodeId;

  // Type-safe input getters
  getInput<K extends keyof I>(
    id: K,
  ): I[K] extends "number"
    ? number
    : I[K] extends "string"
      ? string
      : I[K] extends "color"
        ? RGBA
        : // etc.
          never;

  // Type-safe parameter getters
  getParam<K extends keyof P>(
    id: K,
  ): P[K] extends "number"
    ? number
    : P[K] extends "string"
      ? string
      : P[K] extends "color"
        ? RGBA
        : // etc.
          never;

  // Check if input is connected
  hasInput(id: keyof I): boolean;
}
```

### 4. Type-Safe Node Registration

Implement a type-safe node registry:

```typescript
class TypedNodeRegistry {
  private nodeTypes = new Map<string, NodeType<any, any, any>>();

  register<
    I extends Record<string, Value["type"]>,
    O extends Record<string, Value["type"]>,
    P extends Record<string, Value["type"]>,
  >(nodeType: NodeType<I, O, P>): void {
    this.nodeTypes.set(nodeType.type, nodeType);
  }

  get<
    I extends Record<string, Value["type"]>,
    O extends Record<string, Value["type"]>,
    P extends Record<string, Value["type"]>,
  >(type: string): NodeType<I, O, P> | undefined {
    return this.nodeTypes.get(type) as NodeType<I, O, P> | undefined;
  }

  // Other methods...
}
```

### 5. Type-Safe Graph Validation

Implement compile-time or design-time validation of graph connections:

```typescript
function validateConnection(
  sourceNode: NodeType<any, any, any>,
  sourcePort: string,
  targetNode: NodeType<any, any, any>,
  targetPort: string,
): boolean {
  const sourcePortType = sourceNode.outputs[sourcePort]?.type;
  const targetPortType = targetNode.inputs[targetPort]?.type;

  return sourcePortType === targetPortType;
}
```

## Implementation Strategy

The implementation will require significant changes to the codebase, but will result in a much more robust and maintainable system:

1. **Define the core value types** - Create a comprehensive set of value types with proper type guards and factory functions

2. **Implement the generic node type system** - Define the generic interfaces for nodes, ports, and parameters

3. **Create type-safe evaluation context** - Implement the evaluation context with proper type inference

4. **Update the node registry** - Refactor the node registry to use the new type system

5. **Refactor existing nodes** - Update all existing nodes to use the new type system

6. **Implement graph validation** - Add validation for graph connections

7. **Update UI components** - Refactor UI components to work with the new type system

This approach will eliminate the need for type assertions, provide compile-time type checking, and make the codebase more maintainable and extensible.

## Benefits

1. **Improved type safety** - Catch type errors at compile time instead of runtime
2. **Better developer experience** - Autocomplete and type inference for node development
3. **Reduced runtime errors** - Fewer unexpected errors due to type mismatches
4. **Easier maintenance** - Clear type boundaries make the code easier to understand and modify
5. **Enhanced extensibility** - Well-defined patterns for adding new node and value types

## Challenges

1. **Migration effort** - Significant changes required to existing code
2. **Learning curve** - More complex type system requires better documentation
3. **TypeScript limitations** - Some advanced type patterns may be challenging to implement
4. **Performance considerations** - More complex type checking might impact build times

## Conclusion

The current type system relies too heavily on `unknown` types and runtime type checking, leading to potential runtime errors and reduced developer productivity. By implementing a strongly-typed system with generic node definitions and discriminated union types for values, we can significantly improve type safety, maintainability, and extensibility.

The proposed solution follows established patterns in node-based systems and leverages TypeScript's advanced type system features to provide compile-time guarantees about the correctness of node connections and parameter usage.
