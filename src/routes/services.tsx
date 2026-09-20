import { createFileRoute } from "@tanstack/react-router";
import { Clock, Shield, Star } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Reveal } from "@/components/Reveal";
import { Faq } from "@/components/sections/Faq";
import { GoldButton } from "@/components/ui/GoldButton";
import { useBooking } from "@/components/booking/BookingContext";
import { SERVICES, BUSINESS } from "@/lib/site-data";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: `Services & Pricing | ${BUSINESS.name} Honolulu` },
      {
        name: "description",
        content:
          "Haircuts, beard sculpting, hot towel straight shaves, kids cuts and combo packages at Tom's Barber Honolulu. Transparent pricing and appointment durations.",
      },
      { property: "og:title", content: `Services & Pricing | ${BUSINESS.name}` },
      {
        property: "og:description",
        content:
          "Cuts, shaves and combo rituals with transparent pricing and durations in Honolulu, HI.",
      },
    ],
  }),
  component: Services,
});

function Services() {
  const { openBooking } = useBooking();

  return (
    <>
      <PageHeader
        eyebrow="The Menu"
        title="Services & pricing"
        intro="Every service includes a consultation, hot towel finish and styling. Prices are per visit — no hidden add-ons."
      />

      {/* ── Discount Banner ── */}
      <section className="py-10 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal variant="scale-up">
            <div className="rounded-sm border border-gold/40 bg-gradient-to-r from-card via-card/80 to-card p-6 md:p-8 shadow-[var(--shadow-soft)] relative overflow-hidden">
              {/* Decorative glow */}
              <div
                className="pointer-events-none absolute -top-10 right-10 size-48 rounded-full bg-gold/8 blur-3xl"
                aria-hidden="true"
              />
              <p className="eyebrow text-gold mb-4">Special Discounts</p>
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Military */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/10">
                    <Shield className="size-5 text-gold" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-serif text-xl text-foreground">Military Personnel</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      <span className="text-gold font-semibold">$3 off</span> any service — valid ID
                      required
                    </p>
                  </div>
                </div>
                {/* Divider */}
                <div
                  className="hidden sm:block w-px bg-border/80 self-stretch"
                  aria-hidden="true"
                />
                <div className="block sm:hidden h-px bg-border/80 w-full" aria-hidden="true" />
                {/* Seniors */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/10">
                    <Star className="size-5 text-gold" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="font-serif text-xl text-foreground">Senior Citizens</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      <span className="text-gold font-semibold">$3 off</span> any service — 65 years
                      &amp; older
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ul className="grid gap-6 md:grid-cols-2">
            {SERVICES.map((s, i) => (
              <Reveal
                as="li"
                key={s.id}
                variant={i % 2 === 0 ? "slide-left" : "slide-right"}
                delay={(i % 2) * 0.08}
                className="lux-card lux-card-hover flex flex-col p-8 rounded-sm gold-glow-hover"
              >
                {s.tag || s.subtitle ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex w-fit border border-gold/50 px-3 py-1 text-[0.6rem] tracking-[0.24em] text-gold uppercase font-medium">
                      {s.tag || s.subtitle}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="font-serif text-2xl sm:text-3xl">{s.name}</h2>
                  <span className="font-serif text-2xl text-gold">${s.price}</span>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <p className="mt-6 flex items-center gap-2 text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase font-medium">
                  <Clock className="size-3.5 text-gold" aria-hidden="true" />
                  {s.duration} minutes
                </p>
                <div className="mt-7 pt-2 mt-auto">
                  <GoldButton variant="outline" size="sm" onClick={() => openBooking(s.id)}>
                    Book this service
                  </GoldButton>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="surface-linen border-y border-border py-20 text-center overflow-hidden">
        <div className="mx-auto max-w-2xl px-5">
          <Reveal variant="scale-up">
            <h2 className="font-serif text-3xl sm:text-4xl">Not sure which to choose?</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Start the booking flow — choose your service, barber, date and time in under a minute.
            </p>
            <div className="mt-8 flex justify-center">
              <GoldButton size="lg" onClick={() => openBooking()}>
                Book Now
              </GoldButton>
            </div>
          </Reveal>
        </div>
      </section>

      <Faq />
    </>
  );
}
