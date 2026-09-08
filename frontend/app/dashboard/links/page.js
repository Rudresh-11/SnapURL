"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BarChart2,
  Calendar,
  Check,
  Copy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import useApi from "@/hooks/useApi";
import { faviconFor, shortUrl, shortUrlLabel, titleFromUrl } from "@/lib/links";
import ConfirmDialog from "@/components/confirm-dialog";
import ToastAlert from "@/components/alertdialog";
import { DropdownMenuDemo } from "@/components/dropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function LinkCardSkeleton() {
  return (
    <Card>
      <CardContent className="flex items-start gap-4 p-5">
        <Skeleton className="mt-1 size-4 rounded-sm" />
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-6 pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Link2 className="size-6 text-muted-foreground" />
        </span>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">No links yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Shorten your first URL and it will show up here with its click
            history.
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/dashboard/links/create">
            <Plus className="size-4" />
            Create your first link
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function LinkRow({ link, selected, onSelect, onCopy, copied, onRequestDelete }) {
  const favicon = faviconFor(link.dest);

  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardContent className="flex items-start gap-3 p-5 sm:gap-4">
        <Checkbox
          checked={selected}
          onCheckedChange={(value) => onSelect(link.id, Boolean(value))}
          aria-label={`Select ${link.title}`}
          className="mt-1.5"
        />

        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
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
            <Link2 className="size-4 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">
            <Link
              href={`/dashboard/${link.id}`}
              className="rounded-sm hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {link.title}
            </Link>
          </h3>

          <div className="mt-1 flex items-center gap-1.5">
            <a
              href={link.shortHref}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-sm font-medium text-primary hover:underline"
            >
              {link.shortLabel}
            </a>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={() => onCopy(link)}
              aria-label={`Copy short link for ${link.title}`}
            >
              {copied ? (
                <Check className="size-3.5 text-success" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </Button>
          </div>

          <a
            href={link.dest}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
          >
            <ExternalLink className="size-3.5 shrink-0" />
            <span className="truncate">{link.dest}</span>
          </a>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BarChart2 className="size-3.5" />
              {link.clicks} {link.clicks === 1 ? "click" : "clicks"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {link.date}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button asChild variant="ghost" size="icon" aria-label="View analytics">
            <Link href={`/dashboard/${link.id}`}>
              <BarChart2 className="size-4" />
            </Link>
          </Button>

          <DropdownMenuDemo
            trigger={
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontal className="size-4" />
              </Button>
            }
            items={[
              {
                label: "Copy short link",
                icon: <Copy size={16} />,
                onClick: () => onCopy(link),
              },
              {
                label: "Delete",
                icon: <Trash2 size={16} />,
                onClick: () => onRequestDelete(link.id),
              },
            ]}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function LinksPage() {
  const [links, setLinks] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [query, setQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [pendingDeleteIds, setPendingDeleteIds] = useState(null);

  const listApi = useApi("/url/get");
  const deleteApi = useApi(null, { method: "DELETE" });

  const { request: loadLinks } = listApi;

  useEffect(() => {
    let active = true;

    (async () => {
      const res = await loadLinks();
      if (!active) return;

      if (res?.data) {
        setLinks(
          res.data.map((item) => ({
            id: item.id,
            title: item.title?.trim() || titleFromUrl(item.original_url),
            shortHref: shortUrl(item.short_code),
            shortLabel: shortUrlLabel(item.short_code),
            dest: item.original_url,
            clicks: item.total_clicks ?? 0,
            date: new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          }))
        );
      }
      setLoaded(true);
    })();

    return () => {
      active = false;
    };
  }, [loadLinks]);

  useEffect(() => {
    if (copiedId === null) return;
    const t = setTimeout(() => setCopiedId(null), 2000);
    return () => clearTimeout(t);
  }, [copiedId]);

  const visibleLinks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return links;
    return links.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.dest.toLowerCase().includes(q) ||
        l.shortLabel.toLowerCase().includes(q)
    );
  }, [links, query]);

  const visibleIds = visibleLinks.map((l) => l.id);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const handleSelect = (id, checked) => {
    setSelectedIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)
    );
  };

  const handleSelectAll = (checked) => {
    setSelectedIds(checked ? visibleIds : []);
  };

  const handleCopy = async (link) => {
    try {
      await navigator.clipboard.writeText(link.shortHref);
      setCopiedId(link.id);
    } catch {
      setToast({
        type: "error",
        message: "Couldn't copy",
        description: "Your browser blocked clipboard access.",
      });
    }
  };

  const handleDelete = async () => {
    const ids = pendingDeleteIds ?? [];
    setPendingDeleteIds(null);
    if (!ids.length) return;

    const failed = [];
    for (const id of ids) {
      const res = await deleteApi.request(null, `/url/delete/${id}`, "DELETE");
      if (!res) failed.push(id);
    }

    const deleted = ids.filter((id) => !failed.includes(id));
    if (deleted.length) {
      setLinks((prev) => prev.filter((l) => !deleted.includes(l.id)));
    }
    setSelectedIds((prev) => prev.filter((id) => !deleted.includes(id)));

    setToast(
      failed.length
        ? {
            type: "error",
            message: "Some links could not be deleted",
            description: `${deleted.length} removed, ${failed.length} failed.`,
          }
        : {
            type: "success",
            message: "Links deleted",
            description: `${deleted.length} link${
              deleted.length === 1 ? "" : "s"
            } removed.`,
          }
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      {toast && <ToastAlert key={toast.message + toast.description} {...toast} />}

      <ConfirmDialog
        open={pendingDeleteIds !== null}
        setOpen={(open) => !open && setPendingDeleteIds(null)}
        title={
          pendingDeleteIds?.length === 1 ? "Delete link" : "Delete links"
        }
        description={`Are you sure you want to delete ${
          pendingDeleteIds?.length ?? 0
        } link(s)? This also removes their click history and cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
      />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Snapped links
          </h1>
          <p className="text-sm text-muted-foreground">
            {loaded
              ? `${links.length} link${links.length === 1 ? "" : "s"}`
              : "Loading your links..."}
          </p>
        </div>

        <Button asChild className="gap-2">
          <Link href="/dashboard/links/create">
            <Plus className="size-4" />
            Create link
          </Link>
        </Button>
      </div>

      {!loaded ? (
        <div className="space-y-4">
          <LinkCardSkeleton />
          <LinkCardSkeleton />
          <LinkCardSkeleton />
        </div>
      ) : links.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search links"
                aria-label="Search links"
                className="pl-9"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={allVisibleSelected}
                  onCheckedChange={(v) => handleSelectAll(Boolean(v))}
                  aria-label="Select all links"
                />
                Select all
              </label>

              {selectedIds.length > 0 && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {selectedIds.length} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-2"
                    disabled={deleteApi.loading}
                    onClick={() => setPendingDeleteIds(selectedIds)}
                  >
                    <Trash2 className="size-4" />
                    {deleteApi.loading ? "Deleting..." : "Delete"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {visibleLinks.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                No links match “{query}”.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {visibleLinks.map((link) => (
                <LinkRow
                  key={link.id}
                  link={link}
                  selected={selectedIds.includes(link.id)}
                  onSelect={handleSelect}
                  onCopy={handleCopy}
                  copied={copiedId === link.id}
                  onRequestDelete={(id) => setPendingDeleteIds([id])}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
