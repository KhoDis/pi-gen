# Simplified Handle Approach for Pi-Gen Node Components

## Current Issue Analysis

After reviewing the codebase, I've identified that the current approach using `LabeledHandle` adds unnecessary complexity and constraints to the layout. The `LabeledHandle` component combines a handle with a label, which limits flexibility in positioning controls and creates layout issues.

## Proposed Solution: Direct BaseHandle Usage with Fixed-Width Slots

Instead of using the `LabeledHandle` component, we can use the `BaseHandle` component directly within a fixed-width slot layout. This approach offers several advantages:

1. **Greater Flexibility**: We can position handles and labels independently
2. **Simpler Layout**: No need to manage complex nested components
3. **Better Control Positioning**: Controls can be positioned consistently regardless of handle presence

## Implementation Details

### 1. Parameter Row Component

Create a reusable `ParameterRow` component that uses fixed-width slots for handles and places the label and controls in the center:

```tsx
interface ParameterRowProps {
  label?: string;
  leftHandleProps?: Omit<BaseHandleProps, "position"> & { id: string };
  rightHandleProps?: Omit<BaseHandleProps, "position"> & { id: string };
  children: React.ReactNode;
  className?: string;
}

export const ParameterRow: React.FC<ParameterRowProps> = ({
  label,
  leftHandleProps,
  rightHandleProps,
  children,
  className = "",
}) => {
  return (
    <div className={`flex items-center w-full ${className}`}>
      {/* Left handle slot - fixed width */}
      <div className="w-8 flex justify-start items-center">
        {leftHandleProps && (
          <BaseHandle position={Position.Left} {...leftHandleProps} />
        )}
      </div>

      {/* Content area with optional label */}
      <div className="flex-1 flex flex-col">
        {label && <div className="text-sm font-medium mb-1">{label}</div>}
        <div className="w-full">{children}</div>
      </div>

      {/* Right handle slot - fixed width */}
      <div className="w-8 flex justify-end items-center">
        {rightHandleProps && (
          <BaseHandle position={Position.Right} {...rightHandleProps} />
        )}
      </div>
    </div>
  );
};
```

### 2. Usage Example

Here's how the `ParameterRow` component would be used in the CircleNode component:

```tsx
// Radius parameter with left handle and input control
<ParameterRow
  label="Radius"
  leftHandleProps={{
    id: "radius",
    type: "target",
  }}
>
  <div className="flex justify-between items-center">
    <Slider
      min={1}
      max={100}
      step={1}
      value={[radius]}
      onValueChange={(values) => handleRadiusChange(values[0])}
      className="flex-1 mr-2"
    />
    <Input
      type="number"
      min={1}
      max={100}
      value={radius}
      onChange={(e) => handleRadiusChange(Number(e.target.value))}
      className="w-16 h-8"
    />
  </div>
</ParameterRow>
```

### 3. BaseNodeContent Modification

To ensure handles are positioned correctly at the edges, we'll modify the `BaseNodeContent` component to remove horizontal padding:

```tsx
export const BaseNodeContent = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="base-node-content"
    className={cn("flex flex-col gap-y-3 py-3 px-0", className)}
    {...props}
  />
));
```

## Benefits of This Approach

1. **Simplified Component Structure**: Using `BaseHandle` directly reduces complexity
2. **More Flexible Layout**: Controls and labels can be positioned independently
3. **Consistent Spacing**: Fixed-width slots ensure consistent positioning
4. **Better Control Over UI**: More direct control over the layout and styling

## Implementation Steps

1. Create the `ParameterRow` component using `BaseHandle` directly
2. Modify `BaseNodeContent` to remove horizontal padding
3. Update node components to use the new pattern
4. Remove or deprecate the `LabeledHandle` component

## Example Visual Layout

```
┌────────────────────────────────────────┐
│ Node Title                             │
├────────────────────────────────────────┤
│ ┌─┐                                 ┌─┐ │
│ │H│  Parameter Label                │H│ │
│ └─┘  [=========Slider=========][Input] │
│                                        │
│ ┌─┐                                 ┌─┐ │
│ │H│  Another Parameter              │H│ │
│ └─┘  [=========Slider=========][Input] │
└────────────────────────────────────────┘
```

Where:

- `H` represents a handle (which may or may not be present)
- Fixed-width slots ensure consistent positioning of controls
- Labels and controls can be arranged flexibly within the center area

## Comparison with Current Approach

### Current Approach (LabeledHandle):

- Combines handle and label in one component
- Forces specific layout patterns
- Creates positioning issues with controls
- Less flexible for different control arrangements

### Proposed Approach (Direct BaseHandle):

- Separates handles from labels
- Allows flexible positioning of all elements
- Maintains consistent spacing with fixed-width slots
- Supports various control arrangements

This simplified approach provides greater flexibility while maintaining consistent layout across different node types and parameter configurations.
