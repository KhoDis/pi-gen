# Pi-Gen Architecture Analysis

## Current Architecture Problems and Pain Points

After analyzing the codebase, I've identified several architectural issues that make the project difficult to maintain and extend:

### 1. Tight Coupling Between Components

- **UI and Logic Mixing**: Node components (CircleNode, OutputNode) mix UI rendering with data handling.
- **Direct Dependencies**: Components directly import and use other components, creating tight coupling.
- **Evaluation Logic in UI**: The OutputNode component contains evaluation logic that should be separated.

### 2. Complex Type System

- **Overly Complex Types**: The type system (TypedValue, HandleType, etc.) is unnecessarily complex for the current functionality.
- **Type Casting**: Frequent need for type assertions and checks (e.g., `as AppNode[]`, `isLayerValue`).
- **Rigid Node Types**: Adding new node types requires changes in multiple files (types.ts, index.ts, evaluators).

### 3. Inefficient Evaluation System

- **Recursive Evaluation**: The graph evaluator uses a recursive approach that could lead to stack overflow with complex graphs.
- **Error Handling**: Poor error handling with generic error messages that don't provide useful debugging information.
- **Manual Cache Management**: The caching system is manually implemented and could be optimized.

### 4. Poor State Management

- **Global Event Listeners**: Using window events (`graph-updated`) for state updates is not ideal.
- **Imperative Updates**: Node updates are handled imperatively rather than through a declarative approach.
- **No Central State**: Lack of a central state management system makes it hard to track changes.

### 5. Limited Extensibility

- **Hard-coded Node Types**: Node types are hard-coded in multiple places.
- **No Plugin System**: No way to easily add new node types without modifying core code.
- **Limited Node Interactions**: No support for node grouping, copying, or other advanced interactions.

### 6. UI/UX Issues

- **Fixed Positioning**: Nodes have fixed positions in the initial setup.
- **Limited Canvas Interaction**: No zooming, panning, or other canvas interactions.
- **No Visual Feedback**: No visual feedback for connections or operations.

### 7. Code Organization

- **Inconsistent File Structure**: Some components are in their own files, others are grouped.
- **No Clear Separation of Concerns**: UI, logic, and state management are mixed together.
- **Duplicate Code**: Similar patterns repeated across components.

## Core Functionality and Goals

The core functionality of Pi-Gen is to provide a node-based editor for creating pixel art. The main goals appear to be:

1. **Visual Node-Based Editing**: Allow users to create and connect nodes in a visual graph.
2. **Real-Time Rendering**: Provide immediate visual feedback as nodes are connected and parameters are adjusted.
3. **Type-Safe Connections**: Ensure that only compatible node inputs/outputs can be connected.
4. **Extensible Node System**: Support for adding new node types to expand functionality.
5. **Pixel Art Generation**: Generate pixel art based on the node graph configuration.

The project aims to be similar to Blender's geometry nodes system but focused on 2D pixel art generation.

## Current Implementation Approach

The current implementation uses:

1. **React and TypeScript**: For UI components and type safety.
2. **ReactFlow**: For the node graph visualization and interaction.
3. **Custom Evaluation System**: A custom graph evaluator that processes nodes in dependency order.
4. **Layer-Based Rendering**: A Layer class that manages pixel data and converts to ImageData for canvas rendering.

While this approach can work, it has several limitations and could be significantly improved with a better architecture.
