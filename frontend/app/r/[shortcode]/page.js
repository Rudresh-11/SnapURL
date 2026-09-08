"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function RedirectPage() {
  const { shortcode } = useParams();
  const [missing, setMissing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!shortcode) return;
    let cancelled = false;

    const verify = async () => {
      const base = process.env.NEXT_PUBLIC_API_REDIRECT_URL;

      try {
        const res = await api.request({
          url: `${base}/${shortcode}?check=true`,
          method: "GET",
          validateStatus: () => true,
          showErrorToast: false,
        });

        if (cancelled) return;

        if (res.status === 404 || res.data?.message === "Url not found") {
          setMissing(true);
          return;
        }
        if (res.status < 200 || res.status >= 300) {
          setError(res.data?.message || "Something went wrong.");
          return;
        }

        const referrer = document.referrer || "Direct";
        window.location.href = `${base}/${shortcode}?ref=${encodeURIComponent(
          referrer
        )}`;
      } catch {
        if (!cancelled) setError("We couldn't reach the server. Try again.");
      }
    };

    verify();
    return () => {
      cancelled = true;
    };
  }, [shortcode]);

  if (missing) notFound();

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <Button asChild variant="outline" size="sm">
          <Link href="/">Go to SnapURL</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
      <Loader2 className="size-5 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Taking you there...</p>
    </main>
  );
}
