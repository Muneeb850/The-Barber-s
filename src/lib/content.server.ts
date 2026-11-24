/**
 * Server-only: loads the editable site content from Supabase using the public
 * (publishable) key — RLS allows anonymous SELECT on content tables only.
 * Any section that fails to load falls back to the built-in defaults.
 */
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_CONTENT, type SiteContent } from "@/lib/site-content";
import {
  bannerSchema,
  bookingSettingsSchema,
  businessSchema,
  closedDatesSchema,
  hoursSchema,
  pageImagesSchema,
} from "@/lib/content-schemas";

// ─── Client ──────────────────────────────────────────────────────────────
function publicClient() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

function parseOr<T>(schema: z.ZodType<T>, value: unknown, fallback: T): T {
  const r = schema.safeParse(value);
  return r.success ? r.data : fallback;
}

export async function loadSiteContent(): Promise<SiteContent> {
  const sb = publicClient();
  if (!sb) return DEFAULT_CONTENT;

  try {
    const [settings, services, gallery, testimonials, faqs] = await Promise.all([
      sb.from("site_settings").select("key, value"),
      sb.from("services").select("*").order("sort_order").order("name"),
      sb.from("gallery_images").select("*").order("sort_order").order("updated_at"),
      sb.from("testimonials").select("*").order("sort_order").order("updated_at"),
      sb.from("faqs").select("*").order("sort_order").order("updated_at"),
    ]);

    // If the settings table is missing entirely, the DB isn't set up → full fallback.
    if (settings.error) {
      console.warn("[content] site_settings unavailable, using defaults:", settings.error.message);
      return DEFAULT_CONTENT;
    }

    const s = new Map((settings.data ?? []).map((r) => [r.key, r.value as unknown]));
    const d = DEFAULT_CONTENT;

    return {
      business: parseOr(businessSchema, s.get("business"), d.business),
      hours: parseOr(hoursSchema, s.get("hours"), d.hours),
      closedDates: parseOr(closedDatesSchema, s.get("closed_dates"), d.closedDates),
      banner: parseOr(bannerSchema, s.get("banner"), d.banner),
      booking: parseOr(bookingSettingsSchema, s.get("booking"), d.booking),
      pageImages: {
        ...d.pageImages,
        ...parseOr(pageImagesSchema.partial(), s.get("page_images"), {}),
      },
      services: services.error
        ? d.services
        : (services.data ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            description: r.description,
            price: r.price,
            duration: r.duration,
            category: r.category === "ladies" ? "ladies" : "men",
            subtitle: r.subtitle,
            tag: r.tag,
            sortOrder: r.sort_order,
            isActive: r.is_active,
          })),
      gallery: gallery.error
        ? d.gallery
        : (gallery.data ?? []).map((r) => ({
            id: r.id,
            src: r.src,
            alt: r.alt,
            span: r.span === "wide" ? "wide" : "tall",
            sortOrder: r.sort_order,
            storagePath: r.storage_path,
          })),
      testimonials: testimonials.error
        ? d.testimonials
        : (testimonials.data ?? []).map((r) => ({
            id: r.id,
            name: r.name,
            rating: r.rating,
            quote: r.quote,
            sortOrder: r.sort_order,
          })),
      faqs: faqs.error
        ? d.faqs
        : (faqs.data ?? []).map((r) => ({
            id: r.id,
            question: r.question,
            answer: r.answer,
            sortOrder: r.sort_order,
          })),
      source: "database",
    };
  } catch (err) {
    console.warn("[content] failed to load, using defaults:", err);
    return DEFAULT_CONTENT;
  }
}
