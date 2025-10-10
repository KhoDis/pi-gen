# Pi-Gen MVP Checklist

This document outlines the Minimum Viable Product (MVP) features for the Pi-Gen project, prioritized to achieve a functional and valuable pixel art generator with a node-based interface.

## Current Progress

After refactoring and cleanup, we have implemented:

- [x] **Node Graph Canvas**
  - [x] Basic canvas with zoom and pan functionality
  - [x] Node creation and deletion
  - [x] Node positioning and dragging
  - [x] Connection creation and deletion
  - [x] Type-safe connections (prevent incompatible connections)

- [x] **Core Node Types (Partial)**
  - [x] Display Node (renders final result)
  - [x] Circle Node (generates a circle shape)
  - [ ] Rectangle Node (generates a rectangle shape)
  - [ ] Color Node (provides a color value)
  - [ ] Number Node (provides a numeric value)

- [x] **Basic Evaluation System**
  - [x] Dependency-based evaluation
  - [x] Real-time updates when parameters change
  - [x] Basic error handling

- [x] **Rendering System**
  - [x] Canvas rendering of pixel art
  - [x] Pixel scaling options
  - [x] Basic Layer system for compositing

- [x] **UI Components**
  - [x] Node property editors (sliders, color pickers)
  - [ ] Basic toolbar for node creation
  - [x] Canvas controls (zoom, pan, reset view)

## Remaining MVP Features

### Phase 2: Enhanced Functionality (Should-Have)

These features enhance the usability and functionality of the application:

- [ ] **Additional Node Types**
  - [ ] Blend Node (combines multiple layers)
  - [ ] Transform Node (translate, rotate, scale)
  - [ ] Grid Node (generates a grid pattern)
  - [ ] Gradient Node (generates color gradients)

- [ ] **Advanced Evaluation**
  - [ ] Caching for performance
  - [ ] Selective re-evaluation (only evaluate affected nodes)
  - [ ] Better error reporting and visualization

- [ ] **State Management**
  - [ ] Undo/redo functionality
  - [ ] Project saving and loading
  - [ ] Export to PNG

- [ ] **Enhanced UI**
  - [ ] Node grouping
  - [ ] Node comments
  - [ ] Mini-map for navigation
  - [ ] Context menus for operations

### Phase 3: Polish and Extensions (Nice-to-Have)

These features add polish and extend the functionality:

- [ ] **Advanced Node Types**
  - [ ] Noise Node (generates procedural noise)
  - [ ] Pattern Node (generates repeating patterns)
  - [ ] Text Node (renders text as pixels)
  - [ ] Math Nodes (add, multiply, etc.)
  - [ ] Conditional Node (if-then-else logic)

- [ ] **Advanced Rendering**
  - [ ] Layer effects (blur, sharpen, etc.)
  - [ ] Pixel filters (pixelate, dither, etc.)
  - [ ] Animation support (keyframes, timeline)
  - [ ] Export to animated GIF

- [ ] **User Experience**
  - [ ] Node presets and templates
  - [ ] Node search and filtering
  - [ ] Keyboard shortcuts
  - [ ] Dark/light theme
  - [ ] Customizable UI layout

- [ ] **Community Features**
  - [ ] Share projects
  - [ ] Node library/marketplace
  - [ ] User galleries

## Implementation Priority Matrix

The following matrix helps prioritize implementation based on value and effort:

| Feature                 | Value  | Effort | Priority |
| ----------------------- | ------ | ------ | -------- |
| Node Graph Canvas       | High   | Medium | 1        |
| Core Node Types         | High   | Medium | 1        |
| Basic Evaluation System | High   | High   | 1        |
| Rendering System        | High   | Medium | 1        |
| UI Components           | Medium | Medium | 2        |
| Additional Node Types   | Medium | Medium | 3        |
| Advanced Evaluation     | Medium | High   | 4        |
| State Management        | High   | Medium | 2        |
| Enhanced UI             | Medium | Medium | 3        |
| Advanced Node Types     | Low    | High   | 5        |
| Advanced Rendering      | Medium | High   | 4        |
| User Experience         | Medium | Medium | 3        |
| Community Features      | Low    | High   | 6        |

## MVP Success Criteria

The MVP will be considered successful when:

1. Users can create a node graph with at least the core node types
2. Connections between nodes are type-safe and intuitive
3. The graph evaluates correctly and updates in real-time
4. The output node renders pixel art correctly
5. Users can save their work and export the resulting pixel art
6. The application is stable and performs well with moderate-sized graphs

## Implementation Plan for Remaining Features

### 1. Core Node Types

- [ ] Implement Rectangle Node
  - Similar to Circle Node but with width and height parameters
  - Add rectangle drawing logic to the evaluator
- [ ] Implement Color Node
  - Simple node that outputs a color value
  - Use the existing color picker component
- [ ] Implement Number Node
  - Simple node that outputs a numeric value
  - Use the existing number parameter component

### 2. UI Improvements

- [ ] Add node creation toolbar
  - Simple toolbar with buttons for each node type
  - Drag-and-drop functionality to create nodes

### 3. State Management

- [ ] Implement undo/redo functionality
  - Use command pattern for operations
  - Track history of operations
- [ ] Add project saving and loading
  - Serialize graph state to JSON
  - Load graph state from JSON

### 4. Testing and Refinement

- [ ] Test with various node combinations
- [ ] Fix any bugs or issues
- [ ] Optimize performance for larger graphs

## User Stories for MVP

1. "As a pixel artist, I want to create a circle with customizable radius and color so that I can use it as a building block for my pixel art."

2. "As a user, I want to connect nodes together to create more complex shapes and patterns so that I can create interesting pixel art compositions."

3. "As a designer, I want to adjust parameters in real-time and see the results immediately so that I can iterate quickly on my designs."

4. "As a creator, I want to save my node graph so that I can continue working on it later or share it with others."

5. "As an artist, I want to export my pixel art as a PNG file so that I can use it in other applications or share it online."

These user stories help guide the development of the MVP by focusing on the core user needs and experiences.
