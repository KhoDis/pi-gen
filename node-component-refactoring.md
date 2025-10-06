# Node Component Refactoring Analysis

## Current Implementation Analysis

Looking at the current implementation, I can see several areas for improvement to make the code more clean, composable, and customizable:

1. **ParameterRow is too generic**: The current `ParameterRow` component tries to handle both input and output parameters with the same component, which leads to unnecessary complexity.

2. **Duplicated UI structure**: In the CircleNode component, there's repetition in how parameters are structured (label, controls, etc.).

3. **Mixed concerns**: The node components are handling both the visual representation and the parameter logic.

4. **Lack of specialization**: There's no clear distinction between input parameters (which can have controls) and output parameters (which are typically just labels).

5. **Inconsistent handle positioning**: The current approach uses fixed-width slots, but doesn't fully address the positioning of controls relative to handles.

## Blender Geometry Nodes Inspiration

Taking inspiration from Blender's Geometry Nodes:

1. **Input Parameters**: These are more flexible and can have various controls (sliders, inputs, etc.)
2. **Output Parameters**: These are simpler and typically just have labels with output handles
3. **Clear Visual Distinction**: Inputs are on the left, outputs are on the right

## Proposed Refactoring

### 1. Create Specialized Components

Instead of a generic `ParameterRow`, let's create specialized components for different parameter types:

#### A. NodeInput Component

```tsx
interface NodeInputProps {
  id: string;
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const NodeInput: React.FC<NodeInputProps> = ({
  id,
  label,
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col w-full py-1", className)}>
      <div className="flex items-center w-full">
        {/* Input handle - always on the left */}
        <div className="w-4 flex justify-start items-center relative">
          <BaseHandle id={id} type="target" position={Position.Left} />
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col">
          <span className="text-sm font-medium">{label}</span>
          <div className="mt-1">{children}</div>
        </div>
      </div>
    </div>
  );
};
```

#### B. NodeOutput Component

```tsx
interface NodeOutputProps {
  id: string;
  label: string;
  className?: string;
}

export const NodeOutput: React.FC<NodeOutputProps> = ({
  id,
  label,
  className,
}) => {
  return (
    <div className={cn("flex items-center w-full py-1", className)}>
      {/* Label - aligned to the right */}
      <div className="flex-1 text-right">
        <span className="text-sm font-medium">{label}</span>
      </div>

      {/* Output handle - always on the right */}
      <div className="w-4 flex justify-end items-center relative">
        <BaseHandle id={id} type="source" position={Position.Right} />
      </div>
    </div>
  );
};
```

### 2. Create Specialized Control Components

For common parameter controls, create specialized components:

#### A. NumberParameter Component

```tsx
interface NumberParameterProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
  showInput?: boolean;
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
}) => {
  return (
    <NodeInput id={id} label={label}>
      <div className="flex items-center gap-2">
        {showSlider && (
          <Slider
            min={min}
            max={max}
            step={step}
            value={[value]}
            onValueChange={(values) => onChange(values[0])}
            className="flex-1"
          />
        )}

        {showInput && (
          <Input
            type="number"
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-16 h-8"
          />
        )}
      </div>
    </NodeInput>
  );
};
```

#### B. ColorParameter Component

```tsx
interface ColorParameterProps {
  id: string;
  label: string;
  value: RGBA;
  onChange: (value: RGBA) => void;
}

export const ColorParameter: React.FC<ColorParameterProps> = ({
  id,
  label,
  value,
  onChange,
}) => {
  return (
    <NodeInput id={id} label={label}>
      <ColorPicker value={value} onChange={onChange} />
    </NodeInput>
  );
};
```

### 3. Refactored CircleNode Example

With these specialized components, the CircleNode would be much cleaner:

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

### 4. Refactored DisplayNode Example

```tsx
const DisplayNodeComponent: React.FC<NodeComponentProps> = ({ id }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layer = getLayer(); // Implementation omitted for brevity

  return (
    <BaseNode className="w-[250px]">
      <BaseNodeHeader className="border-b">
        <BaseNodeHeaderTitle>Display</BaseNodeHeaderTitle>
      </BaseNodeHeader>

      <BaseNodeContent>
        {/* Input Parameter */}
        <NodeInput id="layer" label="Layer">
          <div className="border border-gray-300 dark:border-gray-700 rounded overflow-hidden mt-2">
            {layer ? (
              <canvas
                ref={canvasRef}
                className="pixelated"
                style={{
                  width: "100%",
                  imageRendering: "pixelated",
                }}
              />
            ) : (
              <div className="h-32 flex items-center justify-center text-sm text-gray-500">
                Connect a layer to see output
              </div>
            )}
          </div>
        </NodeInput>
      </BaseNodeContent>

      <BaseNodeFooter className="px-4">
        <button
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!layer}
          onClick={() => {
            if (!canvasRef.current || !layer) return;
            const link = document.createElement("a");
            link.download = "pi-gen-output.png";
            link.href = canvasRef.current.toDataURL("image/png");
            link.click();
          }}
        >
          Download Image
        </button>
      </BaseNodeFooter>
    </BaseNode>
  );
};
```

## Benefits of This Approach

1. **Clear Separation of Concerns**: Each component has a specific purpose
2. **Reduced Duplication**: Common patterns are extracted into reusable components
3. **Type Safety**: Specialized components have appropriate prop types
4. **Consistent Styling**: UI patterns are consistent across all nodes
5. **Easier to Extend**: Adding new parameter types is straightforward
6. **Better Developer Experience**: Node implementations are more concise and focused

## Implementation Plan

1. Create the specialized components (`NodeInput`, `NodeOutput`)
2. Create parameter-specific components (`NumberParameter`, `ColorParameter`, etc.)
3. Refactor existing nodes to use the new components
4. Update documentation to reflect the new architecture

This approach will make the codebase more maintainable, easier to extend, and provide a better developer experience when creating new node types.
