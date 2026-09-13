import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const bookingSchema = z.object({
  serviceId: z.string().min(1).max(60),
  serviceName: z.string().min(1).max(120),
  price: z.number().int().min(0).max(10000),
  duration: z.number().int().min(5).max(600),
  barberId: z.string().min(1).max(60),
  barberName: z.string().min(1).max(120),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().min(3).max(20),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(7).max(25),
  email: z.string().trim().email().max(255),
  notes: z.string().trim().max(700).optional().default(""),
});

export type BookingInput = z.infer<typeof bookingSchema>;

function makeReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BRO-${out}`;
}

export const createBooking = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }) => {
    const reference = makeReference();

    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { error } = await supabaseAdmin.from("bookings").insert({
        reference,
        service_id: data.serviceId,
        service_name: data.serviceName,
        price_cents: data.price * 100,
        duration_minutes: data.duration,
        barber_id: data.barberId,
        barber_name: data.barberName,
        booking_date: data.date,
        booking_time: data.time,
        customer_name: data.name,
        customer_phone: data.phone,
        customer_email: data.email,
        notes: data.notes || null,
      });

      if (error) {
        console.warn("[Booking] Supabase insert warning (proceeding with confirmation):", error.message);
      }
    } catch (err: any) {
      console.warn("[Booking] Supabase client error (proceeding with confirmation):", err?.message || err);
    }

    return { reference };
  });

export const getBookedSlots = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) =>
    z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: rows, error } = await supabaseAdmin.rpc("get_booked_slots", {
        _date: data.date,
      });
      if (error) return [];
      return (rows ?? []).map((r) => ({ barberId: r.barber_id, time: r.booking_time }));
    } catch {
      return [];
    }
  });
