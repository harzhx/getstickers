import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getOrderByToken } from "@/lib/orders.functions";
import { formatUsd, packName, styleName, type PackTier, type StickerStyle } from "@/lib/pricing";

const TITLE = "Order Received — StickerForge";
const DESCRIPTION = "Your custom Telegram sticker pack order is in. Here's what happens next.";

export const Route = createFileRoute("/success")({
  validateSearch: z.object({ token: z.string().optional() }),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { token } = Route.useSearch();
  const fetchOrder = useServerFn(getOrderByToken);

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", token],
    queryFn: () => fetchOrder({ data: { token: token! } }),
    enabled: !!token,
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 py-16">
        <CheckCircle2 className="size-12 text-primary" aria-hidden="true" />
        <h1 className="mt-5 font-display text-3xl font-bold sm:text-4xl">Order received</h1>
        <p className="mt-3 text-muted-foreground">
          We&apos;ve got your files. Our artists review the brief and email you a payment link plus
          the first previews — usually within one working day.
        </p>

        {token && (
          <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6">
            {isLoading && <p className="text-sm text-muted-foreground">Loading your order…</p>}
            {order && (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Style</dt>
                  <dd>{styleName(order.style as StickerStyle)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pack</dt>
                  <dd>
                    {packName(order.pack as PackTier)} · {order.sticker_count} stickers
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Telegram</dt>
                  <dd>@{order.telegram_handle}</dd>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 font-display text-lg font-bold">
                  <dt>Total due</dt>
                  <dd>{formatUsd(order.amount_cents)}</dd>
                </div>
              </dl>
            )}
            {!isLoading && !order && (
              <p className="text-sm text-muted-foreground">We couldn&apos;t find that order.</p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              Keep this page bookmarked to check your order details.
            </p>
          </div>
        )}

        <Link
          to="/"
          className="mt-8 inline-block rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-primary"
        >
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
