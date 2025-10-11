import { useCallback, useEffect, useState } from "react";
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
import { edgeTypes } from "@/features/edges";

// Import node components
// Auto-register all nodes via glob side-effects
import "@/features/graph/nodes/auto-register";

// Import core types and stores
import { RGBA } from "@/core/models";
import { useGraphStore } from "@/core/store/graphStore";
import {
  useHistoryStore,
  createAddEdgeCommand,
  createRemoveEdgeCommand,
  createRemoveNodeCommand,
  createUpdateNodePositionCommand,
} from "@/core/store/historyStore";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import AutoNodeComponent from "@/components/node/AutoNodeComponent";
import NodePalette from "@/features/graph/components/NodePalette";
import GraphActions from "@/features/graph/components/GraphActions";

// Define node types for ReactFlow
// Build nodeTypes map from registry, falling back to AutoNodeComponent
const nodeTypes: NodeTypes = (() => {
  const components = nodeRegistry.getComponentTypes();
  // Collect all registered types
  const all = nodeRegistry.getAll();
  const map: Record<string, any> = {};
  for (const entry of all) {
    map[entry.type] = components[entry.type] ?? AutoNodeComponent;
  }
  return map as NodeTypes;
})();

// Initial graph setup - only used for first-time initialization
const setupInitialGraph = (addNode: any, addEdgeToStore: any) => {
  // Color node
  const color1 = addNode(
    "color",
    { x: 100, y: 100 },
    {
      color: { r: 255, g: 0, b: 0, a: 1 } as RGBA,
    },
  );

  // Number node for radius
  const number1 = addNode(
    "number",
    { x: 100, y: 250 },
    {
      value: 30,
    },
  );

  // Circle node
  const circle1 = addNode(
    "circle",
    { x: 400, y: 100 },
    {
      radius: 30,
      color: { r: 255, g: 0, b: 0, a: 1 } as RGBA,
    },
  );

  // Rectangle node
  addNode(
    "rectangle",
    { x: 400, y: 300 },
    {
      width: 40,
      height: 20,
      color: { r: 0, g: 128, b: 255, a: 1 } as RGBA,
    },
  );

  // Display node
  const output1 = addNode("display", { x: 700, y: 200 }, {});

  // Connect nodes
  addEdgeToStore(color1.id, "color", circle1.id, "color");
  addEdgeToStore(number1.id, "number", circle1.id, "radius");
  addEdgeToStore(circle1.id, "layer", output1.id, "layer");
};

export default function App() {
  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Graph and history store state
  const graphNodes = useGraphStore((state) => state.nodes);
  const graphEdges = useGraphStore((state) => state.edges);
  const addNode = useGraphStore((state) => state.addNode);
  const addEdgeToStore = useGraphStore((state) => state.addEdge);
  const execute = useHistoryStore((s) => s.execute);

  // History store for undo/redo
  const historyStore = useHistoryStore();
  const undo = historyStore.undo;
  const redo = historyStore.redo;
  const canUndo = historyStore.canUndo;
  const canRedo = historyStore.canRedo;

  // Initialize graph store with initial nodes and edges (only once)
  useEffect(() => {
    if (!initialized) {
      // Clear any existing nodes/edges
      useGraphStore.setState({ nodes: [], edges: [] });

      // Setup initial graph
      setupInitialGraph(addNode, addEdgeToStore);

      setInitialized(true);
    }
  }, [initialized, addNode, addEdgeToStore]);

  // Keyboard shortcuts for undo/redo and delete
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key === "z" &&
        !event.shiftKey
      ) {
        event.preventDefault();
        if (canUndo()) {
          undo();
        }
      }

      // Redo: Ctrl+Y or Ctrl+Shift+Z (Windows/Linux) or Cmd+Shift+Z (Mac)
      if (
        ((event.ctrlKey || event.metaKey) && event.key === "y") ||
        ((event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          event.key === "z")
      ) {
        event.preventDefault();
        if (canRedo()) {
          redo();
        }
      }

      // Delete: Delete or Backspace (for selected nodes)
      if (event.key === "Delete" || event.key === "Backspace") {
        const selectedNodes = nodes.filter((node) => node.selected);
        if (selectedNodes.length > 0) {
          event.preventDefault();
          selectedNodes.forEach((node) =>
            execute(createRemoveNodeCommand(node.id)),
          );
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo, nodes, execute]);

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
        execute(
          createAddEdgeCommand(
            connection.source,
            connection.sourceHandle || "",
            connection.target,
            connection.targetHandle || "",
          ),
        );
      }
    },
    [execute],
  );

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      execute(createUpdateNodePositionCommand(node.id, node.position));
    },
    [execute],
  );

  // Handle edge hover events
  const onEdgeMouseEnter = useCallback((_: React.MouseEvent, edge: Edge) => {
    setHoveredEdgeId(edge.id);
  }, []);

  const onEdgeMouseLeave = useCallback(() => {
    setHoveredEdgeId(null);
  }, []);

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((n) => execute(createRemoveNodeCommand(n.id)));
    },
    [execute],
  );

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      deleted.forEach((e) => execute(createRemoveEdgeCommand(e.id)));
    },
    [execute],
  );

  // Update edges with hovered state
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        data: {
          ...edge.data,
          isHovered: edge.id === hoveredEdgeId,
        },
      })),
    );
  }, [hoveredEdgeId, setEdges]);

  return (
    <div className="h-screen w-screen">
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onConnect={onConnect}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        fitView
        maxZoom={1.5}
        minZoom={0.5}
      >
        <Background />
        <MiniMap />
        <Controls />
        <NodePalette />
        <GraphActions />
      </ReactFlow>
    </div>
  );
}
