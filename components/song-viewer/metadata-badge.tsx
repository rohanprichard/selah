export function MetadataBadge({ label, value, secondary }: { label: string; value: string; secondary?: string }) {
  return (
    <div className="inline-flex flex-col rounded-md border border-border bg-muted/30 px-3 py-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className="text-sm font-semibold text-foreground">{value}</span>
        {secondary && <span className="text-[10px] text-muted-foreground truncate max-w-[100px]" title={secondary}>{secondary}</span>}
      </div>
    </div>
  );
}
