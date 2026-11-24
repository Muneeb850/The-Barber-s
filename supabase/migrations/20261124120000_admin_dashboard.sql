-- ════════════════════════════════════════════════════════════════════════
-- Tom's Barber — Admin dashboard schema
-- Run AFTER 20260731005303_*.sql (which creates public.bookings).
--
-- Security model
--   • Public (anon) can READ site content only.
--   • Only users listed in public.admin_users can WRITE content, read/manage
--     bookings, or upload/delete images. Enforced by RLS (public.is_admin()).
--   • Bookings are created only through the server (service_role key), never
--     directly from the browser.
-- ════════════════════════════════════════════════════════════════════════

-- ─── Admin allow-list ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- A signed-in user may only see their own row (used to check "am I admin?").
DROP POLICY IF EXISTS "Users can see their own admin row" ON public.admin_users;
CREATE POLICY "Users can see their own admin row"
  ON public.admin_users FOR SELECT TO authenticated
  USING (user_id = auth.uid());
-- No INSERT/UPDATE/DELETE policies: admins are added only from the SQL editor.
GRANT SELECT ON public.admin_users TO authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Shared trigger to keep updated_at fresh.
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ─── Bookings: lock down + let admins manage ───────────────────────────
DROP POLICY IF EXISTS "Anyone can create a booking" ON public.bookings;
REVOKE INSERT ON public.bookings FROM anon, authenticated;

ALTER TABLE public.bookings
  DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE public.bookings
  ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('confirmed', 'completed', 'cancelled', 'no_show'));

GRANT SELECT, UPDATE, DELETE ON public.bookings TO authenticated;
DROP POLICY IF EXISTS "Admins read bookings" ON public.bookings;
CREATE POLICY "Admins read bookings" ON public.bookings
  FOR SELECT TO authenticated USING (public.is_admin());
DROP POLICY IF EXISTS "Admins update bookings" ON public.bookings;
CREATE POLICY "Admins update bookings" ON public.bookings
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
DROP POLICY IF EXISTS "Admins delete bookings" ON public.bookings;
CREATE POLICY "Admins delete bookings" ON public.bookings
  FOR DELETE TO authenticated USING (public.is_admin());

