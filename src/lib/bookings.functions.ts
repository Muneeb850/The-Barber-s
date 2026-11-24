import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ANY_BARBER, BARBERS } from "@/lib/site-data";
import { isDateClosed, shopNow, slotsForDate } from "@/lib/site-content";

const bookingSchema = z
  .object({
    serviceId: z.string().min(1).max(60),
    serviceName: z.string().min(1).max(120),
    price: z.number().int().min(0).max(10000).optional(),
    servicePrice: z.number().int().min(0).max(10000).optional(),
    duration: z.number().int().min(5).max(600).optional(),
    serviceDuration: z.number().int().min(5).max(600).optional(),
    barberId: z.string().min(1).max(60),
    barberName: z.string().min(1).max(120),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: z.string().min(3).max(20),
    name: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(7).max(25),
    email: z.string().trim().email().max(255),
    notes: z.string().trim().max(700).optional().default(""),
  })
  .transform((data) => ({
    ...data,
    price: data.price ?? data.servicePrice ?? 35,
    duration: data.duration ?? data.serviceDuration ?? 30,
  }));

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
  .validator((data: unknown) => bookingSchema.parse(data))
  .handler(async ({ data }) => {
    // Live content (services, hours, closed dates) as set in the admin dashboard.
    const { loadSiteContent } = await import("@/lib/content.server");
    const content = await loadSiteContent();

    if (!content.booking.enabled) {
      throw new Error(`Online booking is paused. Please call us at ${content.business.phone}.`);
    }

    // Never trust price/duration/name from the browser — resolve the service on the server.
    const service = content.services.find((s) => s.id === data.serviceId && s.isActive);
    if (!service) throw new Error("Selected service is no longer available.");

    const barber =
      data.barberId === ANY_BARBER.id ? ANY_BARBER : BARBERS.find((b) => b.id === data.barberId);
    if (!barber) throw new Error("Selected barber is no longer available.");

    // Reject past dates, closed days, and times outside opening hours (shop runs on HST).
    if (data.date < shopNow().date) {
      throw new Error("Please choose a date that is not in the past.");
    }
    if (isDateClosed(content, data.date)) {
      throw new Error("We're closed on that day. Please pick another date.");
    }
    if (!slotsForDate(content, data.date, service.duration).includes(data.time)) {
      throw new Error("That time isn't available. Please pick another time.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Server-side double-booking guard (mirrors the slot filter in the wizard).
    const { data: taken, error: slotError } = await supabaseAdmin.rpc("get_booked_slots", {
      _date: data.date,
    });
    if (slotError) {
      console.error("[Booking] Could not check slot availability:", slotError.message);
      throw new Error("We couldn't save your booking. Please try again or call the shop.");
    }
    const clash = (taken ?? []).some(
      (r) =>
        r.booking_time === data.time &&
        (barber.id === ANY_BARBER.id || r.barber_id === barber.id || r.barber_id === ANY_BARBER.id),
    );
    if (clash) throw new Error("That time slot was just booked. Please pick another time.");

    let reference = "";
    for (let attempt = 0; attempt < 3; attempt += 1) {
      reference = makeReference();
      const { error } = await supabaseAdmin.from("bookings").insert({
        reference,
        service_id: service.id,
        service_name: service.name,
        price_cents: service.price * 100,
        duration_minutes: service.duration,
        barber_id: barber.id,
        barber_name: barber.name,
        booking_date: data.date,
        booking_time: data.time,
        customer_name: data.name,
        customer_phone: data.phone,
        customer_email: data.email,
        notes: data.notes || null,
      });
      if (!error) break;
      // 23505 = unique violation on reference → retry with a new one.
      if (error.code === "23505" && attempt < 2) continue;
      console.error("[Booking] Supabase insert failed:", error.message);
      throw new Error("We couldn't save your booking. Please try again or call the shop.");
    }

    // Trigger instant Resend email notifications (Customer Confirmation + Shop Owner Notification)
    try {
      const { sendBookingEmails } = await import("@/lib/email.server");
      await sendBookingEmails({
        reference,
        serviceName: service.name,
        servicePrice: service.price,
        serviceDuration: service.duration,
        barberName: barber.name,
        date: data.date,
        time: data.time,
        customerName: data.name,
        customerPhone: data.phone,
        customerEmail: data.email,
        notes: data.notes || "",
      });
    } catch (emailErr: unknown) {
      const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
      console.warn("[Booking] Email notification error (proceeding with booking):", msg);
    }

    return { reference };
  });

export const getBookedSlots = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
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
