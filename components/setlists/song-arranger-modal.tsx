"use client";

import * as React from "react";
import type { ArrangementItem, CustomSectionData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, ArrowUp, Loader2, Plus, Trash2, X, FileText, Copy } from "lucide-react";

type SongSection = {
  id: string;
  type: string;
  label: string;
  order_index: number;
};

type InternalArrangementItem = {
  tempId: string;
  data: ArrangementItem;
  isCustom: boolean;
  displayLabel: string;
  displayType: string;
};

type SongArrangerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sections: SongSection[];
  initialArrangement?: ArrangementItem[] | null;
  onSave: (arrangement: ArrangementItem[] | null) => void | Promise<void>;
  isLoading?: boolean;
};

export function SongArrangerModal({
  open,
  onOpenChange,
  sections,
  initialArrangement,
  onSave,
  isLoading = false,
}: SongArrangerModalProps) {
  const [arrangement, setArrangement] = React.useState<InternalArrangementItem[]>(() =>
    buildInitialArrangement(sections, initialArrangement),
  );
  const [showCustomForm, setShowCustomForm] = React.useState(false);
  const [customType, setCustomType] = React.useState<'text' | 'copy'>('text');
  const [customLabel, setCustomLabel] = React.useState("");
  const [customContent, setCustomContent] = React.useState("");
  const [customSectionIndex, setCustomSectionIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (open) {
      setArrangement(buildInitialArrangement(sections, initialArrangement));
      setShowCustomForm(false);
      setCustomType('text');
      setCustomLabel("");
      setCustomContent("");
      setCustomSectionIndex(null);
    }
  }, [open, sections, initialArrangement]);

  const handleAddSection = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    if (!section) return;

    setArrangement((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        data: sectionIndex,
        isCustom: false,
        displayLabel: section.label,
        displayType: section.type,
      },
    ]);
  };

  const handleAddCustomSection = () => {
    if (customType === 'copy' && customSectionIndex === null) return;
    if (customType === 'text' && !customLabel.trim()) return;

    const customData: CustomSectionData = customType === 'copy' && customSectionIndex !== null
      ? {
          type: 'custom',
          label: sections[customSectionIndex]?.label || '',
          sectionIndex: customSectionIndex,
        }
      : {
          type: 'custom',
          label: customLabel.trim(),
          content: customContent.trim() || undefined,
        };

    const displayLabel = customType === 'copy' && customSectionIndex !== null
      ? `${sections[customSectionIndex]?.label} (Copy)`
      : customData.label;

    setArrangement((prev) => [
      ...prev,
      {
        tempId: crypto.randomUUID(),
        data: customData,
        isCustom: true,
        displayLabel,
        displayType: 'custom',
      },
    ]);

    setCustomLabel("");
    setCustomContent("");
    setCustomSectionIndex(null);
    setShowCustomForm(false);
  };

  const handleRemoveItem = (tempId: string) => {
    setArrangement((prev) => prev.filter((item) => item.tempId !== tempId));
  };

  const handleMoveItem = (tempId: string, direction: "up" | "down") => {
    setArrangement((prev) => {
      const index = prev.findIndex((item) => item.tempId === tempId);
      if (index === -1) return prev;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const newArrangement = [...prev];
      [newArrangement[index], newArrangement[targetIndex]] = [
        newArrangement[targetIndex],
        newArrangement[index],
      ];
      return newArrangement;
    });
  };

  const handleReset = () => {
    setArrangement([]);
  };

  const handleSave = async () => {
    const arrangementData =
      arrangement.length > 0 ? arrangement.map((item) => item.data) : null;
    await onSave(arrangementData);
  };

  const isArrangementEmpty = arrangement.length === 0;
  const isArrangementDefault =
    arrangement.length === sections.length &&
    arrangement.every((item, idx) => !item.isCustom && item.data === idx);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Arrange Song Sections</h2>
            <p className="text-sm text-muted-foreground">
              Build a custom arrangement by adding sections in the order you want them to appear. You
              can repeat sections as many times as needed.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left panel: Available sections */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Available Sections
                </h3>
                <span className="text-xs text-muted-foreground">{sections.length} sections</span>
              </div>
              <div className="space-y-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between rounded-md border border-border bg-card p-3"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="uppercase">
                        {section.type}
                      </Badge>
                      <span className="text-sm font-medium">{section.label}</span>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleAddSection(index)}
                      title={`Add ${section.label}`}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add {section.label}</span>
                    </Button>
                  </div>
                ))}
              </div>

              {/* Custom section form */}
              <div className="mt-4 space-y-3 rounded-md border border-dashed border-border p-3">
                {!showCustomForm ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowCustomForm(true)}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Create Custom Section
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={customType === 'text' ? 'default' : 'outline'}
                          onClick={() => setCustomType('text')}
                          className="flex-1"
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Custom Text
                        </Button>
                        <Button
                          size="sm"
                          variant={customType === 'copy' ? 'default' : 'outline'}
                          onClick={() => setCustomType('copy')}
                          className="flex-1"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Section
                        </Button>
                      </div>
                    </div>
                    {customType === 'copy' ? (
                      <div className="space-y-2">
                        <Label htmlFor="custom-section-select">Select Section</Label>
                        <Select
                          value={customSectionIndex !== null ? String(customSectionIndex) : undefined}
                          onValueChange={(value) => setCustomSectionIndex(Number(value))}
                        >
                          <SelectTrigger id="custom-section-select">
                            <SelectValue placeholder="Choose a section to copy" />
                          </SelectTrigger>
                          <SelectContent>
                            {sections.map((section, index) => (
                              <SelectItem key={section.id} value={String(index)}>
                                {section.type} - {section.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="custom-label">Label</Label>
                          <Input
                            id="custom-label"
                            placeholder="e.g., Prayer, Sermon, Offering"
                            value={customLabel}
                            onChange={(e) => setCustomLabel(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="custom-content">Content (optional)</Label>
                          <Textarea
                            id="custom-content"
                            placeholder="Optional notes or instructions..."
                            value={customContent}
                            onChange={(e) => setCustomContent(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAddCustomSection}
                        disabled={customType === 'copy' ? customSectionIndex === null : !customLabel.trim()}
                      >
                        Add to Arrangement
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowCustomForm(false);
                          setCustomType('text');
                          setCustomLabel("");
                          setCustomContent("");
                          setCustomSectionIndex(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right panel: Arranged sequence */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Arrangement
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {arrangement.length} {arrangement.length === 1 ? "section" : "sections"}
                  </span>
                  {arrangement.length > 0 && (
                    <Button size="sm" variant="ghost" onClick={handleReset}>
                      Reset
                    </Button>
                  )}
                </div>
              </div>

              {arrangement.length === 0 ? (
                <div className="flex h-48 items-center justify-center rounded-md border-2 border-dashed border-muted-foreground/25 text-center text-sm text-muted-foreground">
                  Add sections from the left to build your arrangement
                </div>
              ) : (
                <div className="space-y-2">
                  {arrangement.map((item, index) => (
                    <div
                      key={item.tempId}
                      className="flex items-center gap-2 rounded-md border border-border bg-card p-2"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleMoveItem(item.tempId, "up")}
                          disabled={index === 0}
                          title="Move up"
                        >
                          <ArrowUp className="h-3 w-3" />
                          <span className="sr-only">Move up</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => handleMoveItem(item.tempId, "down")}
                          disabled={index === arrangement.length - 1}
                          title="Move down"
                        >
                          <ArrowDown className="h-3 w-3" />
                          <span className="sr-only">Move down</span>
                        </Button>
                      </div>

                      <div className="flex flex-1 items-center gap-2">
                        <span className="text-xs text-muted-foreground w-6">{index + 1}.</span>
                        <Badge 
                          variant={item.isCustom ? "default" : "outline"} 
                          className="uppercase"
                        >
                          {item.displayType}
                        </Badge>
                        <span className="text-sm font-medium">{item.displayLabel}</span>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveItem(item.tempId)}
                        title="Remove"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save {isArrangementEmpty || isArrangementDefault ? "(original order)" : ""}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildInitialArrangement(
  sections: SongSection[],
  initialArrangement?: ArrangementItem[] | null,
): InternalArrangementItem[] {
  if (!initialArrangement || initialArrangement.length === 0) {
    return [];
  }

  return initialArrangement.map((item) => {
    if (typeof item === 'number') {
      const section = sections[item];
      return {
        tempId: crypto.randomUUID(),
        data: item,
        isCustom: false,
        displayLabel: section?.label || `Section ${item}`,
        displayType: section?.type || 'unknown',
      };
    } else {
      // Custom section
      const displayLabel = item.sectionIndex !== undefined
        ? `${sections[item.sectionIndex]?.label || item.label} (Copy)`
        : item.label;
      
      return {
        tempId: crypto.randomUUID(),
        data: item,
        isCustom: true,
        displayLabel,
        displayType: 'custom',
      };
    }
  });
}