-- ─── Key/value site settings (business info, hours, banner, …) ─────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY CHECK (key IN ('business', 'hours', 'closed_dates', 'banner', 'booking', 'page_images')),
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Services ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id text PRIMARY KEY,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 600),
  price integer NOT NULL CHECK (price BETWEEN 0 AND 10000),
  duration integer NOT NULL CHECK (duration BETWEEN 5 AND 600),
  category text NOT NULL DEFAULT 'men' CHECK (category IN ('men', 'ladies')),
  subtitle text NOT NULL DEFAULT '',
  tag text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Gallery ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  src text NOT NULL,
  alt text NOT NULL DEFAULT '' CHECK (char_length(alt) <= 200),
  span text NOT NULL DEFAULT 'tall' CHECK (span IN ('tall', 'wide')),
  storage_path text,
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Testimonials ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  rating integer NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  quote text NOT NULL CHECK (char_length(quote) BETWEEN 1 AND 600),
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── FAQs ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL CHECK (char_length(question) BETWEEN 1 AND 200),
  answer text NOT NULL CHECK (char_length(answer) BETWEEN 1 AND 1500),
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ─── Common: RLS (public read, admin write) + updated_at triggers ──────
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['site_settings', 'services', 'gallery_images', 'testimonials', 'faqs']
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT SELECT ON public.%I TO anon, authenticated', t);
    EXECUTE format('GRANT INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);

    EXECUTE format('DROP POLICY IF EXISTS "Public read" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Public read" ON public.%I FOR SELECT TO anon, authenticated USING (true)', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins insert" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Admins insert" ON public.%I FOR INSERT TO authenticated WITH CHECK (public.is_admin())', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins update" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Admins update" ON public.%I FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())', t);
    EXECUTE format('DROP POLICY IF EXISTS "Admins delete" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Admins delete" ON public.%I FOR DELETE TO authenticated USING (public.is_admin())', t);

    EXECUTE format('DROP TRIGGER IF EXISTS touch_updated_at ON public.%I', t);
    EXECUTE format('CREATE TRIGGER touch_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at()', t);
  END LOOP;
END $$;

-- ─── Storage bucket for uploaded images ────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-images', 'site-images', true, 5242880,
        ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Admins upload site images" ON storage.objects;
CREATE POLICY "Admins upload site images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.is_admin());
DROP POLICY IF EXISTS "Admins update site images" ON storage.objects;
CREATE POLICY "Admins update site images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_admin());
DROP POLICY IF EXISTS "Admins delete site images" ON storage.objects;
CREATE POLICY "Admins delete site images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-images' AND public.is_admin());
-- Public read works through the bucket being public (no SELECT policy needed
-- for /object/public/ URLs; listing the bucket stays blocked).

-- ════════════════════════════════════════════════════════════════════════
-- Seed: current website content (only inserted if missing)
-- ════════════════════════════════════════════════════════════════════════
INSERT INTO public.site_settings (key, value) VALUES
('business', '{
  "name": "Tom''s Barber",
  "tagline": "The Art of the Modern Gentleman",
  "phone": "(808) 949-6081",
  "email": "thetxtbarbersone@gmail.com",
  "street": "1430 Kona St #105",
  "city": "Honolulu, HI 96814",
  "instagramHandle": "@tomsbarber",
  "socials": [
    {"label": "Instagram", "href": "https://instagram.com"},
    {"label": "Facebook", "href": "https://facebook.com"},
    {"label": "TikTok", "href": "https://tiktok.com"}
  ]
}'::jsonb),
('hours', '[
  {"day": "Monday",    "open": "08:00", "close": "18:00", "closed": false},
  {"day": "Tuesday",   "open": "08:00", "close": "18:00", "closed": false},
  {"day": "Wednesday", "open": "08:00", "close": "18:00", "closed": false},
  {"day": "Thursday",  "open": "08:00", "close": "18:00", "closed": false},
  {"day": "Friday",    "open": "08:00", "close": "18:00", "closed": false},
  {"day": "Saturday",  "open": "08:00", "close": "18:00", "closed": false},
  {"day": "Sunday",    "open": "10:00", "close": "15:00", "closed": false}
]'::jsonb),
('closed_dates', '[]'::jsonb),
('banner', '{"enabled": true, "text": "Open now · Walk-ins & Bookings welcome"}'::jsonb),
('booking', '{"slotInterval": 30, "enabled": true}'::jsonb),
('page_images', '{
  "homeIntro":    {"src": "/images/real-interior.jpg",       "alt": "Tom''s Barber barbershop interior — barbers at work on multiple chairs"},
  "homeBefore":   {"src": "/images/new-before-haircut.jpg",  "alt": "Long overgrown hair — before visit to Tom''s Barber"},
  "homeAfter":    {"src": "/images/new-after-haircut.jpg",   "alt": "Clean skin fade haircut — after Tom''s Barber Honolulu"},
  "aboutStory":   {"src": "/images/real-interior.jpg",       "alt": "Tom''s Barber barbershop — barbers working on clients at Kona Street Honolulu"},
  "aboutInside1": {"src": "/images/real-fade-cut.jpg",       "alt": "Curly skin fade — fresh from the chair at Tom''s Barber Honolulu"},
  "aboutInside2": {"src": "/images/real-ladies-service.jpg", "alt": "Expert stylist performing ladies curl styling service"}
}'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.services (id, name, description, price, duration, category, subtitle, sort_order)
SELECT * FROM (VALUES
  ('regular-men-haircut', 'Regular Men Haircut', 'A classic men''s cut with consultation, precision clipper and scissor work, finished and styled.', 28, 30, 'men', '', 0),
  ('regular-men-skin-fade', 'Regular Men Skin Fade', 'Clean skin fade blended to perfection, tapered to your preference with a sharp finish.', 30, 35, 'men', '', 1),
  ('men-haircut-beard-trim', 'Men Haircut & Beard Trim', 'Full haircut paired with a detailed beard line-up, shape and trim for a polished look.', 40, 45, 'men', '', 2),
  ('men-haircut-beard-shave', 'Men Haircut & Beard Shave', 'Precision haircut combined with a hot towel beard shave for the ultimate clean finish.', 50, 50, 'men', '', 3),
  ('men-style-cut', 'Men Style Cut', 'A tailored style cut with consultation, crafted to suit your face shape and personal style.', 35, 40, 'men', '', 4),
  ('premium-service', 'Premium Service', 'The complete grooming experience — haircut, beard trim or shave, and a relaxing shampoo.', 60, 60, 'men', 'Haircut, Beard Trim / Shave, Shampoo', 5),
  ('men-haircut-shampoo', 'Men Haircut & Shampoo', 'A fresh haircut with an invigorating shampoo wash for a clean, refreshed finish.', 35, 40, 'men', '', 6),
  ('lady-short-layer', 'Lady Short Layer', 'Layered cut for short hair, shaped and styled to add volume and movement.', 40, 45, 'ladies', '', 7),
  ('lady-long-layer', 'Lady Long Layer', 'Flowing layers for longer hair, precision-cut to enhance texture and natural fall.', 50, 50, 'ladies', '', 8),
  ('lady-shampoo-blowdry', 'Lady Shampoo & Blowdry', 'A refreshing shampoo followed by a professional blowdry for smooth, voluminous results.', 30, 35, 'ladies', '', 9),
  ('lady-shampoo-blowdry-style', 'Lady Shampoo, Blowdry & Style', 'Full wash, blowdry and styling — finished and polished, ready for any occasion.', 50, 50, 'ladies', '', 10)
) AS v(id, name, description, price, duration, category, subtitle, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.services);

INSERT INTO public.gallery_images (src, alt, span, sort_order)
SELECT * FROM (VALUES
  ('/images/real-fade-cut.jpg', 'Curly skin fade — fresh from the chair at Tom''s Barber', 'tall', 0),
  ('/images/real-interior.jpg', 'Tom''s Barber lounge — barbers at work on multiple chairs', 'wide', 1),
  ('/images/real-back-cut.jpg', 'Precision taper cut — back view at Tom''s Barber', 'tall', 2),
  ('/images/real-ladies-service.jpg', 'Ladies styling service — expert curling iron finish', 'wide', 3),
  ('/images/real-interior-2.jpg', 'It''s a good hair day — inside Tom''s Barber lounge', 'tall', 4),
  ('/images/real-fade-cut-2.jpg', 'Clean skin fade — precision neckline at Tom''s Barber', 'tall', 5),
  ('/images/real-haircut-action.jpg', 'Master barber haircut — precision styling at Tom''s Barber', 'tall', 6),
  ('/images/real-shop-exterior.jpg', 'Tom''s Barber shop building & entrance on Kona Street, Honolulu', 'wide', 7)
) AS v(src, alt, span, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.gallery_images);

INSERT INTO public.testimonials (name, rating, quote, sort_order)
SELECT * FROM (VALUES
  ('Marcus H.', 5, 'The most consistent fade I''ve had in Honolulu. They remember exactly how I like it, every single visit.', 0),
  ('Jared K.', 5, 'The hot towel shave is worth the trip alone. Forty-five unhurried minutes that feel like a reset.', 1),
  ('Tony P.', 5, 'Booked the Executive Ritual before my wedding. Photographer said it was the sharpest he''d seen.', 2),
  ('Sam L.', 5, 'Brought my son for his first real haircut. They were patient, kind, and he left grinning.', 3),
  ('Dee R.', 5, 'Beautiful room, no attitude, exceptional work. It feels like a lounge, not a waiting room.', 4)
) AS v(name, rating, quote, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.testimonials);

INSERT INTO public.faqs (question, answer, sort_order)
SELECT * FROM (VALUES
  ('Where should I park?', 'Convenient parking is available near our Kona Street location with street and nearby dedicated customer parking.', 0),
  ('Do you take walk-ins?', 'We welcome walk-ins whenever a chair is open, but appointments always take priority. Weekends fill early — booking ahead is strongly recommended.', 1),
  ('What is your cancellation policy?', 'Please give us at least 12 hours'' notice. Cancellations inside 12 hours, or no-shows, may be charged 50% of the service price.', 2),
  ('How early should I arrive?', 'Five minutes early is perfect. That gives us time for a proper consultation and a coffee before we begin.', 3),
  ('Do you sell the products you use?', 'Yes. Every pomade, oil and balm we use in the chair is available at the front counter, along with staff recommendations for your hair type.', 4)
) AS v(question, answer, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM public.faqs);
