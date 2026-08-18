import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const createOrderSchema = z.object({
  email: z.string().email().max(200),
  telegramHandle: z.string().trim().min(2).max(64),
  packName: z.string().trim().min(1).max(64),
  style: z.enum(["animated_vector", "three_d", "realistic"]),
  pack: z.enum(["starter", "popular", "studio"]),
  notes: z.string().trim().max(1000).optional().default(""),
  files: z
    .array(z.object({ path: z.string().min(1).max(400), name: z.string().min(1).max(200) }))
    .min(1)
    .max(30),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => createOrderSchema.parse(data))
  .handler(async ({ data }) => {
    const { PRICE_TABLE, PACKS } = await import("./pricing");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const amountCents = PRICE_TABLE[data.pack][data.style];
    const stickerCount = PACKS.find((p) => p.id === data.pack)?.count ?? 5;

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        email: data.email,
        telegram_handle: data.telegramHandle.replace(/^@/, ""),
        pack_name: data.packName,
        style: data.style,
        pack: data.pack,
        sticker_count: stickerCount,
        amount_cents: amountCents,
        currency: "USD",
        notes: data.notes || null,
      })
      .select("id, lookup_token, amount_cents")
      .single();

    if (error || !order) {
      console.error("Failed to create order", error);
      throw new Error("Could not save your order. Please try again.");
    }

    const { error: filesError } = await supabaseAdmin.from("order_files").insert(
      data.files.map((f) => ({
        order_id: order.id,
        storage_path: f.path,
        original_filename: f.name,
      })),
    );

    if (filesError) {
      console.error("Failed to attach order files", filesError);
    }

    return {
      orderId: order.id,
      token: order.lookup_token,
      amountCents: order.amount_cents,
    };
  });

export const getOrderByToken = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ token: z.string().min(10).max(100) }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id, pack_name, style, pack, sticker_count, amount_cents, status, telegram_handle")
      .eq("lookup_token", data.token)
      .maybeSingle();

    if (error) {
      console.error("Failed to load order", error);
      throw new Error("Could not load this order.");
    }

    return order;
  });
