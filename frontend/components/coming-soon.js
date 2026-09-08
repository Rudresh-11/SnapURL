import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ComingSoon({
  icon: Icon,
  title,
  description,
  backHref = "/dashboard/links",
  backLabel = "Back to links",
}) {
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          {Icon && (
            <span className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Icon className="size-6 text-muted-foreground" />
            </span>
          )}

          <div className="space-y-1.5">
            <h1 className="text-lg font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href={backHref}>{backLabel}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
