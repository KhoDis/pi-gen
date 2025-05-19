import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { AppNode } from "@/nodes/types.ts";

function useNodeActions() {
  const { setNodes } = useReactFlow();

  const updateNodeData = useCallback(
    (id: string, newData: AppNode["data"]) => {
      setNodes((nodes) =>
        nodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: newData,
            };
          }
          return node;
        }),
      );
    },
    [setNodes],
  );

  return { updateNodeData };
}

export default useNodeActions;
