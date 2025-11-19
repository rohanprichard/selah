import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SongViewerSkeleton({ hideHeader = false }: { hideHeader?: boolean }) {
    return (
        <div className="space-y-6 mb-24">
            <Card>
                <CardHeader className="gap-6">
                    {/* Title/Artist (conditionally shown) */}
                    {!hideHeader && (
                        <div className="flex flex-col gap-2">
                            <div className="space-y-2">
                                <Skeleton className="h-9 w-64" /> {/* Title */}
                                <Skeleton className="h-4 w-48" /> {/* Artist */}
                            </div>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-32" /> {/* Transpose */}
                            <Skeleton className="h-10 w-28" /> {/* Font size */}
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-10 w-10" /> {/* Icon button */}
                            <Skeleton className="h-10 w-10" /> {/* Icon button */}
                            <Skeleton className="h-10 w-10" /> {/* Icon button */}
                            <Skeleton className="h-10 w-10" /> {/* Icon button */}
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 rounded-lg border border-border/50 bg-muted/20 p-4">
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-8" /> {/* Label */}
                            <Skeleton className="h-4 w-12" /> {/* Value */}
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-12" /> {/* Label */}
                            <Skeleton className="h-4 w-16" /> {/* Value */}
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-20" /> {/* Label */}
                            <Skeleton className="h-4 w-8" /> {/* Value */}
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16 rounded-full" />
                        <Skeleton className="h-6 w-20 rounded-full" />
                        <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Song sections */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-3">
                            {/* Section header */}
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-6 w-16 rounded" /> {/* Badge */}
                                <Skeleton className="h-6 w-32" /> {/* Label */}
                            </div>

                            {/* Lines */}
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-11/12" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-10/12" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
