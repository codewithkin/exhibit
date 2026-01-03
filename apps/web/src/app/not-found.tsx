import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
            <Card className="w-full max-w-md text-center shadow-lg">
                <CardHeader className="space-y-4">
                    <div className="text-6xl mb-2">🎨</div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                        404 - Not Found
                    </CardTitle>
                    <CardDescription className="text-base">
                        This page doesn&apos;t exist in our gallery
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        The page you&apos;re looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                        <Button asChild>
                            <Link href="/">
                                Return Home
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/auth">
                                Sign In
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
