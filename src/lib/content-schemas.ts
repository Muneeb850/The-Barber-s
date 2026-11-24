/** Zod schemas for editable site content (shared by loader + admin server functions). */
import { z } from "zod";
import { DAYS, PAGE_IMAGE_SLOTS, type PageImages } from "@/lib/site-content";

// ─── Schemas (shared with admin validation) ──────────────────────────────
const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use HH:MM (24h)");

export const businessSchema = z.object({
  name: z.string().trim().min(1).max(80),
  tagline: z.string().trim().max(160),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(255),
  street: z.string().trim().min(1).max(160),
  city: z.string().trim().min(1).max(160),
  instagramHandle: z.string().trim().max(60),
  socials: z
    .array(
      z.object({
        label: z.string().trim().min(1).max(30),
        href: z
          .string()
          .trim()
          .url()
          .max(300)
          .refine((u) => /^https?:\/\//i.test(u), "Must start with http(s)://"),
      }),
    )
    .max(8),
});

export const hoursSchema = z
  .array(
    z
      .object({ day: z.enum(DAYS), open: hhmm, close: hhmm, closed: z.boolean() })
      .refine((h) => h.closed || h.open < h.close, "Closing time must be after opening time"),
  )
  .length(7);

export const closedDatesSchema = z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(366);

export const bannerSchema = z.object({
  enabled: z.boolean(),
  text: z.string().trim().max(160),
});

export const bookingSettingsSchema = z.object({
  slotInterval: z.number().int().min(10).max(120),
  enabled: z.boolean(),
});

const imageSrc = z
  .string()
  .trim()
  .max(1000)
  .refine((s) => s.startsWith("/") || /^https:\/\//i.test(s), "Invalid image URL");

export const siteImageSchema = z.object({ src: imageSrc, alt: z.string().trim().max(200) });

export const pageImagesSchema = z.object(
  Object.fromEntries(Object.keys(PAGE_IMAGE_SLOTS).map((k) => [k, siteImageSchema])) as Record<
    keyof PageImages,
    typeof siteImageSchema
  >,
);

export { imageSrc };
