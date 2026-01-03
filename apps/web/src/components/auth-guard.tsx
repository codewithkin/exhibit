"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

interface AuthGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    useEffect(() => {
        if (!isPending && !session?.user) {
            router.push("/auth");
        }
    }, [session, isPending, router]);

    if (isPending) {
        return (
            fallback ?? (
                <div className="min-h-screen flex items-center justify-center">
                    <Loader />
                </div>
            )
        );
    }

    if (!session?.user) {
        return (
            fallback ?? (
                <div className="min-h-screen flex items-center justify-center">
                    <Loader />
                </div>
            )
        );
    }

    return <>{children}</>;
}
