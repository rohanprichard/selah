import { Skeleton } from "@/components/ui/skeleton";

export function SongViewerSkeleton({ hideHeader = false }: { hideHeader?: boolean }) {
    return (
        <div className="mx-auto w-full max-w-4xl px-4 py-12 space-y-6 pb-24">
            <div className="space-y-8">
                <div className="space-y-4">
                    {/* Title/Artist (conditionally shown) */}
                    {!hideHeader && (
                        <div className="flex flex-col gap-2">
                            <div className="space-y-2">
                                <Skeleton className="h-9 w-64" /> {/* Title */}
                                <Skeleton className="h-4 w-48" /> {/* Artist */}
                            </div>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-3">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-10 w-32" />
                        <Skeleton className="h-10 w-20" />
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Toolbar Skeleton */}
                <div className="sticky top-20 z-40 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="glass rounded-xl p-2 flex items-center justify-between gap-2 shadow-lg h-14">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-32" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-8 w-8" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-[1fr,300px]">
                    <div className="space-y-8">
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
                    </div>
                    {/* Sidebar Skeleton */}
                    <div className="hidden lg:block space-y-6">
                        <div className="sticky top-40 space-y-4">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="aspect-video w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
