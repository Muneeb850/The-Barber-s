/**
 * BarberDrawer
 *
 * A full-height right-side panel that slides in when a barber card is clicked.
 * Shows the barber's portrait, specialties, bio, socials, and a direct booking CTA.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, Star, Instagram, Facebook } from "lucide-react";
import { useEffect } from "react";
import { GoldButton } from "@/components/ui/GoldButton";
import { type Barber } from "@/lib/site-data";

interface Props {
  barber: Barber | null;
  onClose: () => void;
  onBook: (barberId: string) => void;
}

const LUXURY_EASE = [0.22, 0.61, 0.36, 1] as const;

const SOCIAL_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram,
  Facebook,
};

export function BarberDrawer({ barber, onClose, onBook }: Props) {
  const reduce = useReducedMotion();

  // Escape key support
  useEffect(() => {
    if (!barber) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [barber, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (barber) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [barber]);

  return (
    <AnimatePresence>
      {barber ? (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            className="fixed inset-0 z-[55] bg-espresso/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${barber.name} profile`}
            initial={reduce ? { opacity: 0 } : { x: "100%" }}
            animate={reduce ? { opacity: 1 } : { x: 0 }}
            exit={reduce ? { opacity: 0 } : { x: "100%" }}
            transition={{ duration: 0.48, ease: LUXURY_EASE }}
            className="fixed inset-y-0 right-0 z-[56] flex w-full max-w-[440px] flex-col bg-card shadow-[var(--shadow-lift)] border-l border-border/60 overflow-hidden"
          >
            {/* ── Top: Portrait ─────────────────────────────────── */}
            <div className="relative h-[46%] shrink-0 overflow-hidden">
              <img
                src={barber.image}
                alt={barber.name}
                className="h-full w-full object-cover object-top"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

              {/* Close button */}
              <button
                type="button"
                aria-label="Close barber profile"
                onClick={onClose}
                className="absolute top-4 right-4 flex size-9 items-center justify-center rounded-full border border-gold/40 bg-espresso/80 text-gold-soft backdrop-blur-sm transition-colors hover:border-gold hover:text-gold cursor-pointer"
              >
                <X className="size-4" />
              </button>

              {/* Name overlay on image */}
              <div className="absolute bottom-4 left-5 right-5">
                <p className="text-[0.6rem] tracking-[0.28em] text-gold uppercase font-semibold">
                  {barber.role}
                </p>
                <h2 className="mt-1 font-serif text-2xl leading-tight text-foreground">
                  {barber.name}
                </h2>
              </div>
            </div>

            {/* ── Bottom: Details ────────────────────────────────── */}
            <div className="flex flex-1 flex-col overflow-y-auto px-6 py-5">
              {/* Specialty */}
              <div className="flex items-center gap-2">
                <div className="rule-gold max-w-10 shrink-0" aria-hidden="true" />
                <p className="text-xs tracking-wide text-muted-foreground font-medium">
                  {barber.specialty}
                </p>
              </div>

              {/* Star Rating (always 5 for luxury branding) */}
              <div className="mt-3 flex gap-0.5" aria-label="5 star rating">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="size-3.5 fill-gold text-gold"
                    aria-hidden="true"
                  />
                ))}
                <span className="ml-1.5 text-[0.65rem] text-muted-foreground tracking-wider">
                  Top rated
                </span>
              </div>

              {/* Bio */}
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                {barber.bio}
              </p>

              {/* Signature Services */}
              <div className="mt-5 rounded-sm border border-border/60 bg-background/60 p-4">
                <p className="text-[0.6rem] tracking-[0.24em] text-gold uppercase font-semibold mb-2.5">
                  Signature Services
                </p>
                {["Precision haircut", "Fade consultation", "Hot towel finish"].map((s) => (
                  <p key={s} className="flex items-center gap-2 py-1 text-xs text-foreground/80">
                    <span className="size-1 rounded-full bg-gold shrink-0" aria-hidden="true" />
                    {s}
                  </p>
                ))}
              </div>

              {/* Socials */}
              {barber.socials.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {barber.socials.map((s) => {
                    const Icon = SOCIAL_ICON_MAP[s.label];
                    return (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase transition-all duration-300 hover:border-gold hover:text-gold"
                      >
                        {Icon && <Icon className="size-3" />}
                        {s.label}
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* CTA */}
              <div className="mt-6 space-y-2.5">
                <GoldButton
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    onBook(barber.id);
                    onClose();
                  }}
                >
                  Book with {barber.name.split(" ")[0]}
                </GoldButton>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2 text-xs tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground cursor-pointer"
                >
                  Close profile
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
