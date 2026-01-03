"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Error boundary:", error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader className="space-y-4">
                    <div className="text-6xl mb-2">⚠️</div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                        Something Went Wrong
                    </CardTitle>
                    <CardDescription className="text-base">
                        We encountered an unexpected error
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted p-3 rounded-lg text-sm text-left font-mono overflow-auto max-h-32">
                        {error.message || "An unknown error occurred"}
                    </div>
                    {error.digest && (
                        <p className="text-xs text-muted-foreground">
                            Error ID: {error.digest}
                        </p>
                    )}
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Button onClick={reset}>
                            Try Again
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = "/"}>
                            Return Home
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
