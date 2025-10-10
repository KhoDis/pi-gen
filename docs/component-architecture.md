# Pi-Gen Component Architecture

This document outlines the component architecture used in the Pi-Gen node-based pixel art generator.

## Overview

Pi-Gen uses a specialized component architecture inspired by Blender's Geometry Nodes. The architecture is designed to provide a clean, composable, and type-safe way to build node components with consistent styling and behavior.

## Base Components

### BaseNode

The foundation for all node components. It provides the basic structure and styling for nodes.

```tsx
<BaseNode className="w-[250px]">{/* Node content goes here */}</BaseNode>
```

### BaseNodeHeader

A consistent header component for nodes. Typically contains the node title.

```tsx
<BaseNodeHeader className="border-b">
  <BaseNodeHeaderTitle>Circle</BaseNodeHeaderTitle>
</BaseNodeHeader>
```

### BaseNodeContent

The main content area for nodes. It has proper padding to ensure handles are positioned correctly at the edges.

```tsx
<BaseNodeContent>{/* Node parameters go here */}</BaseNodeContent>
```

### BaseNodeFooter

The footer area for nodes. Typically contains output parameters or actions.

```tsx
<BaseNodeFooter>{/* Output parameters or actions go here */}</BaseNodeFooter>
```

## Parameter Components

### NodeInput

A specialized component for input parameters with handles on the left side.

```tsx
<NodeInput id="radius" label="Radius">
  {/* Parameter controls go here */}
</NodeInput>
```

### NodeOutput

A specialized component for output parameters with handles on the right side.

```tsx
<NodeOutput id="layer" label="Layer" />
```

### NumberParameter

A specialized component for numeric inputs with a slider and input field.

```tsx
<NumberParameter
  id="radius"
  label="Radius"
  value={radius}
  onChange={handleRadiusChange}
  min={1}
  max={100}
/>
```

### ColorParameter

A specialized component for color inputs with a color picker.

```tsx
<ColorParameter
  id="color"
  label="Color"
  value={color}
  onChange={handleColorChange}
/>
```

## Node Component Example

Here's a complete example of a CircleNode component using the architecture:

```tsx
const CircleNodeComponent: React.FC<NodeComponentProps> = ({ id, data }) => {
  const updateNodeParams = useGraphStore((state) => state.updateNodeParams);
  const params = useNodeParams<CircleNodeParams>("circle", data);
  const { radius, color } = params;

  const handleRadiusChange = useCallback(
    (value: number) => {
      updateNodeParams(id, { radius: value });
    },
    [id, updateNodeParams],
  );

  const handleColorChange = useCallback(
    (value: RGBA) => {
      updateNodeParams(id, { color: value });
    },
    [id, updateNodeParams],
  );

  return (
    <BaseNode className="w-[250px]">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle>Circle</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        {/* Input Parameters */}
        <NumberParameter
          id="radius"
          label="Radius"
          value={radius}
          onChange={handleRadiusChange}
          min={1}
          max={100}
        />

        <ColorParameter
          id="color"
          label="Color"
          value={color}
          onChange={handleColorChange}
        />
      </BaseNodeContent>

      <BaseNodeFooter>
        {/* Output Parameters */}
        <NodeOutput id="layer" label="Layer" />
      </BaseNodeFooter>
    </BaseNode>
  );
};
```

## Benefits of This Architecture

1. **Clear Separation of Concerns**: Each component has a specific purpose
2. **Reduced Duplication**: Common patterns are extracted into reusable components
3. **Type Safety**: Specialized components have appropriate prop types
4. **Consistent Styling**: UI patterns are consistent across all nodes
5. **Easier to Extend**: Adding new parameter types is straightforward
6. **Better Developer Experience**: Node implementations are more concise and focused

## Handle Positioning

Handles are positioned at the edges of the node using fixed-width slots. This ensures consistent positioning regardless of whether handles are present on both sides or just one side.

The `BaseNodeContent` component has `px-0` padding to ensure handles are positioned correctly at the edges, while maintaining proper vertical spacing with `py-3`.

## Parameter Access

Parameters are accessed using the `useNodeParams` hook, which provides type-safe access to parameters with default values from the node registry:

```tsx
const params = useNodeParams<CircleNodeParams>("circle", data);
const { radius, color } = params;
```

This approach ensures type safety and provides a clean API for accessing parameters.
