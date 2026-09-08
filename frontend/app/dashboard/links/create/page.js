"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Check,
  Copy,
  Loader2,
  QrCode,
  X,
} from "lucide-react";

import useApi from "@/hooks/useApi";
import {
  shortBaseLabel,
  shortUrl,
  shortUrlLabel,
  titleFromUrl,
} from "@/lib/links";
import ConfirmDialog from "@/components/confirm-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const MAX_ALIAS_LENGTH = 10;
const ALIAS_PATTERN = /^[A-Za-z0-9_-]+$/;
const RESERVED_ALIASES = new Set(["api", "r", "favicon.ico"]);

function LinkReadyModal({ shortCode, id, onClose, onCreateAnother }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const href = shortUrl(shortCode);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Your link is ready"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <Card className="relative w-full max-w-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3"
        >
          <X className="size-4" />
        </Button>

        <CardHeader>
          <CardTitle className="text-xl">Your link is ready 🎉</CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-muted/50 p-5 text-center">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-medium break-all text-primary hover:underline"
            >
              {shortUrlLabel(shortCode)}
            </a>

            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <Button asChild variant="outline" className="gap-2">
                <Link href={`/dashboard/${id}`}>
                  <BarChart3 className="size-4" />
                  View link details
                </Link>
              </Button>

              <Button
                className="gap-2"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(href);
                    setCopied(true);
                  } catch {
                  }
                }}
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Copy link
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="flex flex-wrap items-center justify-center gap-1.5 text-sm text-muted-foreground">
            On a roll?
            <button
              type="button"
              onClick={onCreateAnother}
              className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
            >
              Create another link
              <ArrowRight className="size-3.5" />
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LinkCreator() {
  const router = useRouter();

  const [destinationUrl, setDestinationUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [title, setTitle] = useState("");
  const [titleTouched, setTitleTouched] = useState(false);
  const [error, setError] = useState(null);
  const [created, setCreated] = useState(null);

  const createApi = useApi("/url/shorten", { method: "POST" });

  const validate = () => {
    const url = destinationUrl.trim();
    if (!url) return "Destination URL is required.";

    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) {
        return "Destination URL must start with http:// or https://";
      }
    } catch {
      return "That doesn't look like a valid URL. Include http:// or https://";
    }

    const custom = alias.trim();
    if (custom) {
      if (custom.length > MAX_ALIAS_LENGTH) {
        return `Custom back-half must be ${MAX_ALIAS_LENGTH} characters or fewer.`;
      }
      if (!ALIAS_PATTERN.test(custom)) {
        return "Custom back-half can only contain letters, numbers, hyphens, and underscores.";
      }
      if (RESERVED_ALIASES.has(custom.toLowerCase())) {
        return `"${custom}" is reserved. Please choose another back-half.`;
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const res = await createApi.request({
      originalUrl: destinationUrl.trim(),
      customAlias: alias.trim() || undefined,
      title: title.trim() || undefined,
    });

    if (!res) {
      setError(createApi.errorRef.current || "Could not create the link.");
      return;
    }

    setCreated({ shortCode: res.data?.short_code, id: res.data?.id });
  };

  const resetForm = () => {
    setCreated(null);
    setDestinationUrl("");
    setAlias("");
    setTitle("");
    setTitleTouched(false);
    setError(null);
  };

  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestinationUrl(value);
    if (!titleTouched) setTitle(value ? titleFromUrl(value) : "");
  };

  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      {created?.shortCode && (
        <LinkReadyModal
          shortCode={created.shortCode}
          id={created.id}
          onClose={() => router.push("/dashboard/links")}
          onCreateAnother={resetForm}
        />
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create a new link
        </h1>

        <ConfirmDialog
          trigger={
            <Button variant="ghost" size="sm">
              Bulk upload
            </Button>
          }
          title="Bulk upload"
          description="Uploading a CSV of links is not available yet. For now, create links one at a time."
          confirmText="Got it"
          cancelText="Close"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Link details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="destination" className="text-sm font-medium">
                Destination URL
              </label>
              <Input
                id="destination"
                type="url"
                inputMode="url"
                value={destinationUrl}
                onChange={handleDestinationChange}
                placeholder="https://example.com/my-long-url"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="alias" className="text-sm font-medium">
                Custom back-half{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <div className="flex items-stretch">
                <span className="flex shrink-0 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                  {shortBaseLabel()}/
                </span>
                <Input
                  id="alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="my-link"
                  maxLength={MAX_ALIAS_LENGTH}
                  className="rounded-l-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave blank and we&apos;ll generate a random code for you.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title{" "}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => {
                  setTitleTouched(true);
                  setTitle(e.target.value);
                }}
                placeholder="How this link shows up in your dashboard"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sharing options</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <QrCode className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">Generate a QR code</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Not available yet
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button asChild type="button" variant="outline">
            <Link href="/dashboard/links">Cancel</Link>
          </Button>

          <Button type="submit" disabled={createApi.loading} className="gap-2">
            {createApi.loading && <Loader2 className="size-4 animate-spin" />}
            {createApi.loading ? "Creating..." : "Create link"}
          </Button>
        </div>
      </form>
    </div>
  );
}
