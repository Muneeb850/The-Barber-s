/**
 * Site content model — everything Tom can edit from /admin.
 *
 * The live values come from Supabase (see content.functions.ts). The DEFAULT_CONTENT
 * below is only a fallback used when the database is unreachable or not set up yet,
 * so the public site never breaks.
 */
import { BUSINESS, FAQS, GALLERY, LOCATIONS, SERVICES, TESTIMONIALS } from "@/lib/site-data";

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
export type DayName = (typeof DAYS)[number];

export const SHOP_TIMEZONE = "Pacific/Honolulu";

export type SocialLink = { label: string; href: string };

export type BusinessInfo = {
  name: string;
  tagline: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  instagramHandle: string;
  socials: SocialLink[];
};

/** open/close are 24h "HH:MM" strings in shop time (HST). */
export type DayHours = { day: DayName; open: string; close: string; closed: boolean };

export type BannerSettings = { enabled: boolean; text: string };

export type BookingSettings = {
  /** Minutes between bookable start times. */
  slotInterval: number;
  /** Whether online booking is accepted at all. */
  enabled: boolean;
};

export type SiteImage = { src: string; alt: string };

export const PAGE_IMAGE_SLOTS = {
  homeIntro: { label: "Home — welcome section", page: "Home" },
  homeBefore: { label: "Home — transformation (BEFORE)", page: "Home" },
  homeAfter: { label: "Home — transformation (AFTER)", page: "Home" },
  aboutStory: { label: "About — story section", page: "About" },
  aboutInside1: { label: "About — inside the lounge (left)", page: "About" },
  aboutInside2: { label: "About — inside the lounge (right)", page: "About" },
} as const;
export type PageImageKey = keyof typeof PAGE_IMAGE_SLOTS;
export type PageImages = Record<PageImageKey, SiteImage>;

export type ServiceItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: "men" | "ladies";
  subtitle: string;
  tag: string;
  sortOrder: number;
  isActive: boolean;
};

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  span: "tall" | "wide";
  sortOrder: number;
  storagePath: string | null;
};

export type TestimonialItem = {
  id: string;
  name: string;
  rating: number;
  quote: string;
  sortOrder: number;
};

export type FaqItem = { id: string; question: string; answer: string; sortOrder: number };

export type SiteContent = {
  business: BusinessInfo;
  hours: DayHours[];
  closedDates: string[];
  banner: BannerSettings;
  booking: BookingSettings;
  pageImages: PageImages;
  services: ServiceItem[];
  gallery: GalleryItem[];
  testimonials: TestimonialItem[];
  faqs: FaqItem[];
  /** "database" when loaded from Supabase, "fallback" when using built-in defaults. */
  source: "database" | "fallback";
};

// ───────────────────────── Defaults (fallback) ─────────────────────────

export const DEFAULT_BUSINESS: BusinessInfo = {
  name: BUSINESS.name,
  tagline: BUSINESS.tagline,
  phone: BUSINESS.phone,
  email: BUSINESS.email,
  street: LOCATIONS[0].street,
  city: LOCATIONS[0].city,
  instagramHandle: "@tomsbarber",
  socials: BUSINESS.socials.map((s) => ({ ...s })),
};

export const DEFAULT_HOURS: DayHours[] = DAYS.map((day) =>
  day === "Sunday"
    ? { day, open: "10:00", close: "15:00", closed: false }
    : { day, open: "08:00", close: "18:00", closed: false },
);

export const DEFAULT_BANNER: BannerSettings = {
  enabled: true,
  text: "Open now · Walk-ins & Bookings welcome",
};

export const DEFAULT_BOOKING: BookingSettings = { slotInterval: 30, enabled: true };

export const DEFAULT_PAGE_IMAGES: PageImages = {
  homeIntro: {
    src: "/images/real-interior.jpg",
    alt: "Tom's Barber barbershop interior — barbers at work on multiple chairs",
  },
  homeBefore: {
    src: "/images/new-before-haircut.jpg",
    alt: "Long overgrown hair — before visit to Tom's Barber",
  },
  homeAfter: {
    src: "/images/new-after-haircut.jpg",
    alt: "Clean skin fade haircut — after Tom's Barber Honolulu",
  },
  aboutStory: {
    src: "/images/real-interior.jpg",
    alt: "Tom's Barber barbershop — barbers working on clients at Kona Street Honolulu",
  },
  aboutInside1: {
    src: "/images/real-fade-cut.jpg",
    alt: "Curly skin fade — fresh from the chair at Tom's Barber Honolulu",
  },
  aboutInside2: {
    src: "/images/real-ladies-service.jpg",
    alt: "Expert stylist performing ladies curl styling service",
  },
};

