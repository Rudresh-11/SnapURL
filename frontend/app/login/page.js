"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";

import useApi from "@/hooks/useApi";
import useGoogleSignIn from "@/hooks/useGoogleSignIn";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const googleAuthApi = useApi("/auth/login/google", { method: "POST" });
  const localAuthApi = useApi("/auth/login", { method: "POST" });

  const handleGoogleCredential = async (response) => {
    setError(null);
    setSubmitting(true);

    const res = await googleAuthApi.request({
      provider: "google",
      idToken: response.credential,
    });

    if (!res) {
      setError(
        googleAuthApi.errorRef.current || "Could not sign in with Google."
      );
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard/links");
  };

  const googleBtnRef = useGoogleSignIn(handleGoogleCredential, { width: 400 });

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await localAuthApi.request({ email, password });

    if (!res) {
      setError(localAuthApi.errorRef.current || "Invalid email or password.");
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard/links");
  };

  return (
    <main className="flex min-h-screen bg-background">
      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-tight text-primary"
          >
            SnapURL
          </Link>

          <div className="mt-8 mb-6 space-y-1.5">
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Sign up for free
              </Link>
            </p>
          </div>

          <div
            ref={googleBtnRef}
            className={`min-h-[40px] [&>div]:!w-full ${
              submitting ? "pointer-events-none opacity-50" : ""
            }`}
          />

          <div className="my-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">OR</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="px-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Log in"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            By logging in, you agree to SnapURL&apos;s Terms of Service and
            Privacy Policy.
          </p>
        </div>
      </div>

      <div className="hidden items-center justify-center bg-muted p-10 lg:flex lg:w-1/2">
        <div className="max-w-md space-y-6 text-center">
          <Image
            width={420}
            height={420}
            src="/vector/connect2.png"
            alt=""
            className="mx-auto h-auto w-full max-w-[420px]"
            priority
          />
          <h2 className="text-xl font-semibold tracking-tight">
            Connect SnapURL to the links you use every day
          </h2>
          <p className="text-sm text-muted-foreground">
            Shorten a URL, share it anywhere, and see exactly where the clicks
            come from.
          </p>
        </div>
      </div>
    </main>
  );
}
