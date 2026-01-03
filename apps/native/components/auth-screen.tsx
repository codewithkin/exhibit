import * as WebBrowser from "expo-web-browser";
import { MotiView } from "moti";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Text } from "./ui/text";

interface AuthScreenProps {
  onBack?: () => void;
}

export function AuthScreen({ onBack }: AuthScreenProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  // Close any open browser sessions
  WebBrowser.maybeCompleteAuthSession();

  // Handle magic link
  async function handleMagicLink() {
    if (!email) {
      setError("Please enter your email");
      return;
    }

    setIsLoading(true);
    setError(null);

    await authClient.signIn.magicLink(
      {
        email,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          setMagicLinkSent(true);
          setIsLoading(false);
        },
        onError: (err) => {
          setError(err.error?.message || "Failed to send magic link");
          setIsLoading(false);
        },
      },
    );
  }

  // Handle Google sign in
  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      setError("Failed to sign in with Google");
      setIsGoogleLoading(false);
    }
  }

  // Magic link sent confirmation
  if (magicLinkSent) {
    return (
      <View className="flex-1 bg-background justify-center items-center px-8">
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 300 }}
          style={{ alignItems: "center" }}
        >
          <View className="w-20 h-20 bg-muted rounded-full items-center justify-center mb-6">
            <Text className="text-4xl">✉️</Text>
          </View>
          <Text className="font-display text-2xl font-medium text-foreground text-center mb-2">
            Check your email
          </Text>
          <Text className="text-muted-foreground text-center mb-1">
            We sent a sign-in link to
          </Text>
          <Text className="font-medium text-foreground text-center mb-4">
            {email}
          </Text>
          <Text className="text-muted-foreground text-center mb-8">
            The link will expire in 5 minutes.
          </Text>
          <Button
            variant="ghost"
            onPress={() => {
              setMagicLinkSent(false);
              setEmail("");
            }}
          >
            <Text>Use a different email</Text>
          </Button>
        </MotiView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      {/* Back button */}
      {onBack && (
        <View className="absolute top-14 left-6 z-10">
          <Pressable onPress={onBack}>
            <Text className="text-muted-foreground">← Back</Text>
          </Pressable>
        </View>
      )}

      <View className="flex-1 justify-center px-8">
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400 }}
        >
          <Text className="font-display text-3xl font-medium text-center mb-2">
            Welcome to Exhibit
          </Text>
          <Text className="text-muted-foreground text-center mb-8">
            Sign in or create an account to continue
          </Text>
        </MotiView>

        {/* Error display */}
        {error && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <View className="bg-destructive/10 p-3 rounded-sm mb-4">
              <Text className="text-destructive text-center">{error}</Text>
            </View>
          </MotiView>
        )}

        {/* Google Sign In */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 100 }}
        >
          <Button
            variant="outline"
            size="lg"
            onPress={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            <Text>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</Text>
          </Button>
        </MotiView>

        {/* Divider */}
        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 400, delay: 200 }}
        >
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-border" />
            <Text className="px-3 text-muted-foreground uppercase">or</Text>
            <View className="flex-1 h-px bg-border" />
          </View>
        </MotiView>

        {/* Email Form */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 300 }}
        >
          <View className="gap-4">
            <View className="gap-2">
              <Label nativeID="email">Email</Label>
              <Input
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                aria-labelledby="email"
              />
            </View>

            <Button
              onPress={handleMagicLink}
              disabled={isLoading || !email}
              size="lg"
            >
              <Text className="text-primary-foreground">
                {isLoading ? "Sending..." : "Continue with Email"}
              </Text>
            </Button>
          </View>
        </MotiView>

        <MotiView
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 400, delay: 400 }}
        >
          <View className="mt-6">
            <Text className="text-muted-foreground text-center">
              We'll send you a magic link to sign in instantly.
            </Text>
            <Text className="text-muted-foreground text-center">
              No password needed.
            </Text>
          </View>
        </MotiView>
      </View>
    </View>
  );
}
