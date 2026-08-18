import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Upload, Palette, Send } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PACKS, STYLES, PRICE_TABLE, formatUsd } from "@/lib/pricing";
import heroStickers from "@/assets/hero-stickers.jpg";
import styleAnimated from "@/assets/style-animated-vector.jpg";
import style3d from "@/assets/style-3d.jpg";
import styleRealistic from "@/assets/style-realistic.jpg";

const TITLE = "StickerForge — Custom Telegram Sticker Packs";
const DESCRIPTION =
  "Upload your photos or art, pick animated vector, 3D or realistic, and get a ready-to-add custom Telegram sticker pack from $6.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

const STYLE_IMAGES: Record<string, string> = {
  animated_vector: styleAnimated,
  three_d: style3d,
  realistic: styleRealistic,
};

const STEPS = [
  {
    icon: Upload,
    title: "Upload your source",
    body: "Photos, doodles, logos, screenshots — anything we can build characters from.",
  },
  {
    icon: Palette,
    title: "Pick a style",
    body: "Animated vector, glossy 3D, or realistic die-cut. One look across the whole pack.",
  },
  {
    icon: Send,
    title: "Add to Telegram",
    body: "We hand back a finished pack link you tap once to install and share.",
  },
];

const FAQ = [
  {
    q: "How many photos should I upload?",
    a: "Two or three good references per character is plenty. More angles help for 3D and realistic packs.",
  },
  {
    q: "How long does a pack take?",
    a: "Most packs land in 3–5 days. Studio packs with 30 stickers can take up to a week.",
  },
  {
    q: "Do I own the stickers?",
    a: "Yes. You get full rights to the artwork and the source files on request.",
  },
  {
    q: "Can I ask for changes?",
    a: "Every pack includes one round of revisions on the whole set before we publish it.",
  },
];

function Index() {
  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 grid-dots opacity-40" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Custom packs from $6
              </span>
              <h1 className="mt-5 font-display text-4xl leading-[1.05] font-bold sm:text-5xl md:text-6xl">
                Your face. Your art.
                <span className="block text-primary">Your Telegram stickers.</span>
              </h1>
              <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
                Send us the raw material, choose a style, and we hand back a finished sticker pack
                ready to drop into any chat.
              </p>
              <div className="mt-8">
                <Link
                  to="/order"
                  className="glow-cta inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-display text-base font-semibold text-primary-foreground transition-transform hover:scale-105"
                >
                  Start your pack
                </Link>
              </div>
            </div>
            <img
              src={heroStickers}
              alt="A collage of colourful die-cut chat stickers"
              width={1280}
              height={960}
              className="rounded-3xl border border-border/60"
            />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Three styles, one pack</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {STYLES.map((style) => (
              <Link
                key={style.id}
                to="/styles"
                className="sticker-tilt block overflow-hidden rounded-3xl border border-border/60 bg-card"
              >
                <img
                  src={STYLE_IMAGES[style.id]}
                  alt={`${style.name} sticker example`}
                  width={768}
                  height={768}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold">{style.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{style.tagline}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-border/60 bg-surface/40">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">How it works</h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="rounded-3xl border border-border/60 bg-card p-6">
                  <step.icon className="size-6 text-primary" aria-hidden="true" />
                  <p className="mt-4 text-xs font-semibold tracking-widest text-muted-foreground">
                    STEP {i + 1}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-14">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Pack pricing</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Price depends on pack size and the style you choose.
          </p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`rounded-3xl border bg-card p-6 ${
                  pack.highlight ? "border-primary/70" : "border-border/60"
                }`}
              >
                {pack.highlight && (
                  <span className="mb-3 inline-block rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
                    Most ordered
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold">{pack.name}</h3>
                <p className="text-sm text-muted-foreground">{pack.count} stickers</p>
                <p className="mt-4 font-display text-3xl font-bold">
                  from {formatUsd(PRICE_TABLE[pack.id].animated_vector)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{pack.blurb}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {STYLES.map((style) => (
                    <li key={style.id} className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Check className="size-4 text-primary" aria-hidden="true" />
                        {style.name}
                      </span>
                      <span className="font-medium">
                        {formatUsd(PRICE_TABLE[pack.id][style.id])}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/order"
                  search={{ pack: pack.id }}
                  className="mt-6 block rounded-full bg-primary px-5 py-3 text-center font-medium text-primary-foreground transition-transform hover:scale-105"
                >
                  Choose {pack.name}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 pb-20">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Questions</h2>
          <dl className="mt-6 space-y-4">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-2xl border border-border/60 bg-card p-5">
                <dt className="font-display font-semibold">{item.q}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
