import { Card, CardTitle, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

export function BaseNode({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="w-48 shadow-md p-2">
      <div className="m-0 bg-blue-500">
        <CardTitle className="text-sm font-medium p-0">{title}</CardTitle>
      </div>
      <CardContent className="p-3 pt-0">{children}</CardContent>
    </Card>
  );
}
