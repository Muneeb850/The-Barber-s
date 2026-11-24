/**
 * Admin-only server functions.
 *
 * Security (defence in depth):
 *  1. requireSupabaseAuth — request must carry a valid Supabase JWT.
 *  2. requireAdmin        — that user must be in public.admin_users.
 *  3. All queries run with the *user's* token, so Postgres RLS (public.is_admin())
 *     is enforced again at the database level. No service-role key is used here.
 */
import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  bannerSchema,
  bookingSettingsSchema,
  businessSchema,
  closedDatesSchema,
  hoursSchema,
  imageSrc,
  pageImagesSchema,
} from "@/lib/content-schemas";

const requireAdmin = createMiddleware({ type: "function" })
  .middleware([requireSupabaseAuth])
  .server(async ({ next, context }) => {
    const { data, error } = await context.supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error || !data) throw new Error("Forbidden: this account is not an admin.");
    return next();
  });

const STORAGE_BUCKET = "site-images";
const PUBLIC_MARKER = `/storage/v1/object/public/${STORAGE_BUCKET}/`;

/** Extract "folder/file.webp" from a public Supabase Storage URL (or null). */
function storagePathFromUrl(src: string | null | undefined): string | null {
  if (!src) return null;
  const i = src.indexOf(PUBLIC_MARKER);
  return i === -1 ? null : decodeURIComponent(src.slice(i + PUBLIC_MARKER.length));
}

function fail(action: string, error: { message: string } | null): never {
  console.error(`[admin] ${action} failed:`, error?.message);
  throw new Error(`Could not ${action}. ${error?.message ?? ""}`.trim());
}

const uuid = z.string().uuid();

// ─── Who am I ────────────────────────────────────────────────────────────
export const getAdminMe = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    return {
      isAdmin: !!data,
      email: (context.claims.email as string | undefined) ?? null,
    };
  });

// ─── Bookings ────────────────────────────────────────────────────────────
const BOOKING_STATUSES = ["confirmed", "completed", "cancelled", "no_show"] as const;

export const listBookings = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) =>
    z
      .object({
        from: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        to: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional(),
        status: z.enum(BOOKING_STATUSES).optional(),
        search: z.string().trim().max(100).optional(),
        limit: z.number().int().min(1).max(1000).default(500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("bookings")
      .select("*")
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true })
      .limit(data.limit);
    if (data.from) q = q.gte("booking_date", data.from);
    if (data.to) q = q.lte("booking_date", data.to);
    if (data.status) q = q.eq("status", data.status);
    if (data.search) {
      // Strip characters that have meaning in PostgREST filter syntax.
      const s = data.search.replace(/[%,()*\\]/g, " ").trim();
      if (s) {
        q = q.or(
          `customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%,customer_email.ilike.%${s}%,reference.ilike.%${s}%`,
        );
      }
    }
    const { data: rows, error } = await q;
    if (error) fail("load bookings", error);
    return rows ?? [];
  });

export const updateBookingStatus = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) => z.object({ id: uuid, status: z.enum(BOOKING_STATUSES) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("bookings")
      .update({ status: data.status })
      .eq("id", data.id)
      .select("id");
    if (error || !rows?.length) fail("update booking", error);
    return { ok: true };
  });

export const deleteBooking = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("bookings")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error || !rows?.length) fail("delete booking", error);
    return { ok: true };
  });

// ─── Settings (business, hours, closed dates, banner, booking, page images) ─
const settingInput = z.discriminatedUnion("key", [
  z.object({ key: z.literal("business"), value: businessSchema }),
  z.object({ key: z.literal("hours"), value: hoursSchema }),
  z.object({ key: z.literal("closed_dates"), value: closedDatesSchema }),
  z.object({ key: z.literal("banner"), value: bannerSchema }),
  z.object({ key: z.literal("booking"), value: bookingSettingsSchema }),
  z.object({ key: z.literal("page_images"), value: pageImagesSchema }),
]);

export const saveSetting = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) => settingInput.parse(d))
  .handler(async ({ data, context }) => {
    let oldPaths: string[] = [];
    if (data.key === "page_images") {
      const { data: prev } = await context.supabase
        .from("site_settings")
        .select("value")
        .eq("key", "page_images")
        .maybeSingle();
      const prevImgs = (prev?.value ?? {}) as Record<string, { src?: string }>;
      const keep = new Set(Object.values(data.value).map((v) => v.src));
      oldPaths = Object.values(prevImgs)
        .filter((v) => v?.src && !keep.has(v.src))
        .map((v) => storagePathFromUrl(v.src))
        .filter((p): p is string => !!p);
    }

    const { error } = await context.supabase
      .from("site_settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) fail("save settings", error);

    if (oldPaths.length) {
      // Best effort: remove replaced uploads (also make sure the gallery isn't using them).
      const { data: used } = await context.supabase
        .from("gallery_images")
        .select("storage_path")
        .in("storage_path", oldPaths);
      const usedSet = new Set((used ?? []).map((r) => r.storage_path));
      const toRemove = oldPaths.filter((p) => !usedSet.has(p));
      if (toRemove.length) await context.supabase.storage.from(STORAGE_BUCKET).remove(toRemove);
    }
    return { ok: true };
  });

// ─── Services ────────────────────────────────────────────────────────────
const serviceInput = z.object({
  id: z.string().trim().max(80).optional(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(600),
  price: z.number().int().min(0).max(10000),
  duration: z.number().int().min(5).max(600),
  category: z.enum(["men", "ladies"]),
  subtitle: z.string().trim().max(120),
  tag: z.string().trim().max(40),
  isActive: z.boolean(),
});

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "service"
  );
}

