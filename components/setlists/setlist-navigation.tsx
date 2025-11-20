"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type SetlistNavigationProps = {
    prevHref?: string;
    nextHref?: string;
    position: number;
    total: number;
    setlistTitle: string;
};

export function SetlistNavigation({
    prevHref,
    nextHref,
    position,
    total,
}: SetlistNavigationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isLiveMode = searchParams.get("live") === "true";

    const getHrefWithParams = (href: string) => {
        if (!isLiveMode) return href;
        const separator = href.includes("?") ? "&" : "?";
        return `${href}${separator}live=true`;
    };

    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Don't trigger navigation if user is typing in an input/textarea
            const target = event.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            if (event.key === "ArrowLeft" && prevHref) {
                event.preventDefault();
                router.push(getHrefWithParams(prevHref));
            } else if (event.key === "ArrowRight" && nextHref) {
                event.preventDefault();
                router.push(getHrefWithParams(nextHref));
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [prevHref, nextHref, router, isLiveMode]); // Added isLiveMode dependency

    // Don't render anything if there's only one song
    if (total <= 1) {
        return null;
    }

    return (
        <>
            {/* Previous Button - Bottom Left */}
            {prevHref ? (
                <Button
                    asChild
                    size="lg"
                    className="fixed bottom-10 left-6 z-50 h-14 w-14 rounded-full bg-background/20 backdrop-blur-md border border-white/10 p-0 text-foreground shadow-xl transition-all hover:bg-background/30 hover:scale-110 hover:shadow-2xl print:hidden"
                    aria-label={`Previous song (${position - 1} of ${total})`}
                >
                    <Link href={getHrefWithParams(prevHref)}>
                        <ChevronLeft className="h-6 w-6" aria-hidden="true" />
                    </Link>
                </Button>
            ) : null}

            {/* Next Button - Bottom Right */}
            {nextHref ? (
                <Button
                    asChild
                    size="lg"
                    className="fixed bottom-10 right-6 z-50 h-14 w-14 rounded-full bg-background/20 backdrop-blur-md border border-white/10 p-0 text-foreground shadow-xl transition-all hover:bg-background/30 hover:scale-110 hover:shadow-2xl print:hidden"
                    aria-label={`Next song (${position + 1} of ${total})`}
                >
                    <Link href={getHrefWithParams(nextHref)}>
                        <ChevronRight className="h-6 w-6" aria-hidden="true" />
                    </Link>
                </Button>
            ) : null}

            {/* Optional: Position Indicator (can be uncommented for testing) */}
            {/* <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md text-xs text-muted-foreground shadow-lg print:hidden">
        {position} of {total}
      </div> */}
        </>
    );
}
