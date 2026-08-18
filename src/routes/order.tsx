import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Upload, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { createOrder } from "@/lib/orders.functions";
import {
  ACCEPTED_TYPES,
  MAX_UPLOAD_BYTES,
  PACKS,
  PRICE_TABLE,
  STYLES,
  formatUsd,
  packName,
  styleName,
  type PackTier,
  type StickerStyle,
} from "@/lib/pricing";
import styleAnimated from "@/assets/style-animated-vector.jpg";
import style3d from "@/assets/style-3d.jpg";
import styleRealistic from "@/assets/style-realistic.jpg";

const TITLE = "Start Your Sticker Pack — StickerForge";
const DESCRIPTION =
  "Upload your photos or artwork, choose animated vector, 3D or realistic, pick a pack size and check out to get your custom Telegram stickers.";

const searchSchema = z.object({
  style: z.enum(["animated_vector", "three_d", "realistic"]).optional(),
  pack: z.enum(["starter", "popular", "studio"]).optional(),
});

export const Route = createFileRoute("/order")({
  validateSearch: searchSchema,
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
  component: OrderPage,
});

const STYLE_IMAGES: Record<StickerStyle, string> = {
  animated_vector: styleAnimated,
  three_d: style3d,
  realistic: styleRealistic,
};

type Uploaded = { path: string; name: string; preview: string };

const STEP_LABELS = ["Upload", "Style", "Pack", "Checkout"];

function OrderPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const submitOrder = useServerFn(createOrder);

  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<Uploaded[]>([]);
  const [uploading, setUploading] = useState(false);
  const [style, setStyle] = useState<StickerStyle | null>(search.style ?? null);
  const [pack, setPack] = useState<PackTier | null>(search.pack ?? null);
  const [email, setEmail] = useState("");
  const [handle, setHandle] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const total = style && pack ? PRICE_TABLE[pack][style] : 0;

  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    setUploading(true);
    const accepted: Uploaded[] = [];
    for (const file of Array.from(list).slice(0, 30 - files.length)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`${file.name} isn't a PNG, JPG or WebP.`);
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        toast.error(`${file.name} is larger than 10 MB.`);
        continue;
      }
      const path = `uploads/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, "_")}`;
      const { error } = await supabase.storage.from("sticker-uploads").upload(path, file);
      if (error) {
        toast.error(`Couldn't upload ${file.name}.`);
        continue;
      }
      accepted.push({ path, name: file.name, preview: URL.createObjectURL(file) });
    }
    setFiles((prev) => [...prev, ...accepted]);
    setUploading(false);
    if (accepted.length) toast.success(`${accepted.length} file(s) uploaded.`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!style || !pack) return;
    setSubmitting(true);
    try {
      const result = await submitOrder({
        data: {
          email,
          telegramHandle: handle,
          packName: packName(pack),
          style,
          pack,
          notes,
          files: files.map((f) => ({ path: f.path, name: f.name })),
        },
      });
      navigate({ to: "/success", search: { token: result.token } });
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong saving your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const canContinue = [files.length > 0, !!style, !!pack, true][step];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Build your pack</h1>

        <ol className="mt-6 flex flex-wrap gap-2 text-sm">
          {STEP_LABELS.map((label, i) => (
            <li
              key={label}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 ${
                i === step
                  ? "border-primary bg-primary/10 text-primary"
                  : i < step
                    ? "border-border/60 text-muted-foreground"
                    : "border-border/40 text-muted-foreground/60"
              }`}
            >
              {i < step ? <Check className="size-4" aria-hidden="true" /> : <span>{i + 1}</span>}
              {label}
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-3xl border border-border/60 bg-card p-6">
          {step === 0 && (
            <section>
              <h2 className="font-display text-xl font-semibold">Upload your source files</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                PNG, JPG or WebP up to 10 MB each. Two or three clear references per character work
                best.
              </p>
              <label className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/60 px-6 py-10 text-center transition-colors hover:border-primary">
                <Upload className="size-6 text-primary" aria-hidden="true" />
                <span className="font-medium">Choose files or drop them here</span>
                <span className="text-xs text-muted-foreground">Up to 30 files</span>
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES.join(",")}
                  className="sr-only"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </label>
              {uploading && (
                <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Uploading…
                </p>
              )}
              {files.length > 0 && (
                <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {files.map((f) => (
                    <li key={f.path} className="relative">
                      <img
                        src={f.preview}
                        alt={f.name}
                        className="aspect-square w-full rounded-xl border border-border/60 object-cover"
                      />
                      <button
                        type="button"
                        aria-label={`Remove ${f.name}`}
                        onClick={() => setFiles((prev) => prev.filter((x) => x.path !== f.path))}
                        className="absolute -top-2 -right-2 rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {step === 1 && (
            <section>
              <h2 className="font-display text-xl font-semibold">Choose a style</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {STYLES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStyle(s.id)}
                    className={`overflow-hidden rounded-2xl border text-left transition-colors ${
                      style === s.id ? "border-primary" : "border-border/60 hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={STYLE_IMAGES[s.id]}
                      alt={`${s.name} example`}
                      loading="lazy"
                      className="aspect-square w-full object-cover"
                    />
                    <span className="block p-3">
                      <span className="block font-display font-semibold">{s.name}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{s.tagline}</span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section>
              <h2 className="font-display text-xl font-semibold">Choose a pack size</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {PACKS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPack(p.id)}
                    className={`rounded-2xl border p-5 text-left transition-colors ${
                      pack === p.id ? "border-primary" : "border-border/60 hover:border-primary/50"
                    }`}
                  >
                    <span className="block font-display text-lg font-semibold">{p.name}</span>
                    <span className="block text-sm text-muted-foreground">
                      {p.count} stickers
                    </span>
                    <span className="mt-3 block font-display text-2xl font-bold">
                      {style ? formatUsd(PRICE_TABLE[p.id][style]) : "—"}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">{p.blurb}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit}>
              <h2 className="font-display text-xl font-semibold">Where should we send it?</h2>
              <dl className="mt-4 space-y-1 rounded-2xl bg-background/60 p-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Style</dt>
                  <dd>{style ? styleName(style) : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pack</dt>
                  <dd>{pack ? `${packName(pack)} · ${PACKS.find((p) => p.id === pack)!.count}` : "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Reference files</dt>
                  <dd>{files.length}</dd>
                </div>
                <div className="mt-2 flex justify-between border-t border-border/60 pt-2 font-display text-lg font-bold">
                  <dt>Total</dt>
                  <dd>{formatUsd(total)}</dd>
                </div>
              </dl>

              <div className="mt-5 space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="handle">Telegram handle</Label>
                  <Input
                    id="handle"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@yourhandle"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Brief (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Expressions, catchphrases, colours, in-jokes…"
                    className="mt-1.5"
                    rows={4}
                  />
                </div>
              </div>

              <Button type="submit" disabled={submitting} className="mt-6 w-full rounded-full" size="lg">
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Placing order…
                  </>
                ) : (
                  `Place order · ${formatUsd(total)}`
                )}
              </Button>
            </form>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            className="rounded-full"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            Back
          </Button>
          {step < 3 && (
            <Button
              type="button"
              className="rounded-full"
              disabled={!canContinue}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </Button>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
