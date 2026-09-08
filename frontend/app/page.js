"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  Layers,
  Link2,
  Loader2,
  Menu,
  MousePointerClick,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import useApi from "@/hooks/useApi";
import { shortUrl, shortUrlLabel } from "@/lib/links";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const DEMO_FLAG = "snapurl_demo_created";

function readDemoFlag() {
  try {
    return Boolean(localStorage.getItem(DEMO_FLAG));
  } catch {
    return false;
  }
}

const features = [
  {
    icon: Link2,
    title: "Shorten instantly",
    body: "Turn any long URL into a clean, shareable link — with an optional custom back-half.",
  },
  {
    icon: BarChart3,
    title: "Real-time analytics",
    body: "See every click broken down by day, device, country, and referrer.",
  },
  {
    icon: ShieldCheck,
    title: "Links you control",
    body: "Keep every link in one dashboard, and delete any of them the moment you're done.",
  },
];

function GitHubIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5C5.648.5.5 5.648.5 12a11.5 11.5 0 0 0 7.85 10.94c.575.106.785-.25.785-.556 0-.275-.01-1.002-.015-1.967-3.194.695-3.87-1.542-3.87-1.542-.523-1.33-1.28-1.684-1.28-1.684-1.046-.715.08-.7.08-.7 1.158.082 1.77 1.19 1.77 1.19 1.03 1.766 2.705 1.255 3.365.96.105-.75.403-1.255.73-1.545-2.55-.29-5.228-1.275-5.228-5.673 0-1.253.447-2.276 1.18-3.076-.12-.29-.51-1.455.11-3.03 0 0 .96-.307 3.15 1.175A10.95 10.95 0 0 1 12 6.34c.97.005 1.95.13 2.865.38 2.19-1.482 3.15-1.175 3.15-1.175.62 1.575.23 2.74.115 3.03.73.8 1.175 1.823 1.175 3.076 0 4.41-2.685 5.38-5.245 5.66.41.35.79 1.06.79 2.155 0 1.557-.015 2.812-.015 3.19 0 .31.205.67.795.555A11.5 11.5 0 0 0 23.5 12C23.5 5.648 18.352.5 12 .5Z" />
    </svg>
  );
}

function StatCard({ icon: Icon, value, label }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
        <Icon className="size-7 text-primary" />
        <p className="text-3xl font-semibold tracking-tight tabular-nums sm:text-4xl">
          {value}
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [demoUsed, setDemoUsed] = useState(false);

  const demoApi = useApi("/url/demoshorten", { method: "POST" });
  const statsApi = useApi("/analytics/stats", { auto: true, method: "GET" });

  const statsData = statsApi.data?.data || null;
  const createdCode = demoApi.data?.data?.short_code;

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const handleShorten = async (e) => {
    e.preventDefault();
    setError(null);

    if (demoUsed || readDemoFlag()) {
      setError("You've used your free demo link. Create an account to continue.");
      setDemoUsed(true);
      return;
    }
    if (!originalUrl.trim()) {
      setError("Paste a URL to shorten first.");
      return;
    }

    const res = await demoApi.request({ originalUrl: originalUrl.trim() });

    if (!res) {
      setError(demoApi.errorRef.current || "Could not shorten that link.");
      return;
    }

    try {
      localStorage.setItem(DEMO_FLAG, "true");
    } catch {
    }
    setDemoUsed(true);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl(createdCode));
      setCopied(true);
    } catch {
      setError("Couldn't copy — select the link and copy it manually.");
    }
  };

  const statsError =
    statsApi.error && /timeout/i.test(statsApi.error)
      ? "Our backend is starting up. Refresh in a few seconds to see live stats."
      : statsApi.error;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            SnapURL
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Get started</Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="GitHub repository">
              <a
                href="https://github.com/Rudresh-11/SnapURL"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GitHubIcon className="size-5" />
              </a>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>

        {menuOpen && (
          <div className="border-t px-6 py-4 md:hidden">
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" onClick={() => setMenuOpen(false)}>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild onClick={() => setMenuOpen(false)}>
                <Link href="/register">Get started</Link>
              </Button>
              <Button asChild variant="ghost">
                <a
                  href="https://github.com/Rudresh-11/SnapURL"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GitHubIcon className="size-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        )}
      </nav>

      <header className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl">
          Shorten links. Track performance.{" "}
          <span className="text-primary">Instantly.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-pretty text-muted-foreground">
          SnapURL shortens long URLs, tracks every click, and shows you who is
          actually opening your links.
        </p>

        <Button asChild size="lg" className="mt-8 gap-2">
          <Link href="/register">
            Start for free
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </header>

      <section className="mx-auto max-w-2xl px-6 pb-20">
        <Card>
          <CardContent className="p-6">
            <h2 className="mb-4 text-base font-semibold">
              Try shortening a link
            </h2>

            <form onSubmit={handleShorten} className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="url"
                inputMode="url"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                placeholder="https://example.com/a-very-long-url"
                aria-label="URL to shorten"
                className="flex-1"
              />
              <Button type="submit" disabled={demoApi.loading} className="gap-2">
                {demoApi.loading && <Loader2 className="size-4 animate-spin" />}
                {demoApi.loading ? "Shortening..." : "Shorten"}
              </Button>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {createdCode && (
              <div className="mt-6 border-t pt-6">
                <p className="mb-3 text-center text-sm font-medium">
                  Your link is ready
                </p>

                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <a
                    href={shortUrl(createdCode)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-w-0 flex-1 truncate font-medium text-primary hover:underline"
                  >
                    {shortUrlLabel(createdCode)}
                  </a>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="shrink-0 gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="size-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            <p className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
              The demo covers one link.{" "}
              <Link
                href="/register"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Sign up
              </Link>{" "}
              for unlimited shortening and analytics.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        {statsApi.loading && !statsData ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : statsError ? (
          <p className="text-center text-sm text-muted-foreground">
            {statsError}
          </p>
        ) : statsData ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <StatCard icon={Users} value={statsData.total_users} label="Total users" />
            <StatCard icon={Layers} value={statsData.total_urls} label="URLs shortened" />
            <StatCard
              icon={MousePointerClick}
              value={statsData.total_clicks}
              label="Total clicks"
            />
          </div>
        ) : null}
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Why SnapURL?
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardContent className="p-6">
                <Icon className="mb-4 size-6 text-primary" />
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} SnapURL — All rights reserved.
      </footer>
    </div>
  );
}
