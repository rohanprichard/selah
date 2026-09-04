import { Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FONT_SIZE_ORDER, type FontSize } from "./constants";

export function FontSizeMenu({ value, onChange }: { value: FontSize; onChange: (v: FontSize) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3">
          <Type className="mr-2 h-4 w-4" />
          <span className="uppercase">{value}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2">
        <div className="grid grid-cols-4 gap-1">
          {FONT_SIZE_ORDER.map((size) => (
            <Button
              key={size}
              variant={value === size ? "default" : "ghost"}
              size="sm"
              onClick={() => onChange(size)}
              className="h-8 w-full text-xs font-bold"
            >
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
