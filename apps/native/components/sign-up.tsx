import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Text } from "./ui/text";

type AuthMode = "magic-link" | "password";

function SignUp({ onSwitchToSignIn }: { onSwitchToSignIn?: () => void }) {
  const [authMode, setAuthMode] = useState<AuthMode>("magic-link");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");

  // Handle magic link sign up (sends magic link - account created on verification)
  async function handleMagicLinkSignUp() {
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
          setMagicLinkEmail(email);
          setEmail("");
          setIsLoading(false);
        },
        onError: (err) => {
          setError(err.error?.message || "Failed to send magic link");
          setIsLoading(false);
        },
      },
    );
  }

  // Handle email/password sign up
  async function handlePasswordSignUp() {
    if (!name || !email || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    await authClient.signUp.email(
      {
        name,
        email,
        password,
      },
      {
        onError: (err) => {
          setError(err.error?.message || "Failed to create account");
          setIsLoading(false);
        },
        onSuccess: () => {
          setName("");
          setEmail("");
          setPassword("");
          setIsLoading(false);
        },
      },
    );
  }

  // Handle Google sign up
  async function handleGoogleSignUp() {
    setIsGoogleLoading(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch {
      setError("Failed to sign up with Google");
      setIsGoogleLoading(false);
    }
  }

  // Close any open browser sessions when component mounts
  WebBrowser.maybeCompleteAuthSession();

  // Magic link sent confirmation screen
  if (magicLinkSent) {
    return (
      <View className="p-6 items-center">
        <View className="w-16 h-16 mb-4 bg-muted rounded-full items-center justify-center">
          <Text className="text-2xl">✉️</Text>
        </View>
        <Text className="font-display text-2xl font-medium text-foreground text-center mb-2">
          Check your email
        </Text>
        <Text className="text-muted-foreground text-center mb-1">
          We sent a sign-in link to
        </Text>
        <Text className="font-medium text-foreground text-center mb-4">
          {magicLinkEmail}
        </Text>
        <Text className="text-sm text-muted-foreground text-center mb-6">
          The link will expire in 5 minutes.
        </Text>
        <Button
          variant="ghost"
          onPress={() => {
            setMagicLinkSent(false);
            setMagicLinkEmail("");
          }}
        >
          <Text>Use a different email</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="p-6">
      <Text className="font-display text-3xl font-medium text-center mb-2">
        Create your account
      </Text>
      <Text className="text-muted-foreground text-center mb-8">
        Get started with Exhibit today
      </Text>

      {/* Error display */}
      {error && (
        <View className="bg-destructive/10 p-3 rounded-sm mb-4">
          <Text className="text-destructive text-sm text-center">{error}</Text>
        </View>
      )}

      {/* Google Sign Up */}
      <Button
        variant="outline"
        className="mb-4 h-12"
        onPress={handleGoogleSignUp}
        disabled={isGoogleLoading}
      >
        <Text>{isGoogleLoading ? "Connecting..." : "Continue with Google"}</Text>
      </Button>

      {/* Divider */}
      <View className="flex-row items-center my-6">
        <View className="flex-1 h-px bg-border" />
        <Text className="px-3 text-xs text-muted-foreground uppercase">or</Text>
        <View className="flex-1 h-px bg-border" />
      </View>

      {/* Auth Mode Toggle */}
      <View className="flex-row mb-6 bg-muted rounded-sm p-1">
        <Pressable
          onPress={() => setAuthMode("magic-link")}
          className={`flex-1 py-2 rounded-sm items-center ${authMode === "magic-link" ? "bg-background shadow-sm" : ""
            }`}
        >
          <Text
            className={`text-sm font-medium ${authMode === "magic-link" ? "text-foreground" : "text-muted-foreground"
              }`}
          >
            Magic Link
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setAuthMode("password")}
          className={`flex-1 py-2 rounded-sm items-center ${authMode === "password" ? "bg-background shadow-sm" : ""
            }`}
        >
          <Text
            className={`text-sm font-medium ${authMode === "password" ? "text-foreground" : "text-muted-foreground"
              }`}
          >
            Password
          </Text>
        </Pressable>
      </View>

      {/* Magic Link Form */}
      {authMode === "magic-link" && (
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
              className="h-12"
            />
          </View>

          <Button
            onPress={handleMagicLinkSignUp}
            disabled={isLoading}
            className="h-12"
          >
            <Text>{isLoading ? "Sending..." : "Send magic link"}</Text>
          </Button>
        </View>
      )}

      {/* Password Form */}
      {authMode === "password" && (
        <View className="gap-4">
          <View className="gap-2">
            <Label nativeID="name">Name</Label>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              autoCapitalize="words"
              aria-labelledby="name"
              className="h-12"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="email">Email</Label>
            <Input
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              aria-labelledby="email"
              className="h-12"
            />
          </View>

          <View className="gap-2">
            <Label nativeID="password">Password</Label>
            <Input
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              aria-labelledby="password"
              className="h-12"
            />
          </View>

          <Button
            onPress={handlePasswordSignUp}
            disabled={isLoading}
            className="h-12"
          >
            <Text>{isLoading ? "Creating account..." : "Create account"}</Text>
          </Button>
        </View>
      )}

      {/* Switch to Sign In */}
      {onSwitchToSignIn && (
        <View className="flex-row justify-center mt-6 items-center">
          <Text className="text-muted-foreground text-sm">Already have an account? </Text>
          <Pressable onPress={onSwitchToSignIn}>
            <Text className="text-foreground text-sm font-medium">Sign in</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export { SignUp };