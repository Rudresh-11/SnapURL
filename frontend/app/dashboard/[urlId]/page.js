"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Check,
  ChevronLeft,
  Copy,
  CornerDownRight,
  Link2,
  MoreVertical,
  Share2,
  TagIcon,
  Trash2,
  X,
} from "lucide-react";

import useApi from "@/hooks/useApi";
import { faviconFor, shortUrl, shortUrlLabel, titleFromUrl } from "@/lib/links";
import { formatIST } from "@/lib/timeconverter";
import { ChartBarInteractive } from "@/components/analytics/barchart";
import { ChartPieDonut } from "@/components/analytics/piechart";
import { ClicksTable } from "@/components/analytics/datatable";
import { DropdownMenuDemo } from "@/components/dropdown";
import ConfirmDialog from "@/components/confirm-dialog";
import ToastAlert from "@/components/alertdialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SOCIAL_PLATFORMS = [
  { name: "WhatsApp", href: (u) => `https://wa.me/?text=${encodeURIComponent(u)}`, domain: "whatsapp.com" },
  { name: "Facebook", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`, domain: "facebook.com" },
  { name: "X", href: (u) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}`, domain: "x.com" },
  { name: "LinkedIn", href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`, domain: "linkedin.com" },
];

function ShareLinkModal({ link, onClose }) {
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Share your link"
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
          <CardTitle className="text-xl">Share your SnapURL link</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-5">
            {SOCIAL_PLATFORMS.map((p) => (
              <a
                key={p.name}
                href={p.href(link)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2 rounded-md p-1 transition-opacity hover:opacity-80"
              >
                <span className="flex size-12 items-center justify-center rounded-full border bg-card">
                  <Image
                    src={`https://www.google.com/s2/favicons?domain=${p.domain}&sz=64`}
                    width={28}
                    height={28}
                    alt=""
                    className="size-7"
                    unoptimized
                  />
                </span>
                <span className="text-xs font-medium">{p.name}</span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
            <span className="min-w-0 flex-1 truncate text-sm font-medium">
              {link}
            </span>
            <Button
              size="sm"
              className="shrink-0 gap-2"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(link);
                  setCopied(true);
                } catch {
                }
              }}
            >
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <Skeleton className="h-5 w-28" />

      <Card>
        <CardContent className="flex items-start gap-4 p-6">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-72" />
            <Skeleton className="h-4 w-56" />
          </div>
        </CardContent>
      </Card>

      <Skeleton className="h-[340px] w-full rounded-xl" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-[420px] w-full rounded-xl" />
        <Skeleton className="h-[420px] w-full rounded-xl" />
      </div>
    </div>
  );
}

function normalizeDaily(daily = []) {
  return daily.map((item) => ({
    date: String(item.day).split("T")[0],
    clicks: Number(item.clicks) || 0,
  }));
}

