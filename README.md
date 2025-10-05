# Pi-Gen: Node-Based Pixel Art Generator

Pi-Gen is a powerful, node-based pixel art generator inspired by Blender's geometry nodes. It allows artists and developers to create procedural pixel art through an intuitive visual programming interface.

## 🎨 Features

- **Node-Based Interface**: Create complex pixel art by connecting nodes in a visual graph
- **Real-Time Preview**: See your changes instantly as you modify node parameters
- **Extensible Architecture**: Easily add new node types to expand functionality
- **Type-Safe Design**: Robust type system ensures reliable node connections
- **Undo/Redo Support**: Full history management for your creative process

## 🧩 Node Types

Pi-Gen includes various node types for creating and manipulating pixel art:

- **Shape Nodes**: Generate basic shapes like circles
- **Color Nodes**: Manipulate colors and create gradients
- **Transform Nodes**: Position, scale, and rotate layers
- **Filter Nodes**: Apply effects and transformations to layers
- **Output Nodes**: Export your creations as images

## 🚀 Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/pi-gen.git

# Navigate to the project directory
cd pi-gen

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Creating Your First Pixel Art

1. Add a Circle node to the canvas
2. Adjust the radius and color parameters
3. Connect the Circle node to an Output node
4. Export your creation or continue building more complex designs

## 🛠️ Technical Architecture

Pi-Gen is built with a clean, modular architecture:

- **Core Engine**: Handles graph evaluation and node processing
- **Node Registry**: Manages node type registration and retrieval
- **Type System**: Provides type-safe connections between nodes
- **UI Components**: React components for the node editor interface
- **Store**: State management for the node graph and history

## 🧪 Development

### Project Structure

```
src/
├── components/     # UI components
│   ├── nodes/      # Node-specific components
│   └── ui/         # Generic UI components
├── core/           # Core engine
│   ├── engine/     # Graph evaluation
│   ├── models/     # Data models
│   ├── registry/   # Node type registry
│   ├── store/      # State management
│   └── types/      # Type definitions
├── edges/          # Edge components and logic
└── lib/            # Utility functions
```

### Adding New Node Types

To create a new node type:

1. Define the node parameters interface
2. Create a React component for the node UI
3. Implement the node evaluation function
4. Register the node type with the registry

Example:

```typescript
// Define parameters
interface MyNodeParams extends NodeParams {
  value: number;
}

// Create component
const MyNodeContent: React.FC<NodeComponentProps> = ({ id, data }) => {
  // Component implementation
};

// Implement evaluator
function evaluateMyNode(ctx: EvaluationContext) {
  const value = ctx.getNumberInput("value");
  // Processing logic
  return { result: createNumberValue(value * 2) };
}

// Register node type
nodeRegistry.register({
  type: "myNode",
  label: "My Node",
  category: "Custom",
  description: "My custom node",
  inputs: [{ id: "value", label: "Value", type: "number", required: true }],
  outputs: [{ id: "result", label: "Result", type: "number", required: true }],
  defaultParams: { value: 0 },
  component: MyNodeContent,
  evaluate: evaluateMyNode,
});
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Inspired by Blender's geometry nodes system
- Built with React, TypeScript, and other open-source technologies
