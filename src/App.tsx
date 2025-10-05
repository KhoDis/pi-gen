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

// Import from our new component structure
import { CircleNode } from "./components/nodes/CircleNode";
import { DisplayNode } from "./components/nodes/DisplayNode";
import { RGBA } from "./core/models/Layer";
import { useGraphStore } from "./core/store/graphStore";
import { NodeParams } from "./core/types/nodes";

// Define node types for ReactFlow
const nodeTypes: NodeTypes = {
  circle: CircleNode,
  display: DisplayNode,
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
  {
    id: "output1",
    type: "display",
    position: { x: 400, y: 100 },
    data: {
      params: {},
    },
  },
];

// Initial edges connecting the nodes
const initialEdges: Edge[] = [
  {
    id: "edge1",
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

  // Graph store state
  const graphNodes = useGraphStore((state) => state.nodes);
  const graphEdges = useGraphStore((state) => state.edges);
  const addNode = useGraphStore((state) => state.addNode);
  const addEdgeToStore = useGraphStore((state) => state.addEdge);

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