export const upsertService = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) => serviceInput.parse(d))
  .handler(async ({ data, context }) => {
    const row = {
      name: data.name,
      description: data.description,
      price: data.price,
      duration: data.duration,
      category: data.category,
      subtitle: data.subtitle,
      tag: data.tag,
      is_active: data.isActive,
    };
    if (data.id) {
      const { data: rows, error } = await context.supabase
        .from("services")
        .update(row)
        .eq("id", data.id)
        .select("id");
      if (error || !rows?.length) fail("update service", error);
      return { id: data.id };
    }
    const { data: last } = await context.supabase
      .from("services")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const id = `${slugify(data.name)}-${Math.random().toString(36).slice(2, 6)}`;
    const { error } = await context.supabase
      .from("services")
      .insert({ ...row, id, sort_order: (last?.sort_order ?? -1) + 1 });
    if (error) fail("add service", error);
    return { id };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) => z.object({ id: z.string().min(1).max(80) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("services")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error || !rows?.length) fail("delete service", error);
    return { ok: true };
  });

// ─── Reorder (services / gallery / testimonials / faqs) ─────────────────
export const reorderItems = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) =>
    z
      .object({
        table: z.enum(["services", "gallery_images", "testimonials", "faqs"]),
        ids: z.array(z.string().min(1).max(80)).min(1).max(500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const results = await Promise.all(
      data.ids.map((id, index) =>
        context.supabase.from(data.table).update({ sort_order: index }).eq("id", id),
      ),
    );
    const err = results.find((r) => r.error)?.error;
    if (err) fail("reorder", err);
    return { ok: true };
  });

// ─── Gallery ─────────────────────────────────────────────────────────────
const galleryInput = z.object({
  id: uuid.optional(),
  src: imageSrc,
  alt: z.string().trim().max(200),
  span: z.enum(["tall", "wide"]),
});

export const upsertGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) => galleryInput.parse(d))
  .handler(async ({ data, context }) => {
    const storage_path = storagePathFromUrl(data.src);
    if (data.id) {
      const { data: prev } = await context.supabase
        .from("gallery_images")
        .select("storage_path")
        .eq("id", data.id)
        .maybeSingle();
      const { data: rows, error } = await context.supabase
        .from("gallery_images")
        .update({ src: data.src, alt: data.alt, span: data.span, storage_path })
        .eq("id", data.id)
        .select("id");
      if (error || !rows?.length) fail("update image", error);
      if (prev?.storage_path && prev.storage_path !== storage_path) {
        await context.supabase.storage.from(STORAGE_BUCKET).remove([prev.storage_path]);
      }
      return { id: data.id };
    }
    const { data: first } = await context.supabase
      .from("gallery_images")
      .select("sort_order")
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    // New photos go to the top of the gallery.
    const { data: row, error } = await context.supabase
      .from("gallery_images")
      .insert({
        src: data.src,
        alt: data.alt,
        span: data.span,
        storage_path,
        sort_order: (first?.sort_order ?? 1) - 1,
      })
      .select("id")
      .single();
    if (error || !row) fail("add image", error);
    return { id: row.id };
  });

export const deleteGalleryImage = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("gallery_images")
      .delete()
      .eq("id", data.id)
      .select("storage_path");
    if (error || !rows?.length) fail("delete image", error);
    const path = rows[0].storage_path;
    if (path) await context.supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: true };
  });

/** Remove an uploaded file that was never saved (e.g. user cancelled the dialog). */
export const discardUpload = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) => z.object({ src: imageSrc }).parse(d))
  .handler(async ({ data, context }) => {
    const path = storagePathFromUrl(data.src);
    if (path) await context.supabase.storage.from(STORAGE_BUCKET).remove([path]);
    return { ok: true };
  });

// ─── Testimonials ────────────────────────────────────────────────────────
export const upsertTestimonial = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) =>
    z
      .object({
        id: uuid.optional(),
        name: z.string().trim().min(1).max(80),
        rating: z.number().int().min(1).max(5),
        quote: z.string().trim().min(1).max(600),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const row = { name: data.name, rating: data.rating, quote: data.quote };
    if (data.id) {
      const { data: rows, error } = await context.supabase
        .from("testimonials")
        .update(row)
        .eq("id", data.id)
        .select("id");
      if (error || !rows?.length) fail("update review", error);
      return { id: data.id };
    }
    const { data: last } = await context.supabase
      .from("testimonials")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: created, error } = await context.supabase
      .from("testimonials")
      .insert({ ...row, sort_order: (last?.sort_order ?? -1) + 1 })
      .select("id")
      .single();
    if (error || !created) fail("add review", error);
    return { id: created.id };
  });

export const deleteTestimonial = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("testimonials")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error || !rows?.length) fail("delete review", error);
    return { ok: true };
  });

// ─── FAQs ────────────────────────────────────────────────────────────────
export const upsertFaq = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) =>
    z
      .object({
        id: uuid.optional(),
        question: z.string().trim().min(1).max(200),
        answer: z.string().trim().min(1).max(1500),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const row = { question: data.question, answer: data.answer };
    if (data.id) {
      const { data: rows, error } = await context.supabase
        .from("faqs")
        .update(row)
        .eq("id", data.id)
        .select("id");
      if (error || !rows?.length) fail("update FAQ", error);
      return { id: data.id };
    }
    const { data: last } = await context.supabase
      .from("faqs")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();
    const { data: created, error } = await context.supabase
      .from("faqs")
      .insert({ ...row, sort_order: (last?.sort_order ?? -1) + 1 })
      .select("id")
      .single();
    if (error || !created) fail("add FAQ", error);
    return { id: created.id };
  });

export const deleteFaq = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((d: unknown) => z.object({ id: uuid }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("faqs")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error || !rows?.length) fail("delete FAQ", error);
    return { ok: true };
  });
