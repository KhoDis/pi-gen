# Pi-Gen: Node-Based Pixel Art Generator

Pi-Gen is a powerful, interactive node-based pixel art generator inspired by Blender's geometry nodes. It allows users to create pixel art by connecting different nodes in a visual graph, with real-time evaluation and rendering.

![Example Output](public/example.png)

## Features

- **Node-Based Workflow**: Create pixel art by connecting different nodes in a visual graph
- **Real-Time Evaluation**: Changes propagate through the node graph instantly
- **Type-Safe Connections**: Nodes communicate with typed values (numbers, colors, layers)
- **Customizable Canvas**: Adjust canvas size and pixel scaling
- **Modular Architecture**: Easily extendable with new node types

## Table of Contents

- [Installation](#installation)
- [Getting Started](#getting-started)
- [Node Types](#node-types)
- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/pi-gen.git
cd pi-gen

# Install dependencies
npm install

# Start development server
npm run dev
```

## Getting Started

1. After starting the development server, you'll see a node graph editor interface
2. Add nodes by right-clicking on the canvas and selecting a node type
3. Connect nodes by dragging from an output handle to an input handle
4. Configure node parameters using the controls in each node
5. The OutputNode displays the final rendered pixel art

## Node Types

### CircleNode

Creates a circular shape with:

- **Radius**: Adjustable from 1-50 pixels
- **Color**: Configurable RGBA color with alpha transparency
- **Output**: Produces a Layer that can be connected to other nodes

```
┌─────────────┐
│   Circle    │
├─────────────┤
│ Radius: 10  │
│ Color: #RGB │
│             │ ──► Layer
└─────────────┘
```

### OutputNode

Final rendering node that:

- **Input**: Takes a Layer input
- **Canvas Size**: Configurable width/height (1-256 pixels)
- **Scale**: Adjustable pixel scaling (1-20x)
- **Display**: Shows the generated pixel art

```
┌─────────────┐
│   Output    │
├─────────────┤
│ Width: 32   │
│ Height: 32  │
Layer ──► │ Scale: 3    │
│             │
│ [Rendered]  │
└─────────────┘
```

## How It Works

### Graph Construction

1. **Nodes**: Each node represents a specific operation or generator
2. **Connections**: Nodes are connected via handles (inputs/outputs)
3. **Types**: Each connection has a specific type (number, color, layer)

### Evaluation Process

1. **Dependency Resolution**: The graph evaluator processes nodes in dependency order
2. **Evaluation**: Each node type has a dedicated evaluator function
3. **Caching**: Results are cached for performance
4. **Propagation**: Changes trigger re-evaluation of dependent nodes

### Rendering

1. **Layer Creation**: Nodes generate or modify Layer objects
2. **Pixel Manipulation**: Layers contain pixel data with RGBA values
3. **Canvas Rendering**: The OutputNode converts the final Layer to ImageData
4. **Display**: Canvas displays the pixel art with crisp pixel scaling

## Architecture

Pi-Gen is built with a modular architecture that separates concerns:

### Core Components

- **Layer System**: The `Layer` class manages pixel data and provides methods for manipulation
- **Node System**: Defines node types, handles, and connections
- **Evaluation System**: Processes the node graph and computes results

### Technical Stack

- **React**: UI framework
- **TypeScript**: Type-safe development
- **ReactFlow**: Node graph visualization and interaction
- **Radix UI**: UI components
- **Vite**: Build tool and development server

## Development

```bash
# Run development server
npm run dev

# Run linter
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

- `/src/core`: Core functionality like the Layer system
- `/src/nodes`: Node definitions and implementations
- `/src/evaluators`: Node evaluation logic
- `/src/components`: UI components
- `/src/edges`: Edge definitions and custom edge types

### Adding New Node Types

To add a new node type:

1. Create a new node component in `/src/nodes`
2. Add an evaluator function in `/src/evaluators`
3. Register the node type in `/src/nodes/index.ts`
4. Register the evaluator in `/src/evaluators/index.ts`

## Future Development

Pi-Gen has several exciting possibilities for future development:

- **Additional Node Types**: More shape generators (rectangle, line, polygon)
- **Transformation Nodes**: Rotation, scaling, and translation operations
- **Filter Nodes**: Color adjustments, blur, pixelation effects
- **Animation Support**: Timeline-based animation of node parameters
- **Export Options**: PNG, GIF, and spritesheet export capabilities
- **Node Groups**: Ability to group nodes into reusable components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
