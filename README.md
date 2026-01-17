# Pi-Gen: Node-Based Pixel Art Generator

<img width="1280" height="809" alt="изображение" src="https://github.com/user-attachments/assets/fffca8e3-b2cc-47d1-98e4-3169338df109" />

Pi-Gen is a generative pixel art creation tool inspired by Blender's geometry nodes. It provides a visual, node-based interface for creating procedural pixel art.

## Features

- **Node-Based Interface**: Create complex pixel art by connecting nodes together
- **Real-Time Preview**: See your changes instantly as you modify parameters
- **Procedural Generation**: Generate art through algorithms rather than manual pixel placement
- **Exportable Results**: Save your creations as PNG images

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/pi-gen.git
   cd pi-gen
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## How to Use

1. **Add Nodes**: Right-click on the canvas to add new nodes
2. **Connect Nodes**: Drag from an output handle to an input handle to create connections
3. **Adjust Parameters**: Modify node parameters using the controls in each node
4. **View Output**: The Output node displays the final result
5. **Export**: Use the Download button in the Output node to save your creation

## Available Nodes

### Shape Nodes

- **Circle**: Creates a circular shape with adjustable radius and color

### Output Nodes

- **Output**: Displays and exports the final image

## Architecture

Pi-Gen is built with a clean, type-safe architecture following separation of concerns principles:

### Core Architecture

- **UI Layer**: React components for rendering nodes, handles, and the canvas
  - Located in `src/components/`
  - Specialized UI components in `src/components/ui/`
  - Node components in `src/components/nodes/`

- **Domain Layer**: Core business logic and entities
  - Located in `src/core/models/` and `src/core/types/`
  - Layer class for pixel manipulation
  - Value types for type-safe data handling

- **Application Layer**: Services for managing nodes, graphs, and rendering
  - Located in `src/core/registry/` and `src/core/engine/`
  - NodeRegistry for managing node types
  - GraphEvaluator for evaluating the node graph

- **State Management**: Zustand store for application state
  - Located in `src/core/store/`
  - GraphStore for managing nodes and edges

### Component Architecture

The UI components follow a specialized, composable architecture:

- **Base Components**:
  - `BaseNode`: The foundation for all node components
  - `BaseNodeHeader`: Consistent header for nodes
  - `BaseNodeContent`: Content area with proper padding for handles
  - `BaseNodeFooter`: Footer area for nodes

- **Parameter Components**:
  - `NodeInput`: Specialized component for input parameters with left-side handles
  - `NodeOutput`: Specialized component for output parameters with right-side handles
  - `NumberParameter`: Component for numeric inputs with slider and input field
  - `ColorParameter`: Component for color inputs with color picker

This architecture ensures consistent styling and behavior across all nodes while providing a clean, type-safe API for node developers.

The system uses a registry pattern for node types, allowing for easy extension with new node types.

## Technologies

- **React**: UI framework for building the interface
- **TypeScript**: Type-safe programming language with strong typing
- **ReactFlow (@xyflow/react)**: Node-based interface library for the graph editor
- **Vite**: Fast build tool and development server
- **shadcn/ui**: Customizable UI component library
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first CSS framework

## Contributing

Contributions are welcome! Here's how you can contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Roadmap

### Phase 1: Core Functionality

- Add Rectangle node
- Add Color and Number utility nodes
- Implement proper undo/redo functionality
- Add project saving/loading

### Phase 2: Enhanced Features

- Add transformation nodes (Scale, Rotate, etc.)
- Add filter nodes (Blur, Sharpen, etc.)
- Support for layers and compositing
- Implement node groups for better organization

### Phase 3: Advanced Features

- Add animation capabilities
- Add pattern generation nodes
- Implement custom node creation
- Add export to multiple formats
