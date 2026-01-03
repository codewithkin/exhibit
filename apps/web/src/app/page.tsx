"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { env } from "@exhibit/env/web";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

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
      fetch(`${env.NEXT_PUBLIC_SERVER_URL}/api/user/me`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setIsLoadingUser(false);

          // Redirect to onboarding if not completed
          if (!data.onboardingCompleted) {
            router.push("/onboarding");
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

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/auth");
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user || isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Still loading or redirecting
  if (!user?.onboardingCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="font-display text-4xl font-medium mb-2">Welcome to Exhibit</h1>
      <p className="text-muted-foreground mb-2">
        Signed in as {session.user.email}
      </p>
      <p className="text-muted-foreground mb-4">
        You're a <span className="font-semibold">{user.role === "ARTIST" ? "🎨 Artist" : "🖼️ Collector"}</span>
      </p>
      <div className="flex flex-wrap gap-2 mb-8 max-w-md justify-center">
        {user.categories.map(({ category }) => (
          <span
            key={category.id}
            className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
          >
            {category.icon} {category.name}
          </span>
        ))}
      </div>
      <Button
        variant="outline"
        onClick={() => authClient.signOut()}
      >
        Sign Out
      </Button>
    </div>
  );
}
