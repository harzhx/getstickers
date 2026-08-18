CREATE TYPE public.sticker_style AS ENUM ('animated_vector', 'three_d', 'realistic');
CREATE TYPE public.pack_tier AS ENUM ('starter', 'popular', 'studio');
CREATE TYPE public.order_status AS ENUM ('pending', 'paid', 'failed', 'in_production', 'delivered');

CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lookup_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  email TEXT NOT NULL,
  telegram_handle TEXT NOT NULL,
  pack_name TEXT NOT NULL,
  style public.sticker_style NOT NULL,
  pack public.pack_tier NOT NULL,
  sticker_count INTEGER NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status public.order_status NOT NULL DEFAULT 'pending',
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX orders_lookup_token_idx ON public.orders (lookup_token);
CREATE INDEX orders_razorpay_order_id_idx ON public.orders (razorpay_order_id);

GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX order_files_order_id_idx ON public.order_files (order_id);

GRANT ALL ON public.order_files TO service_role;
ALTER TABLE public.order_files ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE POLICY "Anyone can upload sticker reference images"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'sticker-uploads');