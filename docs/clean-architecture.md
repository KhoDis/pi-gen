# Clean Architecture for Pi-Gen

This document outlines the clean architecture implemented in the Pi-Gen project, providing a solid foundation for maintainability and extensibility.

## Architecture Overview

The implemented architecture follows a clean, layered approach with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐ │
│  │ NodeUI  │  │ EdgeUI  │  │ CanvasUI│  │ ControlPanelUI  │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     Application Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ NodeService │  │ GraphService│  │ RenderingService    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Domain Layer                            │
│  ┌─────────┐  ┌─────────┐  ┌─────────────┐  ┌─────────────┐ │
│  │ Node    │  │ Edge    │  │ Graph       │  │ Layer       │ │
│  └─────────┘  └─────────┘  └─────────────┘  └─────────────┘ │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                Infrastructure Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ StateStore  │  │ Persistence │  │ CanvasRenderer      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. UI Layer

Responsible for rendering the user interface and handling user interactions.

Components:

- **NodeUI**: Renders node components based on their type
- **EdgeUI**: Renders connections between nodes
- **CanvasUI**: Renders the canvas and handles canvas interactions
- **ControlPanelUI**: Renders control panels, toolbars, and property editors

### 2. Application Layer

Coordinates between the UI and domain layers, implementing application-specific logic.

Services:

- **NodeService**: Manages node creation, deletion, and updates
- **GraphService**: Manages the node graph, connections, and evaluation
- **RenderingService**: Coordinates rendering of the final output

### 3. Domain Layer

Contains the core business logic and entities.

Models:

- **Node**: Base class/interface for all node types
- **Edge**: Represents connections between nodes
- **Graph**: Represents the entire node graph
- **Layer**: Represents a layer of pixel data

### 4. Infrastructure Layer

Provides technical capabilities to support the other layers.

Services:

- **StateStore**: Manages application state (using Zustand)
- **Persistence**: Handles saving and loading node graphs
- **CanvasRenderer**: Handles low-level canvas rendering

## Component Structure

### Node System

```
┌─────────────────────────────────────────────────────────────┐
│                        NodeRegistry                          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ CircleNodeType  │  │ RectNodeType    │  │ OutputNode  │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        NodeFactory                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        NodeInstance                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Properties  │  │ Inputs      │  │ Outputs             │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **NodeRegistry**: Central registry for all node types
- **NodeType**: Definition of a node type (properties, inputs, outputs, evaluation function)
- **NodeFactory**: Creates node instances from node types
- **NodeInstance**: An instance of a node in the graph

### Evaluation System

```
┌─────────────────────────────────────────────────────────────┐
│                      GraphEvaluator                          │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ DependencySort  │  │ NodeEvaluator   │  │ ResultCache │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      EvaluationContext                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      EvaluationResult                        │
└─────────────────────────────────────────────────────────────┘
```

- **GraphEvaluator**: Coordinates the evaluation of the entire graph
- **DependencySort**: Sorts nodes based on their dependencies
- **NodeEvaluator**: Evaluates individual nodes
- **ResultCache**: Caches evaluation results for performance
- **EvaluationContext**: Provides context for node evaluation
- **EvaluationResult**: Represents the result of a node evaluation

### State Management

```
┌─────────────────────────────────────────────────────────────┐
│                        StateStore                            │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ NodeState       │  │ EdgeState       │  │ UIState     │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        ActionCreators                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Reducers                              │
└─────────────────────────────────────────────────────────────┘
```

- **StateStore**: Central store for application state
- **NodeState**: State related to nodes
- **EdgeState**: State related to edges
- **UIState**: State related to UI (selected nodes, zoom level, etc.)
- **ActionCreators**: Functions that create actions
- **Reducers**: Functions that update state based on actions

### Rendering System

```
┌─────────────────────────────────────────────────────────────┐
│                      RenderingService                        │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │ LayerRenderer   │  │ CanvasManager   │  │ ExportUtils │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

- **RenderingService**: Coordinates rendering operations
- **LayerRenderer**: Renders layers to canvas
- **CanvasManager**: Manages canvas state and operations
- **ExportUtils**: Utilities for exporting rendered images

## File Structure

```
/src
  /components          # UI components
    /nodes             # Node UI components
    /ui                # Reusable UI components
    /base-node.tsx     # Base node component
    /base-handle.tsx   # Base handle component
  /core                # Core functionality
    /engine            # Graph evaluation engine
      /GraphEvaluator.ts
    /models            # Domain models
      /Layer.ts
    /registry          # Node registry
      /NodeRegistry.ts
    /store             # State management
      /graphStore.ts
      /historyStore.ts
    /types             # TypeScript type definitions
      /nodes.ts
      /values.ts
      /evaluation.ts
    /hooks             # Custom React hooks
      /useNodeParams.ts
  /lib                 # Utility functions
    /utils.ts
  /edges               # Edge definitions
  /evaluators          # Node evaluation logic
```

## Key Interfaces

### NodeType Interface

```typescript
export interface NodeType<P extends NodeParams = NodeParams> {
  /**
   * Unique identifier for the node type
   */
  type: string;

  /**
   * Display name for the node type
   */
  label: string;

  /**
   * Category for grouping node types
   */
  category: string;

  /**
   * Description of the node type
   */
  description: string;

  /**
   * Input port definitions
   */
  inputs: Port[];

  /**
   * Output port definitions
   */
  outputs: Port[];

  /**
   * Default parameter values
   */
  defaultParams: P;

  /**
   * Component renderer function
   */
  component: React.ComponentType<{
    id: NodeId;
    data: NodeData<P>;
    selected: boolean;
  }>;

  /**
   * Evaluation function
   */
  evaluate: (ctx: EvaluationContext) => EvaluationResult;
}
```

### Value Types

```typescript
/**
 * Base interface for all value types
 */
export interface Value {
  readonly type: string;
  readonly value: unknown;
}

/**
 * Number value
 */
export interface NumberValue extends Value {
  readonly type: "number";
  readonly value: number;
}

/**
 * Color value (RGBA)
 */
export interface ColorValue extends Value {
  readonly type: "color";
  readonly value: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

/**
 * Layer value
 */
export interface LayerValue extends Value {
  readonly type: "layer";
  readonly value: Layer;
}
```

### Layer Implementation

```typescript
/**
 * Layer class for pixel manipulation
 */
export class Layer {
  readonly width: number;
  readonly height: number;
  private readonly pixels: Map<string, RGBA>;

  /**
   * Create a new Layer
   * @param width Width of the layer in pixels
   * @param height Height of the layer in pixels
   */
  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixels = new Map();
  }

  /**
   * Set a pixel at the specified coordinates
   * @param x X coordinate
   * @param y Y coordinate
   * @param color RGBA color
   */
  setPixel(x: number, y: number, color: RGBA): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.pixels.set(`${x}:${y}`, { ...color });
    }
  }

  /**
   * Get the color of a pixel at the specified coordinates
   * @param x X coordinate
   * @param y Y coordinate
   * @returns RGBA color or null if the pixel is not set
   */
  getPixel(x: number, y: number): RGBA | null {
    const pixel = this.pixels.get(`${x}:${y}`);
    return pixel ? { ...pixel } : null;
  }

  /**
   * Convert the layer to ImageData for canvas rendering
   * @returns ImageData representation of the layer
   */
  toImageData(): ImageData {
    // Implementation details...
  }
}
```

This clean architecture has been implemented in the Pi-Gen project, providing a solid foundation for maintainability and extensibility. The separation of concerns, type-safe interfaces, and modular design make it easy to add new features and node types.
