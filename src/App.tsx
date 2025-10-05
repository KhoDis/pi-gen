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
import { CircleNode } from "./components/nodes/CircleNode";
import { RGBA } from "./core/models/Layer";

// Define node types for ReactFlow
const nodeTypes: NodeTypes = {
  circle: CircleNode,
};

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
];

// Initial edges connecting the nodes
const initialEdges: Edge[] = [];

export default function App() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Handle connections between nodes
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((edges) => addEdge(connection, edges)),
    [setEdges],
  );

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