function formatCountries(rows = []) {
  const arr = rows
    .map((item) => ({
      country: item.country || "Unknown",
      clicks: Number(item.total) || 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  const total = arr.reduce((sum, item) => sum + item.clicks, 0);

  return arr.map((item, index) => ({
    rank: index + 1,
    country: item.country,
    clicks: item.clicks,
    percentage: total > 0 ? Math.round((item.clicks / total) * 100) : 0,
  }));
}

function formatCreatedAt(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const hrs = String(Math.floor(Math.abs(offset) / 60)).padStart(2, "0");
  const mins = String(Math.abs(offset) % 60).padStart(2, "0");

  return `${formatIST(date)} GMT${sign}${hrs}:${mins}`;
}

export default function LinkAnalytics() {
  const router = useRouter();
  const { urlId } = useParams();

  const validId = Number.isInteger(Number(urlId)) && Number(urlId) > 0;

  const [isCopied, setIsCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [isShare, setIsShare] = useState(false);

  const deleteApi = useApi(`/url/delete/${urlId}`, { method: "DELETE" });
  const overviewApi = useApi(`/analytics/${urlId}/overview`, {
    auto: validId,
    method: "GET",
  });
  const clicksApi = useApi(`/analytics/${urlId}/allclicks`, {
    auto: validId,
    method: "GET",
  });

  useEffect(() => {
    if (!isCopied) return;
    const t = setTimeout(() => setIsCopied(false), 2000);
    return () => clearTimeout(t);
  }, [isCopied]);

  if (!validId) notFound();

  const overview = overviewApi.data?.data?.overview;
  const clicks = clicksApi.data?.data?.clicks ?? [];

  if (overviewApi.errorStatus === 404) notFound();

  if (overviewApi.error) {
    return (
      <div className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t load this link</AlertTitle>
          <AlertDescription className="flex flex-col items-start gap-3">
            {overviewApi.error}
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/links">Back to links</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (overviewApi.loading || !overview) return <DetailSkeleton />;

  const { url, summary, daily, countries, devices, referrers } = overview;
  const href = shortUrl(url.short_code);
  const favicon = faviconFor(url.original_url);
  const countryRows = formatCountries(countries);
  const title = url.title?.trim() && url.title !== "Untitled"
    ? url.title
    : titleFromUrl(url.original_url);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(href);
      setIsCopied(true);
    } catch {
      setToast({
        type: "error",
        message: "Couldn't copy",
        description: "Your browser blocked clipboard access.",
      });
    }
  };

  const handleDelete = async () => {
    const res = await deleteApi.request();
    if (!res) {
      setToast({
        type: "error",
        message: "Could not delete link",
        description: deleteApi.errorRef.current || "An unexpected error occurred.",
      });
      return;
    }
    router.push("/dashboard/links");
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      {toast && <ToastAlert key={toast.description} {...toast} />}

      {isShare && (
        <ShareLinkModal link={href} onClose={() => setIsShare(false)} />
      )}

      <ConfirmDialog
        open={showConfirm}
        setOpen={setShowConfirm}
        title="Delete link"
        description="Are you sure you want to delete this link? Its click history goes with it and this cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDelete}
      />

      <Button asChild variant="ghost" size="sm" className="-ml-2 gap-1">
        <Link href="/dashboard/links">
          <ChevronLeft className="size-4" />
          Back to list
        </Link>
      </Button>

      <Card>
        <CardContent className="flex flex-wrap items-start justify-between gap-4 p-6">
          <div className="flex min-w-0 flex-1 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
              {favicon ? (
                <Image
                  width={24}
                  height={24}
                  src={favicon}
                  alt=""
                  className="size-6"
                  unoptimized
                />
              ) : (
                <Link2 className="size-5 text-muted-foreground" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-semibold tracking-tight sm:text-2xl">
                {title}
              </h1>

              <div className="mt-1.5 flex items-center gap-1.5">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate font-medium text-primary hover:underline"
                >
                  {shortUrlLabel(url.short_code)}
                </a>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 shrink-0"
                  onClick={handleCopy}
                  aria-label="Copy short link"
                >
                  {isCopied ? (
                    <Check className="size-3.5 text-success" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </Button>
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <CornerDownRight className="size-4 shrink-0" />
                <a
                  href={url.original_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline"
                >
                  {url.original_url}
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t pt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-4" />
                  {formatCreatedAt(url.created_at)}
                </span>
                <span className="flex items-center gap-1.5">
                  <TagIcon className="size-4" />
                  No tags
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsShare(true)}
              aria-label="Share link"
            >
              <Share2 className="size-4" />
            </Button>

            <DropdownMenuDemo
              trigger={
                <Button variant="ghost" size="icon" aria-label="More actions">
                  <MoreVertical className="size-4" />
                </Button>
              }
              label="Actions"
              items={[
                {
                  label: "Copy short link",
                  icon: <Copy size={16} />,
                  onClick: handleCopy,
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={16} />,
                  onClick: () => setShowConfirm(true),
                },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total clicks", value: summary?.total_clicks ?? 0 },
          { label: "Unique visitors", value: summary?.unique_users ?? 0 },
          { label: "Countries", value: summary?.unique_countries ?? 0 },
          { label: "Referrers", value: summary?.unique_referrers ?? 0 },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <ChartBarInteractive
        data={normalizeDaily(daily)}
        title="Clicks over time"
        description="Daily clicks on this link"
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Countries</CardTitle>
        </CardHeader>
        <CardContent>
          {countryRows.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Location analytics will appear here once this link gets traffic.
            </p>
          ) : (
            <div className="space-y-3">
              {countryRows.map((row) => (
                <div key={row.country} className="flex items-center gap-3 sm:gap-4">
                  <span className="w-5 shrink-0 text-sm text-muted-foreground tabular-nums">
                    {row.rank}
                  </span>
                  <span className="w-24 shrink-0 truncate text-sm font-medium sm:w-32">
                    {row.country}
                  </span>
                  <div
                    className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-muted"
                    role="presentation"
                  >
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-sm tabular-nums">
                    {row.clicks}
                  </span>
                  <span className="w-12 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
                    {row.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartPieDonut
          title="Referrer traffic"
          description="Where these clicks came from"
          data={referrers}
          labelKey="referrer"
          valueKey="total"
        />
        <ChartPieDonut
          title="Device breakdown"
          description="Clicks by device type"
          data={devices}
          labelKey="device_type"
          valueKey="total"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">
          All clicks
        </h2>

        {clicksApi.loading ? (
          <Skeleton className="h-64 w-full rounded-xl" />
        ) : clicksApi.error ? (
          <Alert variant="destructive">
            <AlertDescription>
              Could not load the click log: {clicksApi.error}
            </AlertDescription>
          </Alert>
        ) : clicks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No clicks recorded yet.
            </CardContent>
          </Card>
        ) : (
          <ClicksTable data={clicks} />
        )}
      </div>
    </div>
  );
}
