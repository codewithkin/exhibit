import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
            <div className="w-full max-w-md space-y-4">
                <div className="flex items-center justify-center mb-8">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center text-2xl">
                            🎨
                        </div>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        Exhibit
                    </h2>
                    <p className="text-sm text-muted-foreground">Loading your gallery...</p>
                </div>
                <div className="space-y-3 pt-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-3/4 mx-auto" />
                </div>
            </div>
        </div>
    );
}
