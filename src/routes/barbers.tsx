import { createFileRoute } from "@tanstack/react-router";
import { useState, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal, LUXURY_EASE } from "@/components/Reveal";
import { GoldButton } from "@/components/ui/GoldButton";
import { BarberDrawer } from "@/components/sections/BarberDrawer";
import { useBooking } from "@/components/booking/BookingContext";
import { BARBERS, BUSINESS, type Barber } from "@/lib/site-data";
import { motion, useReducedMotion } from "framer-motion";

export const Route = createFileRoute("/barbers")({
  head: () => ({
    meta: [
      { title: `Our Barbers | Meet the ${BUSINESS.name} Team in Honolulu` },
      {
        name: "description",
        content:
          "Meet the four master barbers behind The Barbers in Honolulu — specialists in skin fades, textured crops, grey blending and straight razor shaves.",
      },
      { property: "og:title", content: `Our Barbers | ${BUSINESS.name} Honolulu` },
      {
        property: "og:description",
        content: "Specialists in fades, scissor work, styling and straight razor shaves.",
      },
    ],
  }),
  component: Barbers,
});

function Barbers() {
  const { openBooking } = useBooking();
  const reduce = useReducedMotion();
  const [activeBarber, setActiveBarber] = useState<Barber | null>(null);

  const openDrawer = useCallback((barber: Barber) => {
    setActiveBarber(barber);
  }, []);

  const closeDrawer = useCallback(() => {
    setActiveBarber(null);
  }, []);

  const handleBook = useCallback(
    (barberId: string) => {
      openBooking(barberId);
    },
    [openBooking],
  );

  return (
    <>
      <PageHeader
        eyebrow="The Team"
        title="Our barbers"
        intro="Dedicated specialists, each chosen for patience as much as technique. Tap any barber to view their profile and book directly."
      />

      <section className="py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {BARBERS.map((b, i) => (
              <Reveal
                as="li"
                key={b.id}
                variant="scale-up"
                delay={i * 0.08}
              >
                <motion.button
                  type="button"
                  aria-label={`View ${b.name}'s profile`}
                  onClick={() => openDrawer(b)}
                  whileHover={reduce ? undefined : { y: -6 }}
                  transition={{ duration: 0.45, ease: LUXURY_EASE }}
                  className="group flex w-full flex-col h-full text-left overflow-hidden rounded-sm border border-border/70 bg-card shadow-[var(--shadow-soft)] gold-glow-hover cursor-pointer"
                >
                  {/* Portrait */}
                  <div className="overflow-hidden relative">
                    <img
                      src={b.image}
                      alt={`${b.name}, ${b.role} at ${BUSINESS.name}`}
                      width={900}
                      height={1100}
                      loading="lazy"
                      className="aspect-[3/4] w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 flex items-end justify-center pb-5 bg-gradient-to-t from-espresso/80 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                      <span className="rounded-full border border-gold/60 bg-espresso/80 px-3 py-1 text-[0.6rem] tracking-[0.24em] text-gold uppercase backdrop-blur-sm font-medium">
                        View Profile →
                      </span>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="font-serif text-xl leading-snug">{b.name}</h2>
                    <p className="mt-1 text-[0.6rem] tracking-[0.22em] text-gold uppercase font-semibold">
                      {b.role}
                    </p>
                    <p className="mt-2.5 text-xs font-medium text-foreground/80">{b.specialty}</p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                      {b.bio}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-1.5 mt-auto pt-3">
                      {b.socials.map((s) => (
                        <span
                          key={s.label}
                          className="border border-border px-2.5 py-1 text-[0.58rem] tracking-[0.18em] text-muted-foreground uppercase rounded-sm"
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.button>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={0.2} variant="scale-up" className="mt-16 text-center">
            <GoldButton size="lg" onClick={() => openBooking()}>
              Book with any barber
            </GoldButton>
          </Reveal>
        </div>
      </section>

      {/* Barber Profile Drawer */}
      <BarberDrawer
        barber={activeBarber}
        onClose={closeDrawer}
        onBook={handleBook}
      />
    </>
  );
}
