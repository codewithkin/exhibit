import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card, Chip, useThemeColor } from "heroui-native";
import { useEffect } from "react";
import { Text, View, Pressable, ActivityIndicator } from "react-native";

import { Container } from "@/components/container";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const mutedColor = useThemeColor("muted");
  const successColor = useThemeColor("success");
  const dangerColor = useThemeColor("danger");
  const foregroundColor = useThemeColor("foreground");

  // Redirect to auth if not signed in
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.replace("/auth");
    }
  }, [session, isPending, router]);

  // Show loading while checking auth
  if (isPending || !session?.user) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Container className="p-6">
      <View className="py-4 mb-6">
        <Text className="font-display text-3xl font-medium text-foreground mb-2">
          Welcome back
        </Text>
        <Text className="text-muted-foreground">
          Explore your exhibitions
        </Text>
      </View>

      <Card variant="secondary" className="mb-6 p-4">
        <Text className="text-foreground text-base mb-2">
          Signed in as <Text className="font-medium">{session.user.name}</Text>
        </Text>
        <Text className="text-muted text-sm mb-4">{session.user.email}</Text>
        <Pressable
          className="bg-destructive py-3 px-4 rounded-lg self-start active:opacity-70"
          onPress={() => {
            authClient.signOut();
          }}
        >
          <Text className="text-destructive-foreground font-medium">Sign Out</Text>
        </Pressable>
      </Card>
    </Container>
  );
}
