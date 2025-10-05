# Node Component Parameter Access Approaches

## Current Approach Analysis

Currently, in our CircleNode component, we access parameters like this:

```typescript
const params = data.params as unknown as CircleNodeParams;
const radius = params.radius ?? 10;
const color = params.color ?? { r: 255, g: 0, b: 0, a: 1 };
```

This approach has several issues:

1. It uses type assertions (`as unknown as CircleNodeParams`), which bypasses TypeScript's type checking
2. It requires manual default value handling (`?? 10`)
3. It's not type-safe - TypeScript can't verify the parameters exist
4. It's error-prone - typos in parameter names won't be caught until runtime

Let's explore better approaches for accessing node parameters in components.

## Approach 1: Typed NodeData with Generics

We could enhance the NodeComponentProps interface to support generics:

```typescript
export interface NodeComponentProps<P extends NodeParams = NodeParams> {
  id: NodeId;
  data: NodeData<P>;
  selected: boolean;
}

// Usage
const CircleNodeContent: React.FC<NodeComponentProps<CircleNodeParams>> = ({
  id,
  data,
}) => {
  const params = data.params; // Properly typed as CircleNodeParams
  const radius = params.radius;
  const color = params.color;
  // ...
};
```

**Advantages:**

- Type-safe - TypeScript knows the parameter types
- No need for type assertions
- IDE autocompletion for parameter names

**Disadvantages:**

- Still requires manual default value handling
- Requires passing the type parameter everywhere

## Approach 2: Parameter Hook with Type Safety

We could create a custom hook that provides type-safe access to parameters:

```typescript
function useNodeParams<P extends NodeParams>(data: NodeData): P {
  return data.params as P;
}

// Usage
const CircleNodeContent: React.FC<NodeComponentProps> = ({ id, data }) => {
  const params = useNodeParams<CircleNodeParams>(data);
  const radius = params.radius;
  const color = params.color;
  // ...
};
```

**Advantages:**

- Encapsulates the type assertion in one place
- Cleaner component code
- Could be extended to include validation or other logic

**Disadvantages:**

- Still uses type assertion internally
- Still requires manual default value handling

## Approach 3: Parameter Hook with Default Values

We could enhance the hook to handle default values:

```typescript
function useNodeParams<P extends NodeParams>(
  data: NodeData,
  defaults: Partial<P>,
): P {
  const params = { ...defaults, ...data.params } as P;
  return params;
}

// Usage
const CircleNodeContent: React.FC<NodeComponentProps> = ({ id, data }) => {
  const params = useNodeParams<CircleNodeParams>(data, {
    radius: 10,
    color: { r: 255, g: 0, b: 0, a: 1 },
  });
  const radius = params.radius; // Always has a value
  const color = params.color; // Always has a value
  // ...
};
```

**Advantages:**

- Handles default values automatically
- Type-safe parameter access
- Centralizes parameter handling logic

**Disadvantages:**

- Duplicates default values (also defined in node registration)
- Still uses type assertion internally

## Approach 4: Strongly Typed Component Factory

We could create a factory function that creates strongly typed components:

```typescript
function createNodeComponent<P extends NodeParams>(
  nodeType: string,
  defaultParams: P,
): React.FC<NodeComponentProps> {
  return (props) => {
    const { id, data } = props;
    const params = { ...defaultParams, ...data.params } as P;

    // Component implementation using params
    // ...
  };
}

// Usage
export const CircleNode = createNodeComponent<CircleNodeParams>("circle", {
  radius: 10,
  color: { r: 255, g: 0, b: 0, a: 1 },
});
```

**Advantages:**

- Fully type-safe
- Handles default values automatically
- Centralizes component creation logic

**Disadvantages:**

- Less flexible for complex components
- Might be harder to implement for components with complex state

## Approach 5: Parameter Context Provider

We could use React Context to provide typed parameters:

