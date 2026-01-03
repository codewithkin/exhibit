"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import Loader from "@/components/loader";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/auth");
    }
  }, [session, isPending, router]);

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="font-display text-4xl font-medium mb-2">Welcome to Exhibit</h1>
      <p className="text-muted-foreground mb-8">
        Signed in as {session.user.email}
      </p>
      <Button
        variant="outline"
        onClick={() => authClient.signOut()}
      >
        Sign Out
      </Button>
    </div>
  );
}
