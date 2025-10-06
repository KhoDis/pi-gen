import { useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type NodeTypes,
  type Node,
  type Edge,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

// Import node components
import { CircleNode } from "./components/nodes/CircleNode";
import { RectangleNode } from "./components/nodes/RectangleNode";
import { ColorNode } from "./components/nodes/ColorNode";
import { NumberNode } from "./components/nodes/NumberNode";
import { DisplayNode } from "./components/nodes/DisplayNode";

// Import core types and stores
import { RGBA } from "./core/models/Layer";
import { useGraphStore } from "./core/store/graphStore";
import { useHistoryStore } from "./core/store/historyStore";
import { NodeParams } from "./core/types/nodes";

// Define node types for ReactFlow
const nodeTypes: NodeTypes = {
  circle: CircleNode,
  rectangle: RectangleNode,
  color: ColorNode,
  number: NumberNode,
  display: DisplayNode,
};

// Create initial nodes for a more comprehensive example
const initialNodes: Node[] = [
  // Color node
  {
    id: "color1",
    type: "color",
    position: { x: 100, y: 100 },
    data: {
      params: {
        color: { r: 255, g: 0, b: 0, a: 1 } as RGBA,
      },
    },
  },

  // Number node for radius
  {
    id: "number1",
    type: "number",
    position: { x: 100, y: 250 },
    data: {
      params: {
        value: 30,
        min: 1,
        max: 100,
      },
    },
  },

  // Circle node
  {
    id: "circle1",
    type: "circle",
    position: { x: 400, y: 100 },
    data: {
      params: {
        radius: 30,
        color: { r: 255, g: 0, b: 0, a: 1 } as RGBA,
      },
    },
  },

  // Rectangle node
  {
    id: "rectangle1",
    type: "rectangle",
    position: { x: 400, y: 300 },
    data: {
      params: {
        width: 40,
        height: 20,
        color: { r: 0, g: 128, b: 255, a: 1 } as RGBA,
      },
    },
  },

  // Display node
  {
    id: "output1",
    type: "display",
    position: { x: 700, y: 200 },
    data: {
      params: {},
    },
  },
];

// Initial edges connecting the nodes
const initialEdges: Edge[] = [
  // Connect color to circle
  {
    id: "edge1",
    source: "color1",
    sourceHandle: "color",
    target: "circle1",
    targetHandle: "color",
  },

  // Connect number to circle radius
  {
    id: "edge2",
    source: "number1",
    sourceHandle: "number",
    target: "circle1",
    targetHandle: "radius",
  },

  // Connect circle to display
  {
    id: "edge3",
    source: "circle1",
    sourceHandle: "layer",
    target: "output1",
    targetHandle: "layer",
  },
];

export default function App() {
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Graph and history store state
  const graphNodes = useGraphStore((state) => state.nodes);
  const graphEdges = useGraphStore((state) => state.edges);
  const addNode = useGraphStore((state) => state.addNode);
  const addEdgeToStore = useGraphStore((state) => state.addEdge);

  // History store for undo/redo (not fully implemented in UI yet)
  const historyStore = useHistoryStore();

  // Initialize graph store with initial nodes and edges
  useEffect(() => {
    // Clear any existing nodes/edges
    useGraphStore.setState({ nodes: [], edges: [] });

    // Add initial nodes to graph store
    initialNodes.forEach((node) => {
      if (node.type) {
        addNode(
          node.type,
          node.position,
          node.data.params as Partial<NodeParams>,
        );
      }
    });

    // Add initial edges to graph store
    initialEdges.forEach((edge) => {
      addEdgeToStore(
        edge.source,
        edge.sourceHandle || "",
        edge.target,
        edge.targetHandle || "",
      );
    });
  }, [addNode, addEdgeToStore]);

  // Sync graph store nodes to React Flow nodes
  useEffect(() => {
    if (graphNodes.length > 0) {
      // Convert graphNodes to the format expected by React Flow
      const reactFlowNodes = graphNodes.map((node) => ({
        ...node,
        data: { ...node.data }, // Ensure data is treated as a Record<string, unknown>
      })) as Node[];

      setNodes(reactFlowNodes);
    }
  }, [graphNodes, setNodes]);

  // Sync graph store edges to React Flow edges
  useEffect(() => {
    if (graphEdges.length > 0) {
      setEdges(graphEdges as Edge[]);
    }
  }, [graphEdges, setEdges]);

  // Handle connections between nodes
  const onConnect: OnConnect = useCallback(
    (connection) => {
      if (connection.source && connection.target) {
        addEdgeToStore(
          connection.source,
          connection.sourceHandle || "",
          connection.target,
          connection.targetHandle || "",
        );
      }
    },
    [addEdgeToStore],
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
