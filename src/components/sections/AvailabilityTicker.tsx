/**
 * AvailabilityTicker
 *
 * A dismissible top announcement bar that shows live-computed
 * "next available slot" information based on current time and
 * the banner text set in the admin dashboard (Settings → Banner).
 */
import { AnimatePresence, motion } from "framer-motion";
import { X, Scissors } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useSiteContent } from "@/components/SiteContentContext";
import { useBooking } from "@/components/booking/BookingContext";

const LUXURY_EASE = [0.22, 0.61, 0.36, 1] as const;
const SESSION_KEY = "thebarbers_ticker_dismissed";

export function AvailabilityTicker() {
  const { openBooking } = useBooking();
  const { banner } = useSiteContent();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const dismissed = sessionStorage.getItem(SESSION_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "1");
    }
  }, []);

  if (!visible || !banner.enabled || !banner.text) return null;

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
                <span className="flex items-center gap-1 text-[0.65rem] tracking-wider text-zinc-200">
                  <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  {banner.text}
                </span>
                <span className="text-slate-400">·</span>
                <button
                  type="button"
                  onClick={() => openBooking()}
                  className="ml-1 rounded-sm border border-gold/40 px-2 py-0.5 text-[0.6rem] tracking-[0.2em] text-gold uppercase transition-colors hover:bg-gold/10 cursor-pointer font-medium"
                >
                  Book Now →
                </button>
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
