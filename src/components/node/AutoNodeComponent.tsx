import React, { useCallback, useMemo } from "react";
import { nodeRegistry } from "@/core/registry/NodeRegistry";
import { useGraphStore } from "@/core/store/graphStore";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base/BaseNode";
import { NodeInput } from "@/components/ui/node-input";
import { NodeOutput } from "@/components/ui/node-output";
import { NumberParameter } from "@/components/ui/number-parameter";
import { ColorParameter } from "@/components/ui/color-parameter";
import { Input } from "@/components/ui/input";
import type { NodeComponentProps } from "@/core/registry/NodeRegistry";
import type { RGBA } from "@/core/models";

/**
 * AutoNodeComponent renders a node UI automatically from its registry config.
 * - Editable types (when not connected): number, color, boolean, string.
 * - Non-editable types (e.g., layer): show connection slot only.
 * - When an input is connected, we show a Connected indicator instead of the control.
 */
export const AutoNodeComponent: React.FC<NodeComponentProps> = React.memo(
  ({ id }) => {
    const getNode = useGraphStore((s) => s.getNode);
    const updateNodeParams = useGraphStore((s) => s.updateNodeParams);
    const edges = useGraphStore((s) => s.edges);

    const node = getNode(id);

    const config = useMemo(() => {
      if (!node) return undefined;
      return nodeRegistry.get(node.type);
    }, [node]);

    const connectedInputs = useMemo(() => {
      if (!node) return new Set<string>();
      const set = new Set<string>();
      for (const e of edges) {
        if (e.target === node.id) set.add(e.targetHandle);
      }
      return set;
    }, [edges, node]);

    const onParamChange = useCallback(
      (paramId: string, value: unknown) => {
        updateNodeParams(id, { [paramId]: value });
      },
      [id, updateNodeParams],
    );

    if (!node || !config) return null;

    const params = { ...config.defaultParams, ...node.data.params } as Record<
      string,
      unknown
    >;

    const isEditableType = (type: string) => {
      return (
        type === "number" ||
        type === "color" ||
        type === "boolean" ||
        type === "string"
      );
    };

    const renderParamControl = (
      paramId: string,
      label: string,
      type: string,
      value: unknown,
    ) => {
      const isConnected = connectedInputs.has(paramId);

      if (!isEditableType(type)) {
        // Non-editable types: only show the input slot/label
        return (
          <NodeInput key={paramId} id={paramId} label={label}>
            <div className="text-xs text-muted-foreground">
              Connect an input
            </div>
          </NodeInput>
        );
      }

      if (isConnected) {
        return (
          <NodeInput key={paramId} id={paramId} label={label}>
            <div className="text-xs text-muted-foreground">Connected</div>
          </NodeInput>
        );
      }

      if (type === "number") {
        return (
          <NumberParameter
            key={paramId}
            id={paramId}
            label={label}
            value={Number(value ?? 0)}
            onChange={(v) => onParamChange(paramId, v)}
          />
        );
      }

      if (type === "color") {
        return (
          <ColorParameter
            key={paramId}
            id={paramId}
            label={label}
            value={(value as RGBA) ?? { r: 255, g: 0, b: 0, a: 1 }}
            onChange={(v) => onParamChange(paramId, v)}
          />
        );
      }

      if (type === "boolean") {
        return (
          <NodeInput key={paramId} id={paramId} label={label}>
            <input
              type="checkbox"
              checked={Boolean(value)}
              onChange={(e) => onParamChange(paramId, e.target.checked)}
            />
          </NodeInput>
        );
      }

      // string fallback
      return (
        <NodeInput key={paramId} id={paramId} label={label}>
          <Input
            value={String(value ?? "")}
            onChange={(e) => onParamChange(paramId, e.target.value)}
            className="w-full h-8"
          />
        </NodeInput>
      );
    };

    return (
      <BaseNode className="w-[260px]">
        <BaseNodeHeader className="border-b">
          <BaseNodeHeaderTitle>{config.label}</BaseNodeHeaderTitle>
        </BaseNodeHeader>

        <BaseNodeContent>
          {config.inputs.map((inp) =>
            renderParamControl(inp.id, inp.label, inp.type, params[inp.id]),
          )}
        </BaseNodeContent>

        <BaseNodeFooter>
          {config.outputs.map((outp) => (
            <NodeOutput key={outp.id} id={outp.id} label={outp.label} />
          ))}
        </BaseNodeFooter>
      </BaseNode>
    );
  },
);

export default AutoNodeComponent;
