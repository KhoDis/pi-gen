import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type NodeTypes,
  type Node,
  type Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

// Import from our new component structure
import { nodeRegistry } from "./core/registry/NodeRegistry";
import { RGBA } from "./core/models/Layer";

// Create initial nodes using our new architecture
const initialNodes: Node[] = [
  {
    id: "circle1",
    type: "circle",
    position: { x: 100, y: 100 },
    data: {
      params: {
        radius: 50,
        color: { r: 255, g: 0, b: 0, a: 1 } as RGBA,
      },
    },
  },
  {
    id: "output1",
    type: "output",
    position: { x: 400, y: 100 },
    data: {
      params: {
        width: 32,
        height: 32,
        scale: 3,
      },
    },
  },
];

// Initial edges connecting the nodes
const initialEdges: Edge[] = [
  {
    id: "circle1-output1",
    source: "circle1",
    sourceHandle: "layer",
    target: "output1",
    targetHandle: "layer",
    animated: true,
  },
];

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle connections between nodes
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges],
  );

  // Get node types from registry
  const nodeTypes = nodeRegistry.getComponentTypes() as unknown as NodeTypes;

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        maxZoom={1.5}
        minZoom={0.5}
      >
        <Background />
        <MiniMap />
        <Controls />
      </ReactFlow>
    </div>
  );
}
