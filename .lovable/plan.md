# StickerForge — Custom Telegram Sticker Studio

A one-stop site where customers upload their photos/art, pick a sticker style, choose a pack size, and pay with Razorpay to place the order.

## Look and feel

- Palette: Electric Coral (#ff6b6b, #ee5a70, #c44569, #574b90) on a near-black canvas so sticker art pops.
- Type: Space Grotesk headings, DM Sans body.
- Playful studio vibe: rounded cards, sticker-peel hover tilts, subtle glow on the primary CTA. No generic purple gradient hero.

## Pages

1. **Home (`/`)** — hero with headline + single CTA into the order flow, a strip of style examples, "how it works" in 3 steps, tiered pricing cards, short FAQ.
2. **Order (`/order`)** — the core 4-step flow (see below).
3. **Success (`/order/success`)** — payment confirmed, order reference, what happens next, Telegram delivery note.
4. **Styles (`/styles`)** — deeper showcase of Animated Vector / 3D / Realistic with sample imagery and what each is best for.

## Order flow (single page, stepped)

1. **Upload** — drag-and-drop multiple images, previews, remove, size/type validation (PNG/JPG/WEBP, max ~10MB each). Files upload to Cloud storage.
2. **Style** — pick one: Animated Vector, 3D, Realistic. Each with a visual card and a price modifier.
3. **Pack + details** — tiered packs (Starter 5, Popular 15, Studio 30), pack name, Telegram handle, email, optional notes. Live price total.
4. **Pay** — order saved, then Razorpay Checkout opens; on success the order is verified server-side and marked paid.

## Pricing (editable later)

| Pack | Stickers | Animated Vector | 3D | Realistic |
|---|---|---|---|---|
| Starter | 5 | ₹499 | ₹699 | ₹899 |
| Popular | 15 | ₹1,199 | ₹1,699 | ₹2,199 |
| Studio | 30 | ₹1,999 | ₹2,899 | ₹3,699 |

Prices are computed server-side at order creation so the client can't tamper with them.

## Backend

Lovable Cloud provides the database and file storage.

- `orders` table: id, email, telegram handle, style, pack, sticker count, amount, currency, status (`pending`/`paid`/`failed`/`in_production`/`delivered`), razorpay order/payment ids, notes, created_at.
- `order_files` table: order id, storage path, original filename.
- Storage bucket `sticker-uploads` (private), files uploaded under a per-order folder.
- No login: orders are created anonymously, rows are not publicly readable, and each customer gets a lookup token in their success URL. Server functions do the reads/writes.

## Razorpay

Razorpay is not a built-in Lovable provider, so it needs your own keys:

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (test keys are fine to start) stored as project secrets.
- Server function creates the Razorpay order; the Razorpay Checkout script runs in the browser; a second server function verifies the HMAC signature before marking the order paid.
- A public webhook route (`/api/public/razorpay-webhook`) with signature verification handles payments that complete out-of-band.

I'll ask for the two keys when we get to that step.

## Technical notes

- TanStack Start routes: `index.tsx`, `order.tsx`, `order.success.tsx`, `styles.tsx`, plus `api/public/razorpay-webhook.ts`.
- Server functions in `src/lib/orders.functions.ts` (create order, verify payment) with Zod validation; amounts derived from a server-side price table.
- Razorpay checkout.js loaded on demand in the browser only.
- Design tokens added to `src/styles.css`; fonts via `<link>` in `__root.tsx`.
- Per-route `head()` metadata for SEO on every page.
- Sample style artwork generated as images for the hero and style cards.

## Build order

1. Enable Lovable Cloud, create tables + storage bucket.
2. Design system + home page.
3. Styles page.
4. Order flow with upload, style, pack, live pricing.
5. Add Razorpay keys, wire checkout + verification + webhook.
6. Success page and polish.
