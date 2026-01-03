import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";

import { AuthScreen } from "@/components/auth-screen";
import { Onboarding } from "@/components/onboarding";
import { authClient } from "@/lib/auth-client";

const ONBOARDING_COMPLETE_KEY = "@exhibit/onboarding_complete";

export default function AuthPage() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

    // Check if onboarding is complete
    useEffect(() => {
        async function checkOnboarding() {
            try {
                const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
                setShowOnboarding(value !== "true");
            } catch {
                setShowOnboarding(true);
            }
        }
        checkOnboarding();
    }, []);

    // Redirect if already signed in
    useEffect(() => {
        if (!isPending && session?.user) {
            router.replace("/(drawer)");
        }
    }, [session, isPending, router]);

    // Handle onboarding completion
    async function handleOnboardingComplete() {
        try {
            await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
        } catch {
            // Ignore storage errors
        }
        setShowOnboarding(false);
    }

    // Loading state
    if (isPending || showOnboarding === null) {
        return (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    // Show onboarding if not complete
    if (showOnboarding) {
        return <Onboarding onComplete={handleOnboardingComplete} />;
    }

    // Show auth screen
    return <AuthScreen />;
}
