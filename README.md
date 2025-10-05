# Pi-Gen: Node-Based Pixel Art Generator

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

Pi-Gen is built with a clean, type-safe architecture:

- **Core Layer**: Contains the fundamental models, types, and evaluation logic
- **Node Layer**: Implements specific node types and their evaluation functions
- **UI Layer**: Provides the visual interface using React Flow

The system uses a registry pattern for node types, allowing for easy extension with new node types.

## Technologies

- **React**: UI framework
- **TypeScript**: Type-safe programming language
- **React Flow**: Node-based interface library
- **Vite**: Build tool and development server
- **shadcn/ui**: UI component library

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

- Add more shape nodes (Rectangle, Triangle, etc.)
- Implement transformation nodes (Scale, Rotate, etc.)
- Add filter nodes (Blur, Sharpen, etc.)
- Support for layers and compositing
- Add animation capabilities
- Implement node groups for better organization
- Add undo/redo functionality
