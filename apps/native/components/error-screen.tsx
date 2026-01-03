import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Surface } from "heroui-native";
import { Container } from "./container";

interface ErrorScreenProps {
  error: Error;
  retry?: () => void;
  onGoHome?: () => void;
}

export function ErrorScreen({ error, retry, onGoHome }: ErrorScreenProps) {
  return (
    <LinearGradient
      colors={["#fef2f2", "#ffffff", "#fff7ed"]}
      className="flex-1"
    >
      <Container>
        <View className="flex-1 justify-center items-center p-4">
          <Surface variant="secondary" className="items-center p-8 max-w-sm rounded-2xl shadow-lg">
            <Text className="text-6xl mb-4">⚠️</Text>
            <Text className="text-foreground font-bold text-2xl mb-2 text-center">
              Something Went Wrong
            </Text>
            <Text className="text-muted-foreground text-sm text-center mb-4">
              We encountered an unexpected error
            </Text>
            
            <Surface variant="default" className="p-3 rounded-lg mb-6 w-full">
              <Text className="text-xs font-mono text-foreground text-center" numberOfLines={3}>
                {error.message || "An unknown error occurred"}
              </Text>
            </Surface>

            <View className="flex-row gap-2">
              {retry && (
                <Button onPress={retry}>
                  Try Again
                </Button>
              )}
              {onGoHome && (
                <Button variant="outline" onPress={onGoHome}>
                  Return Home
                </Button>
              )}
            </View>
          </Surface>
        </View>
      </Container>
    </LinearGradient>
  );
}
