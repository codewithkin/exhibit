import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    View,
    ScrollView,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { env } from "@exhibit/env/native";

type Category = {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
};

type Role = "ARTIST" | "COLLECTOR";

export default function OnboardingScreen() {
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
        fetch(`${env.EXPO_PUBLIC_SERVER_URL}/api/categories`, {
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
            router.replace("/auth");
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
            const response = await fetch(`${env.EXPO_PUBLIC_SERVER_URL}/api/onboarding`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ role, categoryIds: selectedCategories }),
            });

            if (response.ok) {
                router.replace("/");
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
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background">
            <View className="flex-1 px-6">
                {/* Progress indicator */}
                <View className="flex-row items-center justify-center gap-2 mt-8 mb-8">
                    <View className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-gray-200"}`} />
                    <View className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-gray-200"}`} />
                </View>

                {step === 1 && (
                    <View className="flex-1">
                        <Text className="font-display text-3xl font-medium text-center mb-2">
                            Welcome to Exhibit
                        </Text>
                        <Text className="text-muted-foreground text-center text-base mb-8">
                            What brings you here?
                        </Text>

                        <View className="gap-4">
                            <Pressable
                                onPress={() => setRole("ARTIST")}
                                className={`relative p-6 rounded-xl border-2 ${role === "ARTIST"
                                        ? "border-primary bg-primary/5"
                                        : "border-gray-200"
                                    }`}
                            >
                                <View className="flex-row items-start gap-4">
                                    <Text className="text-3xl">🎨</Text>
                                    <View className="flex-1">
                                        <Text className="font-semibold text-lg mb-1">I'm an Artist</Text>
                                        <Text className="text-muted-foreground text-sm">
                                            I want to showcase my work, connect with collectors, and grow my audience.
                                        </Text>
                                    </View>
                                </View>
                                {role === "ARTIST" && (
                                    <View className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary items-center justify-center">
                                        <Text className="text-white text-xs">✓</Text>
                                    </View>
                                )}
                            </Pressable>

                            <Pressable
                                onPress={() => setRole("COLLECTOR")}
                                className={`relative p-6 rounded-xl border-2 ${role === "COLLECTOR"
                                        ? "border-primary bg-primary/5"
                                        : "border-gray-200"
                                    }`}
                            >
                                <View className="flex-row items-start gap-4">
                                    <Text className="text-3xl">🖼️</Text>
                                    <View className="flex-1">
                                        <Text className="font-semibold text-lg mb-1">I'm a Collector</Text>
                                        <Text className="text-muted-foreground text-sm">
                                            I want to discover amazing art, support artists, and build my collection.
                                        </Text>
                                    </View>
                                </View>
                                {role === "COLLECTOR" && (
                                    <View className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary items-center justify-center">
                                        <Text className="text-white text-xs">✓</Text>
                                    </View>
                                )}
                            </Pressable>
                        </View>

                        <View className="mt-auto pb-8">
                            <Button
                                onPress={() => setStep(2)}
                                disabled={!role}
                                className="w-full h-14"
                            >
                                <Text className="text-primary-foreground font-semibold">Continue</Text>
                            </Button>
                        </View>
                    </View>
                )}

                {step === 2 && (
                    <View className="flex-1">
                        <Text className="font-display text-3xl font-medium text-center mb-2">
                            {role === "ARTIST" ? "What do you create?" : "What interests you?"}
                        </Text>
                        <Text className="text-muted-foreground text-center text-base mb-6">
                            Select at least 3 categories to personalize your feed
                        </Text>

                        {isFetchingCategories ? (
                            <View className="flex-1 items-center justify-center">
                                <ActivityIndicator size="large" />
                            </View>
                        ) : (
                            <ScrollView
                                className="flex-1"
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 20 }}
                            >
                                <View className="flex-row flex-wrap gap-3">
                                    {categories.map((category) => (
                                        <Pressable
                                            key={category.id}
                                            onPress={() => handleCategoryToggle(category.id)}
                                            className={`flex-row items-center gap-2 px-4 py-3 rounded-full border-2 ${selectedCategories.includes(category.id)
                                                    ? "border-primary bg-primary/10"
                                                    : "border-gray-200"
                                                }`}
                                        >
                                            <Text className="text-lg">{category.icon}</Text>
                                            <Text className={`text-sm font-medium ${selectedCategories.includes(category.id)
                                                    ? "text-primary"
                                                    : "text-foreground"
                                                }`}>
                                                {category.name}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </ScrollView>
                        )}

                        <View className="pb-8 pt-4">
                            <Text className="text-center text-muted-foreground text-sm mb-4">
                                {selectedCategories.length}/3 minimum selected
                            </Text>
                            <View className="flex-row gap-3">
                                <Button
                                    variant="outline"
                                    onPress={() => setStep(1)}
                                    className="h-14 px-6"
                                >
                                    <Text>Back</Text>
                                </Button>
                                <Button
                                    onPress={handleSubmit}
                                    disabled={selectedCategories.length < 3 || isLoading}
                                    className="flex-1 h-14"
                                >
                                    <Text className="text-primary-foreground font-semibold">
                                        {isLoading ? "Setting up..." : "Get Started"}
                                    </Text>
                                </Button>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}
