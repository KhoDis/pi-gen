# Clean Architecture for Pi-Gen

This document outlines a cleaner architecture and component structure for the Pi-Gen project, addressing the issues identified in the architecture analysis.

## Architecture Overview

The proposed architecture follows a clean, layered approach with clear separation of concerns:

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

- **StateStore**: Manages application state (using Redux or Context API)
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
    /edges             # Edge UI components
    /canvas            # Canvas UI components
    /controls          # Control panel components
  /services            # Application services
    /node              # Node-related services
    /graph             # Graph-related services
    /rendering         # Rendering-related services
  /domain              # Domain models and logic
    /models            # Domain models
    /evaluators        # Node evaluation logic
  /infrastructure      # Infrastructure services
    /state             # State management
    /persistence       # Persistence services
    /rendering         # Low-level rendering
  /utils               # Utility functions
  /hooks               # Custom React hooks
  /types               # TypeScript type definitions
  /constants           # Constants and configuration
```

## Key Interfaces

### NodeType Interface

```typescript
interface NodeType {
  id: string;
  name: string;
  category: string;
  description: string;
  inputs: InputDefinition[];
  outputs: OutputDefinition[];
  defaultValues: Record<string, any>;
  evaluate: (inputs: Record<string, any>) => Record<string, any>;
  render: (props: NodeRenderProps) => JSX.Element;
}

interface InputDefinition {
  id: string;
  name: string;
  type: ValueType;
  required: boolean;
  defaultValue?: any;
}

interface OutputDefinition {
  id: string;
  name: string;
  type: ValueType;
}

type ValueType =
  | "number"
  | "color"
  | "layer"
  | "boolean"
  | "string"
  | "vector2";
```

### Node Interface

```typescript
interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    values: Record<string, any>;
  };
}
```

### Graph Interface

```typescript
interface Graph {
  nodes: Node[];
  edges: Edge[];
}

interface Edge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}
```

### Layer Interface

```typescript
interface Layer {
  width: number;
  height: number;
  setPixel(x: number, y: number, color: RGBA): void;
  getPixel(x: number, y: number): RGBA;
  clear(color?: RGBA): void;
  toImageData(): ImageData;
}

interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}
```

This clean architecture provides a solid foundation for the Pi-Gen project, addressing the issues identified in the current implementation while providing a clear path for future development.
