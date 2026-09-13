CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE,
  service_id text NOT NULL,
  service_name text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0,
  duration_minutes integer NOT NULL DEFAULT 30,
  barber_id text NOT NULL,
  barber_name text NOT NULL,
  booking_date date NOT NULL,
  booking_time text NOT NULL,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_email text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.bookings TO anon, authenticated;
GRANT ALL ON public.bookings TO service_role;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a booking"
  ON public.bookings FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX bookings_date_idx ON public.bookings (booking_date);

CREATE OR REPLACE FUNCTION public.get_booked_slots(_date date)
RETURNS TABLE (barber_id text, booking_time text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.barber_id, b.booking_time
  FROM public.bookings b
  WHERE b.booking_date = _date AND b.status <> 'cancelled';
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(date) TO anon, authenticated;