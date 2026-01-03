"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { env } from "@exhibit/env/web";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Loader from "@/components/loader";

type Category = {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
};

type Role = "ARTIST" | "COLLECTOR";

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, isPending: sessionPending } = authClient.useSession();

    const [step, setStep] = useState(1);
    const [role, setRole] = useState<Role | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingCategories, setIsFetchingCategories] = useState(true);

    // Fetch categories on mount
    useEffect(() => {
        fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/categories`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                setCategories(data);
                setIsFetchingCategories(false);
            })
            .catch((err) => {
                console.error("Failed to fetch categories:", err);
                setIsFetchingCategories(false);
            });
    }, []);

    // Redirect to auth if not signed in
    useEffect(() => {
        if (!sessionPending && !session?.user) {
            router.push("/auth");
        }
    }, [session, sessionPending, router]);

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSubmit = async () => {
        if (!role || selectedCategories.length === 0) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/onboarding`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ role, categoryIds: selectedCategories }),
            });

            if (response.ok) {
                router.push("/");
            } else {
                console.error("Onboarding failed");
            }
        } catch (error) {
            console.error("Onboarding error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (sessionPending || !session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Decorative background elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-lg relative z-10">
                {/* Progress indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? "bg-primary" : "bg-gray-200"}`} />
                    <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? "bg-primary" : "bg-gray-200"}`} />
                </div>

                {step === 1 && (
                    <Card className="shadow-lg border-0">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="font-display text-3xl font-medium">
                                Welcome to Exhibit
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                What brings you here?
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 pb-8 px-8">
                            <div className="grid gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole("ARTIST")}
                                    className={`group relative p-6 rounded-lg border-2 transition-all text-left ${role === "ARTIST"
                                            ? "border-primary bg-primary/5"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">🎨</div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">I'm an Artist</h3>
                                            <p className="text-muted-foreground text-sm">
                                                I want to showcase my work, connect with collectors, and grow my audience.
                                            </p>
                                        </div>
                                    </div>
                                    {role === "ARTIST" && (
                                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole("COLLECTOR")}
                                    className={`group relative p-6 rounded-lg border-2 transition-all text-left ${role === "COLLECTOR"
                                            ? "border-primary bg-primary/5"
                                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl">🖼️</div>
                                        <div>
                                            <h3 className="font-semibold text-lg mb-1">I'm a Collector</h3>
                                            <p className="text-muted-foreground text-sm">
                                                I want to discover amazing art, support artists, and build my collection.
                                            </p>
                                        </div>
                                    </div>
                                    {role === "COLLECTOR" && (
                                        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            </div>

                            <Button
                                onClick={() => setStep(2)}
                                disabled={!role}
                                className="w-full mt-8 h-12"
                            >
                                Continue
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {step === 2 && (
                    <Card className="shadow-lg border-0">
                        <CardHeader className="text-center pb-2">
                            <CardTitle className="font-display text-3xl font-medium">
                                {role === "ARTIST" ? "What do you create?" : "What interests you?"}
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                Select at least 3 categories to personalize your feed
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 pb-8 px-8">
                            {isFetchingCategories ? (
                                <div className="flex justify-center py-8">
                                    <Loader />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {categories.map((category) => (
                                        <label
                                            key={category.id}
                                            htmlFor={category.id}
                                            className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedCategories.includes(category.id)
                                                    ? "border-primary bg-primary/5"
                                                    : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <Checkbox
                                                id={category.id}
                                                checked={selectedCategories.includes(category.id)}
                                                onCheckedChange={() => handleCategoryToggle(category.id)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{category.icon}</span>
                                                <span className="text-sm font-medium">{category.name}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(1)}
                                    className="h-12"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={selectedCategories.length < 3 || isLoading}
                                    className="flex-1 h-12"
                                >
                                    {isLoading ? "Setting up..." : "Get Started"}
                                </Button>
                            </div>

                            <p className="text-center text-muted-foreground text-sm mt-4">
                                {selectedCategories.length}/3 minimum selected
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
