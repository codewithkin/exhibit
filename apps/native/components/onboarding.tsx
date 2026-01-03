import { MotiView } from "moti";
import { useState } from "react";
import { Dimensions, Pressable, View, StyleSheet } from "react-native";

import { Button } from "./ui/button";
import { Text } from "./ui/text";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface OnboardingStep {
    title: string;
    description: string;
    icon: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        title: "Discover Art",
        description: "Explore curated exhibitions from galleries and artists around the world.",
        icon: "🎨",
    },
    {
        title: "Collect & Support",
        description: "Purchase artwork directly from artists with secure transactions.",
        icon: "✨",
    },
    {
        title: "Build Your Gallery",
        description: "Create your personal collection and share it with the community.",
        icon: "🖼️",
    },
];

interface OnboardingProps {
    onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < ONBOARDING_STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    return (
        <View className="flex-1 bg-background">
            {/* Skip button */}
            <View className="absolute top-14 right-6 z-10">
                <Pressable onPress={handleSkip}>
                    <Text className="text-muted-foreground">Skip</Text>
                </Pressable>
            </View>

            {/* Content */}
            <View className="flex-1 justify-center items-center px-8">
                {ONBOARDING_STEPS.map((step, index) => (
                    <MotiView
                        key={index}
                        animate={{
                            opacity: currentStep === index ? 1 : 0,
                            scale: currentStep === index ? 1 : 0.9,
                            translateX: currentStep === index ? 0 : currentStep > index ? -SCREEN_WIDTH : SCREEN_WIDTH,
                        }}
                        transition={{
                            type: "timing",
                            duration: 400,
                        }}
                        style={styles.stepContainer}
                        pointerEvents={currentStep === index ? "auto" : "none"}
                    >
                        {/* Icon */}
                        <MotiView
                            animate={{
                                scale: currentStep === index ? 1 : 0.5,
                                rotate: currentStep === index ? "0deg" : "15deg",
                            }}
                            transition={{
                                type: "spring",
                                damping: 15,
                                delay: 100,
                            }}
                            style={styles.iconContainer}
                        >
                            <Text className="text-6xl">{step.icon}</Text>
                        </MotiView>

                        {/* Title */}
                        <MotiView
                            animate={{
                                opacity: currentStep === index ? 1 : 0,
                                translateY: currentStep === index ? 0 : 20,
                            }}
                            transition={{
                                type: "timing",
                                duration: 350,
                                delay: 150,
                            }}
                        >
                            <Text className="font-display text-3xl font-medium text-foreground text-center mb-4">
                                {step.title}
                            </Text>
                        </MotiView>

                        {/* Description */}
                        <MotiView
                            animate={{
                                opacity: currentStep === index ? 1 : 0,
                                translateY: currentStep === index ? 0 : 20,
                            }}
                            transition={{
                                type: "timing",
                                duration: 350,
                                delay: 250,
                            }}
                        >
                            <Text className="text-muted-foreground text-center text-lg max-w-xs">
                                {step.description}
                            </Text>
                        </MotiView>
                    </MotiView>
                ))}
            </View>

            {/* Bottom section */}
            <View className="px-8 pb-12">
                {/* Progress dots */}
                <View className="flex-row justify-center mb-8 gap-2">
                    {ONBOARDING_STEPS.map((_, index) => (
                        <MotiView
                            key={index}
                            animate={{
                                width: currentStep === index ? 24 : 8,
                                opacity: currentStep === index ? 1 : 0.3,
                            }}
                            transition={{
                                type: "spring",
                                damping: 20,
                            }}
                            style={styles.dot}
                        />
                    ))}
                </View>

                {/* Next/Get Started button */}
                <Button onPress={handleNext} size="lg">
                    <Text className="text-primary-foreground font-medium">
                        {currentStep === ONBOARDING_STEPS.length - 1 ? "Get Started" : "Next"}
                    </Text>
                </Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    stepContainer: {
        position: "absolute",
        width: "100%",
        alignItems: "center",
    },
    iconContainer: {
        width: 128,
        height: 128,
        borderRadius: 64,
        backgroundColor: "rgba(0,0,0,0.05)",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 32,
    },
    dot: {
        height: 8,
        borderRadius: 4,
        backgroundColor: "#000",
    },
});