```typescript
// Create context for each node type
const CircleParamsContext = React.createContext<CircleNodeParams | null>(null);

// Provider component
const CircleParamsProvider: React.FC<{
  data: NodeData;
  children: React.ReactNode;
}> = ({ data, children }) => {
  const defaultParams: CircleNodeParams = {
    radius: 10,
    color: { r: 255, g: 0, b: 0, a: 1 }
  };
  const params = { ...defaultParams, ...data.params } as CircleNodeParams;

  return (
    <CircleParamsContext.Provider value={params}>
      {children}
    </CircleParamsContext.Provider>
  );
};

// Hook to use params
function useCircleParams() {
  const params = React.useContext(CircleParamsContext);
  if (!params) throw new Error("useCircleParams must be used within a CircleParamsProvider");
  return params;
}

// Usage
const CircleNodeContent: React.FC<NodeComponentProps> = (props) => {
  return (
    <CircleParamsProvider data={props.data}>
      <CircleNodeInner id={props.id} selected={props.selected} />
    </CircleParamsProvider>
  );
};

const CircleNodeInner: React.FC<{ id: NodeId; selected: boolean }> = ({ id }) => {
  const params = useCircleParams();
  const { radius, color } = params;
  // ...
};
```

**Advantages:**

- Fully type-safe
- Handles default values automatically
- Allows splitting component logic
- Parameters available to any child component

**Disadvantages:**

- More complex setup
- Requires creating context for each node type

## Approach 6: Unified Parameter System with Type Registry

We could create a unified parameter system with a type registry:

```typescript
// Parameter type registry
const paramTypes = {
  circle: {} as CircleNodeParams,
  rectangle: {} as RectangleNodeParams,
  // other node types...
};

// Type helper
type ParamTypes = typeof paramTypes;

// Generic hook
function useNodeParams<T extends keyof ParamTypes>(
  nodeType: T,
  data: NodeData,
  defaults: Partial<ParamTypes[T]>,
): ParamTypes[T] {
  return { ...defaults, ...data.params } as ParamTypes[T];
}

// Usage
const CircleNodeContent: React.FC<NodeComponentProps> = ({ id, data }) => {
  const params = useNodeParams("circle", data, {
    radius: 10,
    color: { r: 255, g: 0, b: 0, a: 1 },
  });
  const { radius, color } = params;
  // ...
};
```

**Advantages:**

- Fully type-safe with string literal types
- Centralized type registry
- Handles default values
- Scales well to many node types

**Disadvantages:**

- Requires maintaining the type registry
- Still duplicates default values

## Approach 7: Node Registry Integration

We could integrate with the node registry to get default parameters:

```typescript
// Enhanced hook that uses node registry
function useNodeParams<P extends NodeParams>(
  nodeType: string,
  data: NodeData,
): P {
  // Get node type from registry
  const nodeTypeInfo = nodeRegistry.get(nodeType);
  if (!nodeTypeInfo) {
    throw new Error(`Node type ${nodeType} not found in registry`);
  }

  // Merge default params with actual params
  const params = { ...nodeTypeInfo.defaultParams, ...data.params } as P;
  return params;
}

// Usage
const CircleNodeContent: React.FC<NodeComponentProps> = ({ id, data }) => {
  const params = useNodeParams<CircleNodeParams>("circle", data);
  const { radius, color } = params;
  // ...
};
```

**Advantages:**

- Uses default values from node registry (single source of truth)
- Type-safe parameter access
- No duplication of default values
- Centralizes parameter handling logic

**Disadvantages:**

- Requires node type string
- Still uses type assertion internally

## Recommendation

Based on the analysis, **Approach 7 (Node Registry Integration)** offers the best balance of type safety, code cleanliness, and maintainability. It leverages the node registry as a single source of truth for default values and provides a clean API for accessing parameters.

For implementation, we would create a custom hook:

```typescript
/**
 * Hook for accessing node parameters with proper typing and default values
 * @param nodeType The node type identifier
 * @param data The node data from props
 * @returns The node parameters with defaults applied
 */
export function useNodeParams<P extends NodeParams>(
  nodeType: string,
  data: NodeData,
): P {
  // Get node type from registry
  const nodeTypeInfo = nodeRegistry.get<P>(nodeType);
  if (!nodeTypeInfo) {
    throw new Error(`Node type ${nodeType} not found in registry`);
  }

  // Merge default params with actual params
  const params = { ...nodeTypeInfo.defaultParams, ...data.params } as P;
  return params;
}
```

Then we would use it in our CircleNode component:

```typescript
const CircleNodeContent: React.FC<NodeComponentProps> = ({ id, data }) => {
  const params = useNodeParams<CircleNodeParams>("circle", data);
  const { radius, color } = params;

  // Now we can use radius and color directly, with proper typing
  // and default values already applied

  // ...rest of component
};
```

This approach provides a clean, type-safe way to access node parameters while maintaining a single source of truth for default values in the node registry.
