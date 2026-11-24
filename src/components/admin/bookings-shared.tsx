import type { Tables } from "@/integrations/supabase/types";
import { labelToMinutes } from "@/lib/site-content";
import { cn } from "@/lib/utils";

export type BookingRow = Tables<"bookings">;
export type BookingStatus = "confirmed" | "completed" | "cancelled" | "no_show";

export const STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const STATUS_STYLE: Record<BookingStatus, string> = {
  confirmed: "border-sky-500/40 bg-sky-500/10 text-sky-300",
  completed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
  no_show: "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

export function StatusBadge({ status }: { status: string }) {
  const s = (status in STATUS_LABEL ? status : "confirmed") as BookingStatus;
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium",
        STATUS_STYLE[s],
      )}
    >
      {STATUS_LABEL[s]}
    </span>
  );
}

/** Sort by date, then by real clock time (booking_time is "8:00 AM" text). */
export function sortBookings(rows: BookingRow[]) {
  return [...rows].sort(
    (a, b) =>
      a.booking_date.localeCompare(b.booking_date) ||
      labelToMinutes(a.booking_time) - labelToMinutes(b.booking_time),
  );
}

export function money(cents: number) {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

/** Notes are saved with a "[Location: Honolulu]" prefix by the booking wizard. */
export function cleanNotes(notes: string | null) {
  return (notes ?? "").replace(/^\[Location:[^\]]*\]\s*/i, "").trim();
}
