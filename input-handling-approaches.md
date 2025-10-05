# Type-Safe Input Handling Approaches

## Current Approach Analysis

Currently, our `EvaluationContext` interface has a method signature like this:

```typescript
getInputValue(id: string, type: string): unknown;
```

This requires explicit type casting when used:

```typescript
const radius = ctx.getInputValue("radius", "number") as number;
const color = ctx.getInputValue("color", "color") as RGBA;
```

This approach has several drawbacks:

1. It's not type-safe - TypeScript can't verify the cast is valid at compile time
2. It requires manual type assertions everywhere
3. It's error-prone - typos in type strings won't be caught until runtime
4. It doesn't leverage TypeScript's type system effectively

## Approach 1: Generic Methods with Type Mapping

We could use generics with a type mapping to make the API type-safe:

```typescript
interface TypeMap {
  number: number;
  color: RGBA;
  layer: Layer;
  boolean: boolean;
  string: string;
  vector2: { x: number; y: number };
}

interface EvaluationContext {
  getInputValue<T extends keyof TypeMap>(id: string, type: T): TypeMap[T];
  // ...other methods
}
```

Usage would look like:

```typescript
const radius = ctx.getInputValue("radius", "number"); // Returns number
const color = ctx.getInputValue("color", "color"); // Returns RGBA
```

**Advantages:**

- Type-safe - TypeScript knows the return type based on the type parameter
- No need for manual type assertions
- Compile-time checking of type strings
- IDE autocompletion for type strings

**Disadvantages:**

- Still requires passing the type string, which is redundant
- Type and value are still separate concepts
- Requires maintaining a type mapping

## Approach 2: Type Inference from Input ID

We could define input types at the node registration level and infer them:

```typescript
interface NodeDefinition {
  // ...
  inputs: {
    id: string;
    type: keyof TypeMap;
    // ...other properties
  }[];
  // ...
}

interface EvaluationContext<Inputs extends Record<string, keyof TypeMap>> {
  getInputValue<ID extends keyof Inputs>(id: ID): TypeMap[Inputs[ID]];
  // ...other methods
}
```

Usage would look like:

```typescript
// For a node with inputs defined as { id: "radius", type: "number" }
const radius = ctx.getInputValue("radius"); // Returns number
```

**Advantages:**

- Even more type-safe - input IDs are checked against defined inputs
- No need to specify type at all - it's inferred from the input ID
- Single source of truth for input types

**Disadvantages:**

- More complex type system
- Requires generic context type that's specific to each node
- May be harder to implement

## Approach 3: Strongly Typed Input Objects

We could provide a strongly typed object with all inputs:

```typescript
interface EvaluationContext<InputTypes> {
  inputs: InputTypes;
  // ...other methods
}

// When evaluating a circle node:
type CircleInputs = {
  radius: number;
  color: RGBA;
};

function evaluateCircleNode(ctx: EvaluationContext<CircleInputs>) {
  const { radius, color } = ctx.inputs;
  // ...
}
```

**Advantages:**

- Very clean API - destructuring makes it clear what inputs are used
- Type-safe - all inputs are properly typed
- No string literals for input IDs

**Disadvantages:**

- Requires defining input types for each node
- May not handle optional inputs as elegantly
- Doesn't handle the case where inputs aren't connected

## Approach 4: Builder Pattern with Method Chaining

We could use a builder pattern with method chaining:

```typescript
interface EvaluationContext {
  input(id: string): InputBuilder;
  // ...other methods
}

interface InputBuilder {
  asNumber(): number;
  asColor(): RGBA;
  asLayer(): Layer;
  // ...other type methods
}
```

Usage would look like:

```typescript
const radius = ctx.input("radius").asNumber();
const color = ctx.input("color").asColor();
```

**Advantages:**

- Type-safe - each method returns the correct type
- Fluent API that's easy to read
- Clear separation between input selection and type conversion

**Disadvantages:**

- More verbose than some other approaches
- Requires implementing multiple methods for the builder

## Approach 5: Type-Safe Getters with Type Predicates

We could use type predicates to create type-safe getter functions:

```typescript
interface EvaluationContext {
  getNumberInput(id: string): number;
  getColorInput(id: string): RGBA;
  getLayerInput(id: string): Layer;
  // ...other typed getters
}
```

Usage would look like:

```typescript
const radius = ctx.getNumberInput("radius");
const color = ctx.getColorInput("color");
```

**Advantages:**

- Very type-safe - each method returns a specific type
- Clear and concise API
- No type assertions needed

**Disadvantages:**

- Requires implementing a method for each type
- Doesn't leverage TypeScript's generics as effectively
- More methods to maintain

## Approach 6: Tagged Union Types

We could use tagged union types to represent values:

```typescript
type InputValue =
  | { type: "number"; value: number }
  | { type: "color"; value: RGBA }
  | { type: "layer"; value: Layer };

interface EvaluationContext {
  getInput(id: string): InputValue;
}
```

With type guards:

```typescript
function isNumberInput(
  input: InputValue,
): input is { type: "number"; value: number } {
  return input.type === "number";
}

// Usage
const radiusInput = ctx.getInput("radius");
if (isNumberInput(radiusInput)) {
  const radius = radiusInput.value; // typed as number
}
```

**Advantages:**

- Type-safe with proper type narrowing
- Single method for getting inputs
- Works well with TypeScript's discriminated unions

**Disadvantages:**

- More verbose to use
- Requires type guards
- Conditional logic needed to handle different types

## Dynamic Node Support Analysis

For supporting dynamic user-created custom nodes, we need to consider:

1. **Runtime Flexibility**: The system must handle nodes whose structure isn't known at compile time
2. **Type Safety**: We still want as much type safety as possible
3. **Error Handling**: Clear error messages when types don't match
4. **Composability**: Easy to combine nodes into larger structures

### Best Approaches for Dynamic Nodes

#### Approach 6: Tagged Union Types

This approach is particularly well-suited for dynamic nodes because:

- It maintains runtime type information through the `type` property
- It works with dynamic structures not known at compile time
- It allows for runtime type checking
- It's compatible with serialization/deserialization for saving custom nodes

Implementation would look like:

```typescript
// Our existing Value types already follow this pattern
interface Value {
  readonly type: string;
  readonly value: unknown;
}

interface EvaluationContext {
  getInput(id: string): Value;

  // Helper methods for common types
  getTypedInput<T>(id: string, expectedType: string): T {
    const input = this.getInput(id);
    if (input.type !== expectedType) {
      throw new Error(`Expected input "${id}" to be of type "${expectedType}", but got "${input.type}"`);
    }
    return input.value as T;
  }
}

// Usage
const radius = ctx.getTypedInput<number>('radius', 'number');
```

#### Approach 4: Builder Pattern

This approach also works well for dynamic nodes:

- It provides a clean API for type conversion
- It handles runtime type checking
- It gives clear error messages

Implementation:

```typescript
interface EvaluationContext {
  input(id: string): InputBuilder;
}

interface InputBuilder {
  asNumber(): number;
  asColor(): RGBA;
  asLayer(): Layer;
  // Dynamic method for any type
  as<T>(type: string): T;
}

// Usage
const radius = ctx.input("radius").asNumber();
// Or for dynamic types
const customValue = ctx.input("custom").as<MyCustomType>("customType");
```

### Recommendation for Dynamic Nodes

For a system that needs to support dynamic user-created nodes, **Approach 6 (Tagged Union Types)** is the most suitable because:

1. It maintains runtime type information
2. It works with structures not known at compile time
3. It's compatible with serialization for saving custom nodes
4. It can be enhanced with helper methods for better usability

Our existing Value types already follow this pattern, so we can leverage them:

```typescript
// Enhanced EvaluationContext for dynamic nodes
export interface EvaluationContext {
  nodeId: NodeId;

  // Get raw input value with runtime type info
  getInput(id: string): Value | undefined;

  // Type-safe helper that throws if type doesn't match
  getTypedInput<T>(id: string, expectedType: string): T;

  // Convenience methods for common types
  getNumberInput(id: string): number;
  getColorInput(id: string): RGBA;
  getLayerInput(id: string): Layer;

  hasInput(id: string): boolean;
  getAllInputs(): Record<string, Value>;
  getParams(): NodeParams;
}
```

This approach gives us the best of both worlds:

- Type safety where possible through the convenience methods
- Runtime flexibility for dynamic nodes through the generic methods
- Clear error handling when types don't match
- Compatibility with serialization for saving/loading custom nodes

It also aligns well with our existing Value type system, making it a natural fit for our architecture.
