import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

type AuthMode = "email" | "magic-link";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const router = useRouter();
  const { isPending } = authClient.useSession();
  const [authMode, setAuthMode] = useState<AuthMode>("magic-link");
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Email/Password form
  const emailForm = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            router.push("/dashboard");
            toast.success("Account created successfully");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }),
    },
  });

  // Magic link form (for sign up, we just send a magic link - account created on verification)
  const magicLinkForm = useForm({
    defaultValues: {
      email: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.magicLink(
        {
          email: value.email,
          callbackURL: "/dashboard",
        },
        {
          onSuccess: () => {
            setMagicLinkSent(true);
            setMagicLinkEmail(value.email);
            toast.success("Magic link sent! Check your email.");
          },
          onError: (error) => {
            toast.error(error.error.message || "Failed to send magic link");
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Invalid email address"),
      }),
    },
  });

  // Google sign up
  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch {
      toast.error("Failed to sign up with Google");
      setIsGoogleLoading(false);
    }
  };

  if (isPending) {
    return <Loader />;
  }

  // Magic link sent confirmation
  if (magicLinkSent) {
    return (
      <div className="mx-auto w-full mt-10 max-w-md p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium text-foreground">Check your email</h1>
          <p className="text-muted-foreground">
            We sent a sign-in link to<br />
            <span className="font-medium text-foreground">{magicLinkEmail}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            The link will expire in 5 minutes.
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setMagicLinkSent(false);
              setMagicLinkEmail("");
            }}
            className="mt-4"
          >
            Use a different email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full mt-10 max-w-md p-6">
      <h1 className="font-display text-3xl font-medium text-center mb-2">Create your account</h1>
      <p className="text-muted-foreground text-center mb-8">Get started with Exhibit today</p>

      {/* Google Sign Up */}
      <Button
        type="button"
        variant="outline"
        className="w-full mb-4 h-11"
        onClick={handleGoogleSignUp}
        disabled={isGoogleLoading}
      >
        {isGoogleLoading ? (
          "Connecting..."
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">or</span>
        </div>
      </div>

      {/* Auth Mode Toggle */}
      <div className="flex mb-6 bg-muted rounded-sm p-1">
        <button
          type="button"
          onClick={() => setAuthMode("magic-link")}
          className={`flex-1 py-2 text-sm font-medium rounded-sm transition-colors ${
            authMode === "magic-link"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Magic Link
        </button>
        <button
          type="button"
          onClick={() => setAuthMode("email")}
          className={`flex-1 py-2 text-sm font-medium rounded-sm transition-colors ${
            authMode === "email"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Password
        </button>
      </div>

      {/* Magic Link Form */}
      {authMode === "magic-link" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            magicLinkForm.handleSubmit();
          }}
          className="space-y-4"
        >
          <magicLinkForm.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-11"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-sm text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </magicLinkForm.Field>

          <magicLinkForm.Subscribe>
            {(state) => (
              <Button
                type="submit"
                className="w-full h-11"
                disabled={!state.canSubmit || state.isSubmitting}
              >
                {state.isSubmitting ? "Sending..." : "Send magic link"}
              </Button>
            )}
          </magicLinkForm.Subscribe>
        </form>
      )}

      {/* Email/Password Form */}
      {authMode === "email" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            emailForm.handleSubmit();
          }}
          className="space-y-4"
        >
          <emailForm.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Name</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="text"
                  placeholder="Your name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-11"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-sm text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </emailForm.Field>

          <emailForm.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="you@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-11"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-sm text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </emailForm.Field>

          <emailForm.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-11"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-sm text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </emailForm.Field>

          <emailForm.Subscribe>
            {(state) => (
              <Button
                type="submit"
                className="w-full h-11"
                disabled={!state.canSubmit || state.isSubmitting}
              >
                {state.isSubmitting ? "Creating account..." : "Create account"}
              </Button>
            )}
          </emailForm.Subscribe>
        </form>
      )}

      {/* Switch to Sign In */}
      <div className="mt-6 text-center">
        <span className="text-muted-foreground text-sm">Already have an account? </span>
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="text-foreground hover:text-foreground/80 p-0 h-auto text-sm font-medium"
        >
          Sign in
        </Button>
      </div>
    </div>
  );
}
