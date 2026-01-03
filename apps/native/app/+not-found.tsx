import { Link, Stack } from "expo-router";
import { Button, Surface } from "heroui-native";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Container } from "@/components/container";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={["#f3e7ff", "#ffffff", "#e0f2fe"]}
        className="flex-1"
      >
        <Container>
          <View className="flex-1 justify-center items-center p-4">
            <Surface variant="secondary" className="items-center p-8 max-w-sm rounded-2xl shadow-lg">
              <Text className="text-6xl mb-4">🎨</Text>
              <Text className="text-foreground font-bold text-2xl mb-2 text-center">
                404 - Not Found
              </Text>
              <Text className="text-muted-foreground text-sm text-center mb-2">
                This page doesn't exist in our gallery
              </Text>
              <Text className="text-muted text-xs text-center mb-6">
                The page you're looking for might have been removed or is temporarily unavailable.
              </Text>
              <View className="flex-row gap-2">
                <Link href="/" asChild>
                  <Button>Return Home</Button>
                </Link>
                <Link href="/auth" asChild>
                  <Button variant="outline">Sign In</Button>
                </Link>
              </View>
            </Surface>
          </View>
        </Container>
      </LinearGradient>
    </>
  );
}