export const DEFAULT_CONTENT: SiteContent = {
  business: DEFAULT_BUSINESS,
  hours: DEFAULT_HOURS,
  closedDates: [],
  banner: DEFAULT_BANNER,
  booking: DEFAULT_BOOKING,
  pageImages: DEFAULT_PAGE_IMAGES,
  services: SERVICES.map((s, i) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: s.price,
    duration: s.duration,
    category: s.category,
    subtitle: s.subtitle ?? "",
    tag: s.tag ?? "",
    sortOrder: i,
    isActive: true,
  })),
  gallery: GALLERY.map((g, i) => ({
    id: `default-${i}`,
    src: g.src,
    alt: g.alt,
    span: g.span,
    sortOrder: i,
    storagePath: null,
  })),
  testimonials: TESTIMONIALS.map((t, i) => ({
    id: `default-${i}`,
    name: t.name,
    rating: t.rating,
    quote: t.quote,
    sortOrder: i,
  })),
  faqs: FAQS.map((f, i) => ({ id: `default-${i}`, question: f.q, answer: f.a, sortOrder: i })),
  source: "fallback",
};

// ───────────────────────── Helpers ─────────────────────────

export function fullAddress(b: BusinessInfo) {
  return `${b.street}, ${b.city}`;
}

export function phoneHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return "#";
  if (digits.startsWith("+")) return `tel:${digits}`;
  return digits.length === 10 ? `tel:+1${digits}` : `tel:${digits}`;
}

export function mapLink(b: BusinessInfo) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress(b))}`;
}

export function mapEmbed(b: BusinessInfo) {
  return `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress(b))}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
}

export function initialsOf(name: string) {
  const parts = name
    .replace(/[^A-Za-z\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "") || "★";
}

/** "08:00" → minutes after midnight */
export function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** minutes → "8:00 AM" (the format stored in bookings.booking_time) */
export function minutesToLabel(total: number): string {
  const h24 = Math.floor(total / 60) % 24;
  const m = total % 60;
  const suffix = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** "8:00 AM" → minutes after midnight */
export function labelToMinutes(label: string): number {
  const m = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return -1;
  let h = Number(m[1]) % 12;
  if (m[3].toUpperCase() === "PM") h += 12;
  return h * 60 + Number(m[2]);
}

export function formatDayHours(h: DayHours): string {
  if (h.closed) return "Closed";
  return `${minutesToLabel(hhmmToMinutes(h.open))} – ${minutesToLabel(hhmmToMinutes(h.close))} HST`;
}

/** Day name ("Monday") for a "YYYY-MM-DD" date string. */
export function dayNameOf(isoDate: string): DayName {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const js = new Date(Date.UTC(y, mo - 1, d)).getUTCDay(); // 0 = Sunday
  return DAYS[(js + 6) % 7];
}

export function hoursForDate(hours: DayHours[], isoDate: string): DayHours | undefined {
  const name = dayNameOf(isoDate);
  return hours.find((h) => h.day === name);
}

export function isDateClosed(content: Pick<SiteContent, "hours" | "closedDates">, iso: string) {
  if (content.closedDates.includes(iso)) return true;
  const h = hoursForDate(content.hours, iso);
  return !h || h.closed;
}

/** Current date ("YYYY-MM-DD") and minutes-after-midnight in shop time. */
export function shopNow(now = new Date()) {
  const date = now.toLocaleDateString("en-CA", { timeZone: SHOP_TIMEZONE });
  const time = now.toLocaleTimeString("en-GB", {
    timeZone: SHOP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return { date, minutes: hhmmToMinutes(time) };
}

/**
 * Bookable start times for a date: every `slotInterval` minutes from opening,
 * where the whole service still fits before closing. Past times today are removed.
 */
export function slotsForDate(
  content: Pick<SiteContent, "hours" | "closedDates" | "booking">,
  isoDate: string,
  serviceDuration: number,
  now = new Date(),
): string[] {
  if (isDateClosed(content, isoDate)) return [];
  const h = hoursForDate(content.hours, isoDate)!;
  const open = hhmmToMinutes(h.open);
  const close = hhmmToMinutes(h.close);
  const step = Math.max(10, content.booking.slotInterval || 30);
  const today = shopNow(now);
  const out: string[] = [];
  for (let t = open; t + serviceDuration <= close; t += step) {
    if (isoDate === today.date && t <= today.minutes) continue;
    out.push(minutesToLabel(t));
  }
  return out;
}

/** Add days to a "YYYY-MM-DD" date string. */
export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

/** "2026-11-24" → "Tue, Nov 24" */
export function prettyDate(iso: string, opts: Intl.DateTimeFormatOptions = {}): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    ...opts,
  });
}
