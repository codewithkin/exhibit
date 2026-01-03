import { Text, View, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Surface } from "heroui-native";
import { Container } from "./container";

export function LoadingScreen() {
    return (
        <LinearGradient
            colors={["#f3e7ff", "#ffffff", "#e0f2fe"]}
            className="flex-1"
        >
            <Container>
                <View className="flex-1 justify-center items-center p-4">
                    <View className="items-center space-y-6">
                        <View className="relative">
                            <ActivityIndicator size="large" color="#9333ea" />
                            <View className="absolute inset-0 items-center justify-center">
                                <Text className="text-2xl">🎨</Text>
                            </View>
                        </View>
                        <View className="items-center space-y-2">
                            <Text className="text-2xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600">
                                Exhibit
                            </Text>
                            <Text className="text-sm text-muted-foreground">
                                Loading your gallery...
                            </Text>
                        </View>
                        <View className="w-full max-w-xs space-y-3">
                            <Surface variant="secondary" className="h-12 w-full rounded-lg" />
                            <Surface variant="secondary" className="h-12 w-full rounded-lg" />
                            <Surface variant="secondary" className="h-12 w-3/4 rounded-lg mx-auto" />
                        </View>
                    </View>
                </View>
            </Container>
        </LinearGradient>
    );
}
