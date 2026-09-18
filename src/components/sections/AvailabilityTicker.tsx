/**
 * AvailabilityTicker
 *
 * A dismissible top announcement bar that shows live-computed
 * "next available slot" information based on current time and
 * the hours data from site-data.ts. No backend required.
 */
import { AnimatePresence, motion } from "framer-motion";
import { X, Scissors } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { LOCATIONS, TIME_SLOTS } from "@/lib/site-data";
import { useBooking } from "@/components/booking/BookingContext";

const LUXURY_EASE = [0.22, 0.61, 0.36, 1] as const;
const SESSION_KEY = "thebarbers_ticker_dismissed";

/** Parse "9:00 AM" or "6:00 PM HST" → minutes from midnight */
function parseTime(str: string): number {
  const clean = str.replace(/[A-Z]{3,}$/i, "").trim();
  const m = clean.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return 0;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ampm = m[3].toUpperCase();
  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + min;
}

type LocationStatus = {
  shortName: string;
  isOpen: boolean;
  nextSlot: string | null;
  closingTime: string | null;
};

function getHawaiiTime() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Pacific/Honolulu",
    weekday: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(now);
  let dayName = "";
  let hour = 0;
  let minute = 0;

  for (const part of parts) {
    if (part.type === "weekday") dayName = part.value;
    if (part.type === "hour") hour = parseInt(part.value, 10) % 24;
    if (part.type === "minute") minute = parseInt(part.value, 10);
  }

  return { dayName, currentMinutes: hour * 60 + minute };
}

function computeStatus(): LocationStatus {
  const loc = LOCATIONS[0];
  const { dayName, currentMinutes } = getHawaiiTime();

  const dayHours = loc.hours.find((h) => h.day === dayName);
  if (!dayHours || dayHours.hours.toLowerCase().includes("closed")) {
    return { shortName: loc.shortName, isOpen: false, nextSlot: null, closingTime: null };
  }

  const parts = dayHours.hours.split("–");
  const openMin = parseTime(parts[0] || "9:00 AM");
  const closeMin = parseTime(parts[1] || "7:00 PM");
  const isOpen = currentMinutes >= openMin && currentMinutes < closeMin;

  const nextSlot = TIME_SLOTS.find((slot) => {
    const slotMin = parseTime(slot);
    return slotMin > currentMinutes && slotMin + 30 <= closeMin;
  });

  return {
    shortName: loc.shortName,
    isOpen,
    nextSlot: nextSlot ?? null,
    closingTime: parts[1] ? parts[1].trim() : null,
  };
}

export function AvailabilityTicker() {
  const { openBooking } = useBooking();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<LocationStatus | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (!dismissed) {
      setVisible(true);
    }
    setStatus(computeStatus());
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, []);

  if (!visible || !status) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="ticker"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: LUXURY_EASE }}
          className="relative z-[60] overflow-hidden bg-espresso"
          role="banner"
          aria-label="Location availability"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 md:px-8">
            {/* Status content */}
            <div className="flex min-w-0 flex-1 items-center justify-center gap-2.5">
              <Scissors className="size-3 shrink-0 text-gold" aria-hidden="true" />

              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="text-[0.65rem] tracking-[0.24em] text-gold uppercase font-semibold">
                  Honolulu Lounge
                </span>
                <span className="text-slate-400">·</span>
                {status.isOpen ? (
                  <>
                    <span className="flex items-center gap-1 text-[0.65rem] tracking-wider text-zinc-200">
                      <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                      Open now until {status.closingTime}
                    </span>
                    {status.nextSlot && (
                      <>
                        <span className="text-slate-400">·</span>
                        <span className="text-[0.65rem] tracking-wider text-zinc-300">
                          Next open chair: <span className="text-gold font-medium">{status.nextSlot}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => openBooking()}
                          className="ml-1 rounded-sm border border-gold/40 px-2 py-0.5 text-[0.6rem] tracking-[0.2em] text-gold uppercase transition-colors hover:bg-gold/10 cursor-pointer font-medium"
                        >
                          Book Now →
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <span className="text-[0.65rem] tracking-wider text-zinc-400">
                    Closed currently · Walk-ins & Bookings welcome during open hours
                  </span>
                )}
              </div>
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={dismiss}
              className="shrink-0 rounded-full p-1 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
              aria-label="Dismiss availability banner"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
