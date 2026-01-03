import { useRouter } from "expo-router";
import { useEffect } from "react";
import { View, ActivityIndicator, Pressable } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  // Redirect to auth if not signed in
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/auth");
    }
  }, [session, isPending, router]);

  // Show loading while checking auth
  if (isPending || !session?.user) {
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
      <Text className="text-muted-foreground text-center mb-8">
        Signed in as {session.user.email}
      </Text>
      <Button variant="outline" onPress={() => authClient.signOut()}>
        <Text>Sign Out</Text>
      </Button>
    </View>
  );
}
