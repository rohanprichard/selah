import Link from "next/link";
import { Copy, Edit3, Music, Printer, Settings2, Share2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { FONT_SIZE_ORDER, type FontSize } from "./constants";
import { FontSizeMenu } from "./font-size-menu";
import { TransposeControls } from "./transpose-controls";

type ToolbarProps = {
  songId: string;
  isOwner: boolean;
  canRemix: boolean;
  transposeSteps: number;
  onTranspose: (amount: number) => void;
  showChords: boolean;
  onToggleChords: () => void;
  fontSize: FontSize;
  onFontSize: (size: FontSize) => void;
  onEnterLiveMode: () => void;
  onCopyLyrics: () => void;
  onShare: () => void;
  onPrint: () => void;
};

export function Toolbar({
  songId,
  isOwner,
  canRemix,
  transposeSteps,
  onTranspose,
  showChords,
  onToggleChords,
  fontSize,
  onFontSize,
  onEnterLiveMode,
  onCopyLyrics,
  onShare,
  onPrint,
}: ToolbarProps) {
  return (
    <div className="sticky top-20 z-40 -mx-4 px-4 sm:mx-0 sm:px-0 print:hidden">
      <div className="glass rounded-xl p-2 flex items-center justify-between gap-2 shadow-lg">
        <div className="flex items-center gap-2">
          <TransposeControls
            onDecrease={() => onTranspose(-1)}
            onIncrease={() => onTranspose(1)}
            value={transposeSteps}
          />
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-1">
            <Button
              variant={showChords ? "secondary" : "ghost"}
              size="sm"
              onClick={onToggleChords}
              className="h-8 px-3"
            >
              <Music className="mr-2 h-4 w-4" />
              {showChords ? "Chords On" : "Chords Off"}
            </Button>
            <FontSizeMenu value={fontSize} onChange={onFontSize} />
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Mobile Menu for extra controls */}
          <div className="sm:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-sm font-medium">Chords</span>
                    <Button
                      variant={showChords ? "default" : "outline"}
                      size="sm"
                      onClick={onToggleChords}
                      className="h-7 text-xs"
                    >
                      {showChords ? "On" : "Off"}
                    </Button>
                  </div>
                  <Separator />
                  <div className="px-2 py-1">
                    <span className="text-sm font-medium mb-2 block">Font Size</span>
                    <div className="flex gap-1">
                      {FONT_SIZE_ORDER.map((size) => (
                        <Button
                          key={size}
                          variant={fontSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => onFontSize(size)}
                          className="h-7 flex-1 text-xs"
                        >
                          {size.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Separator orientation="vertical" className="h-6 hidden sm:block" />

          <Button
            variant="ghost"
            size="sm"
            onClick={onEnterLiveMode}
            className="h-8 px-3 font-medium"
            title="Enter Live Mode"
          >
            Live Mode
          </Button>

          <Button variant="ghost" size="icon" onClick={onCopyLyrics} title="Copy lyrics" className="h-8 w-8">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onShare} title="Share" className="h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onPrint} title="Print" className="h-8 w-8">
            <Printer className="h-4 w-4" />
          </Button>

          {canRemix && (
            <Button asChild variant="ghost" size="icon" title="Remix" className="h-8 w-8">
              <Link href={`/songs/${songId}/remix`}>
                <Wand2 className="h-4 w-4" />
              </Link>
            </Button>
          )}

          {isOwner && (
            <Button asChild variant="default" size="sm" className="h-8 px-3 ml-1">
              <Link href={`/songs/${songId}/edit`}>
                <Edit3 className="mr-2 h-3 w-3" /> Edit
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
