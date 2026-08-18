import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { STYLES, PRICE_TABLE, formatUsd, PACKS } from "@/lib/pricing";
import styleAnimated from "@/assets/style-animated-vector.jpg";
import style3d from "@/assets/style-3d.jpg";
import styleRealistic from "@/assets/style-realistic.jpg";

const TITLE = "Sticker Styles — Animated Vector, 3D & Realistic | StickerForge";
const DESCRIPTION =
  "Compare the three StickerForge looks: animated vector, glossy 3D, and realistic die-cut photo stickers for Telegram, with pricing for each pack size.";

export const Route = createFileRoute("/styles")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StylesPage,
});

const IMAGES: Record<string, string> = {
  animated_vector: styleAnimated,
  three_d: style3d,
  realistic: styleRealistic,
};

function StylesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 py-14">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">Pick your look</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Every pack is drawn in a single consistent style so your stickers read as one set in chat.
        </p>

        <div className="mt-12 space-y-12">
          {STYLES.map((style, i) => (
            <article
              key={style.id}
              className={`grid items-center gap-8 md:grid-cols-2 ${i % 2 ? "md:[&>img]:order-2" : ""}`}
            >
              <img
                src={IMAGES[style.id]}
                alt={`${style.name} Telegram sticker example`}
                width={768}
                height={768}
                loading="lazy"
                className="sticker-tilt aspect-square w-full rounded-3xl border border-border/60 object-cover"
              />
              <div>
                <h2 className="font-display text-2xl font-bold">{style.name}</h2>
                <p className="mt-2 text-muted-foreground">{style.tagline}</p>
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Best for: </span>
                  {style.bestFor}
                </p>
                <ul className="mt-5 space-y-1.5 text-sm">
                  {PACKS.map((pack) => (
                    <li key={pack.id} className="flex justify-between border-b border-border/50 pb-1.5">
                      <span className="text-muted-foreground">
                        {pack.name} · {pack.count} stickers
                      </span>
                      <span className="font-medium">{formatUsd(PRICE_TABLE[pack.id][style.id])}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/order"
                  search={{ style: style.id }}
                  className="mt-6 inline-block rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-transform hover:scale-105"
                >
                  Order in {style.name}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
