import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type TransposeControlsProps = {
  value: number;
  onIncrease: () => void;
  onDecrease: () => void;
};

export function TransposeControls({ value, onIncrease, onDecrease }: TransposeControlsProps) {
  return (
    <div className="flex items-center rounded-lg bg-background border border-border p-0.5">
      <Button type="button" size="icon" variant="ghost" onClick={onDecrease} className="h-7 w-7 rounded-md hover:bg-muted">
        <Minus className="h-3 w-3" />
        <span className="sr-only">Transpose down</span>
      </Button>
      <span className="w-8 text-center text-sm font-bold tabular-nums">{value > 0 ? `+${value}` : value}</span>
      <Button type="button" size="icon" variant="ghost" onClick={onIncrease} className="h-7 w-7 rounded-md hover:bg-muted">
        <Plus className="h-3 w-3" />
        <span className="sr-only">Transpose up</span>
      </Button>
    </div>
  );
}
