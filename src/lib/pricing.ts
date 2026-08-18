export type StickerStyle = "animated_vector" | "three_d" | "realistic";
export type PackTier = "starter" | "popular" | "studio";

export const STYLES: {
  id: StickerStyle;
  name: string;
  tagline: string;
  bestFor: string;
}[] = [
  {
    id: "animated_vector",
    name: "Animated Vector",
    tagline: "Bold flat shapes that loop and bounce inside chat.",
    bestFor: "Mascots, reaction packs, community branding.",
  },
  {
    id: "three_d",
    name: "3D",
    tagline: "Glossy rendered characters with depth and studio light.",
    bestFor: "Product avatars, game characters, premium packs.",
  },
  {
    id: "realistic",
    name: "Realistic",
    tagline: "Photo cut-outs with clean die-cut borders and shadows.",
    bestFor: "Friend groups, creators, in-joke packs from real photos.",
  },
];

export const PACKS: {
  id: PackTier;
  name: string;
  count: number;
  blurb: string;
  highlight?: boolean;
}[] = [
  { id: "starter", name: "Starter", count: 5, blurb: "A tight set to test the vibe." },
  {
    id: "popular",
    name: "Popular",
    count: 15,
    blurb: "The sweet spot for a full chat pack.",
    highlight: true,
  },
  { id: "studio", name: "Studio", count: 30, blurb: "A complete library with variations." },
];

/** Price in US cents, indexed by pack then style. Source of truth on the server. */
export const PRICE_TABLE: Record<PackTier, Record<StickerStyle, number>> = {
  starter: { animated_vector: 600, three_d: 900, realistic: 1100 },
  popular: { animated_vector: 1500, three_d: 2100, realistic: 2700 },
  studio: { animated_vector: 2500, three_d: 3500, realistic: 4500 },
};

export function priceCents(pack: PackTier, style: StickerStyle): number {
  return PRICE_TABLE[pack][style];
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function styleName(id: StickerStyle): string {
  return STYLES.find((s) => s.id === id)?.name ?? id;
}

export function packName(id: PackTier): string {
  return PACKS.find((p) => p.id === id)?.name ?? id;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
