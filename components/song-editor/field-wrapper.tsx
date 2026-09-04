import * as React from "react";

import { Label } from "@/components/ui/label";

export function Field({
  label,
  children,
  error,
  helper,
  required,
}: {
  label: string;
  children: React.ReactNode;
  error?: string[];
  helper?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium">
        {label}
        {required ? <span className="ml-1 text-destructive">*</span> : null}
      </Label>
      {children}
      {helper ? <p className="text-xs text-muted-foreground">{helper}</p> : null}
      {error ? <ErrorText>{error.join(" ")}</ErrorText> : null}
    </div>
  );
}

export function ErrorText({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-destructive">{children}</p>;
}
