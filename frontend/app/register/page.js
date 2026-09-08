"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

import useApi from "@/hooks/useApi";
import useGoogleSignIn from "@/hooks/useGoogleSignIn";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const googleAuthApi = useApi("/auth/login/google", { method: "POST" });
  const registerApi = useApi("/auth/register", { method: "POST" });

  const handleGoogleCredential = async (response) => {
    setError(null);
    setSubmitting(true);

    const res = await googleAuthApi.request({
      provider: "google",
      idToken: response.credential,
    });

    if (!res) {
      setError(
        googleAuthApi.errorRef.current || "Could not sign up with Google."
      );
      setSubmitting(false);
      return;
    }

    router.replace("/dashboard/links");
  };

  const googleBtnRef = useGoogleSignIn(handleGoogleCredential, { width: 400 });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    const res = await registerApi.request({
      username: username.trim(),
      email: email.trim(),
      password,
    });

    if (!res) {
      setError(registerApi.errorRef.current || "Registration failed.");
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
              Create your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Log in
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

          <form onSubmit={handleRegister} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="yourname"
                  className="pl-9"
                  required
                />
              </div>
            </div>

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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
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

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="px-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {showConfirmPassword ? (
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
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs leading-relaxed text-muted-foreground">
            By creating an account, you agree to SnapURL&apos;s Terms of Service
            and Privacy Policy.
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
            Every link, measured
          </h2>
          <p className="text-sm text-muted-foreground">
            Create an account to keep your links, see click history, and break
            traffic down by country, device, and referrer.
          </p>
        </div>
      </div>
    </main>
  );
}
