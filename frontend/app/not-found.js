import Link from "next/link";
import { LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted">
        <LinkIcon className="size-6 text-muted-foreground" />
      </span>

      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          This link doesn&apos;t exist
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The short link may have been deleted, or the address was mistyped.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild>
          <Link href="/">Go to homepage</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard/links">Open dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
