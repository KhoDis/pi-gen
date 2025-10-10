/**
 * Removable Edge Component for the Pi-Gen project
 *
 * This component renders an edge with a delete button to remove connections.
 */

import React from "react";
import { EdgeProps } from "@xyflow/react";
import { ButtonEdge } from "@/features/edges/ButtonEdge";
import { useGraphStore } from "@/core/store/graphStore";
import { X } from "lucide-react";

/**
 * RemovableEdge component
 *
 * This component renders an edge with a delete button that allows users
 * to remove connections between nodes.
 */
export const RemovableEdge: React.FC<EdgeProps> = (props) => {
  const { id, data } = props;
  const removeEdge = useGraphStore((state) => state.removeEdge);

  // Check if the edge is hovered
  const isHovered = data?.isHovered || false;

  const handleRemove = () => {
    if (id) {
      removeEdge(id);
    }
  };

  return (
    <ButtonEdge {...props}>
      <div className="flex h-5 w-5 items-center justify-center">
        {isHovered && (
          <button
            className="flex h-5 w-5 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-100"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </ButtonEdge>
  );
};
