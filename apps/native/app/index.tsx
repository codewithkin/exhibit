import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";
import { env } from "@exhibit/env/native";

type UserWithOnboarding = {
    id: string;
    name: string;
    email: string;
    role: "ARTIST" | "COLLECTOR" | null;
    onboardingCompleted: boolean;
    categories: Array<{
        category: {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
        };
    }>;
};

export default function Home() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [user, setUser] = useState<UserWithOnboarding | null>(null);
    const [isLoadingUser, setIsLoadingUser] = useState(true);

    // Fetch user data including onboarding status
    useEffect(() => {
        if (session?.user) {
            fetch(`${env.EXPO_PUBLIC_SERVER_URL}/api/user/me`, {
                credentials: "include",
            })
                .then((res) => res.json())
                .then((data) => {
                    setUser(data);
                    setIsLoadingUser(false);

                    // Redirect to onboarding if not completed
                    if (!data.onboardingCompleted) {
                        router.replace("/onboarding");
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch user:", err);
                    setIsLoadingUser(false);
                });
        } else if (!isPending) {
            setIsLoadingUser(false);
        }
    }, [session, isPending, router]);

    // Redirect to auth if not signed in
    useEffect(() => {
        if (!isPending && !session?.user) {
            router.replace("/auth");
        }
    }, [session, isPending, router]);

    // Show loading while checking auth
    if (isPending || !session?.user || isLoadingUser) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Still loading or redirecting to onboarding
    if (!user?.onboardingCompleted) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background items-center justify-center p-6">
            <Text className="font-display text-4xl font-medium text-center mb-2">
                Welcome to Exhibit
            </Text>
            <Text className="text-muted-foreground text-center mb-2">
                Signed in as {session.user.email}
            </Text>
            <Text className="text-muted-foreground text-center mb-4">
                You're a {user.role === "ARTIST" ? "🎨 Artist" : "🖼️ Collector"}
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-8 justify-center max-w-xs">
                {user.categories.map(({ category }) => (
                    <View
                        key={category.id}
                        className="px-3 py-1 bg-primary/10 rounded-full"
                    >
                        <Text className="text-primary text-sm">
                            {category.icon} {category.name}
                        </Text>
                    </View>
                ))}
            </View>
            <Button variant="outline" onPress={() => authClient.signOut()}>
                <Text>Sign Out</Text>
            </Button>
        </View>
    );
}
