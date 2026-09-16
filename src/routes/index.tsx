import { createFileRoute, Link } from "@tanstack/react-router";
import { Scissors, Sparkles, Droplets, ArrowRight } from "lucide-react";
import { ScrollVideoHero } from "@/components/ScrollVideoHero";
import { Reveal, SectionHeading, ImageMaskReveal } from "@/components/Reveal";
import { Testimonials } from "@/components/sections/Testimonials";
import { Faq } from "@/components/sections/Faq";
import { InstagramStrip } from "@/components/sections/InstagramStrip";
import { BeforeAfterSlider } from "@/components/sections/BeforeAfterSlider";
import { GoldButton } from "@/components/ui/GoldButton";
import { useBooking } from "@/components/booking/BookingContext";
import { SERVICES, BUSINESS, LOCATIONS } from "@/lib/site-data";
import realInterior from "@/assets/real-interior.jpg";
import realBackCut from "@/assets/real-back-cut.jpg";
import realHaircutBefore from "@/assets/real-haircut-before.jpg";
import realHaircutAfter from "@/assets/real-haircut-after.jpg";
import barbersShowcaseVideo from "@/assets/barbers-showcase.mp4";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Barbers | Premium Grooming Lounge in Honolulu, HI" },
      {
        name: "description",
        content:
          "A premier barbershop in Honolulu, HI. Signature cuts, beard sculpting and hot towel straight shaves — book your chair at The Barbers on Kona St.",
      },
      { property: "og:title", content: "The Barbers | Premium Grooming in Honolulu" },
      {
        property: "og:description",
        content: "Precision cuts, beard sculpting and hot towel shaves at 1430 Kona St #105, Honolulu, HI.",
      },
    ],
  }),
  component: Index,
});

const HIGHLIGHTS = [
  {
    icon: Scissors,
    title: "Precision Cutting",
    body: "Scissor-over-comb craft and seamless fades, tailored to how your hair actually grows.",
  },
  {
    icon: Droplets,
    title: "Hot Towel Rituals",
    body: "Steamed linen, hand-lathered cream and a single-blade finish. Unhurried, every time.",
  },
  {
    icon: Sparkles,
    title: "Finishing Touch",
    body: "Styled, product-matched and photographed-ready before you leave the chair.",
  },
];

function Index() {
  const { openBooking } = useBooking();
  const loc = LOCATIONS[0];

  return (
    <>
      <ScrollVideoHero />

      {/* Intro Section */}
      <section className="relative overflow-hidden py-24 md:py-32">
        <div
          className="pointer-events-none absolute -top-10 -left-16 size-64 rounded-full bg-gold/10 blur-3xl animate-float-slow"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute right-0 bottom-10 size-72 rounded-full bg-sand/60 blur-3xl animate-float-slow [animation-delay:2s]"
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 md:grid-cols-2 md:px-8">
          <Reveal variant="slide-left">
            <p className="eyebrow">Welcome to {BUSINESS.name}</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
              A grooming lounge, not a waiting room
            </h2>
            <div className="rule-gold mt-6 max-w-24" aria-hidden="true" />

            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              We opened {BUSINESS.name} with one idea: a man's haircut should feel like an
              appointment worth keeping. Warm hospitality, tailored styling and sharp technique — a
              quiet room where the coffee is good and the barber never rushes.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Every visit starts with a consultation and ends with a finish you can recreate at
              home.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <GoldButton onClick={() => openBooking()}>Book Appointment</GoldButton>
              <Link to="/about">
                <GoldButton variant="outline">Our Story</GoldButton>
              </Link>
            </div>
          </Reveal>

          <ImageMaskReveal
            src={realInterior}
            alt="The Barbers barbershop interior — barbers at work on multiple chairs"
            width={1600}
            height={1100}
            delay={0.15}
            className="shadow-[var(--shadow-soft)] rounded-sm"
          />
        </div>
      </section>

      {/* Highlights Section */}
      <section className="surface-linen border-y border-border py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="The Craft"
            title="What sets the chair apart"
            intro="Three things we refuse to rush."
          />
          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {HIGHLIGHTS.map((h, i) => (
              <Reveal
                as="li"
                key={h.title}
                variant="scale-up"
                delay={i * 0.1}
                className="lux-card lux-card-hover p-8 rounded-sm gold-glow-hover"
              >
                <h.icon className="size-7 text-gold" aria-hidden="true" />
                <h3 className="mt-6 font-serif text-2xl">{h.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{h.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Service Highlights */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading eyebrow="Services" title="Signature offerings" />
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.slice(0, 3).map((s, i) => (
              <Reveal
                as="li"
                key={s.id}
                variant={i % 2 === 0 ? "slide-left" : "slide-right"}
                delay={i * 0.08}
                className="lux-card lux-card-hover p-8 rounded-sm gold-glow-hover"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-serif text-2xl">{s.name}</h3>
                  <span className="font-serif text-xl text-gold">${s.price}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
                <p className="mt-5 text-[0.65rem] tracking-[0.22em] text-muted-foreground uppercase font-medium">
                  {s.duration} minutes
                </p>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.2} className="mt-12 text-center">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm text-gold hover:underline font-medium tracking-wide"
            >
              View the full menu <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Before / After Transformation Slider */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Transformations"
            title="From the chair"
            intro="Drag the divider to reveal the difference. Every cut starts with a consultation — and ends here."
          />
          <Reveal delay={0.15} className="mt-10 max-w-2xl mx-auto">
            <BeforeAfterSlider
              beforeSrc={realHaircutBefore}
              afterSrc={realHaircutAfter}
              aspectRatio="4/5"
              beforeAlt="Long overgrown hair — before visit to The Barbers"
              afterAlt="Clean skin fade haircut — after The Barbers Honolulu"
            />
          </Reveal>
        </div>
      </section>

      <Testimonials />
      <InstagramStrip />

      {/* ── WhatsApp Showcase Video ──────────────────────────── */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid items-center gap-14 md:grid-cols-2">

            {/* Left — copy */}
            <Reveal variant="slide-left">
              <p className="eyebrow text-gold">In the Shop</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl md:text-5xl">
                The craft,<br />
                <span className="italic">unfiltered</span>
              </h2>
              <div className="rule-gold mt-6 max-w-24" aria-hidden="true" />
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Real moments from our chairs — the precision, the ritual, the finish.
                This is what it looks like when a barber takes their time.
              </p>
              <ul className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { stat: "8+", label: "Years of craft" },
                  { stat: "4.9★", label: "Average rating" },
                  { stat: "100%", label: "Consultation first" },
                  { stat: "0", label: "Rushed cuts" },
                ].map((item) => (
                  <li key={item.label} className="lux-card rounded-sm p-4">
                    <p className="font-serif text-2xl text-gold">{item.stat}</p>
                    <p className="mt-1 text-xs tracking-[0.18em] uppercase text-muted-foreground font-medium">{item.label}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <GoldButton onClick={() => openBooking()}>Book Appointment</GoldButton>
              </div>
            </Reveal>

            {/* Right — phone mockup */}
            <Reveal variant="slide-right" delay={0.15} className="flex justify-center">
              {/* Phone outer shell */}
              <div className="relative w-[260px] sm:w-[300px]">
                {/* Phone body */}
                <div className="relative rounded-[2.8rem] border-[7px] border-foreground/80 bg-black shadow-[0_32px_80px_-12px_rgba(0,0,0,0.55),0_0_0_1px_oklch(0.72_0.098_76/0.3)] overflow-hidden">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-28 h-6 bg-foreground/80 rounded-b-2xl flex items-center justify-center gap-2">
                    <div className="size-2 rounded-full bg-background/30" />
                    <div className="size-3 rounded-full bg-background/20 border border-background/40" />
                  </div>
                  {/* Screen */}
                  <div className="relative overflow-hidden" style={{ aspectRatio: "9/19.5" }}>
                    <video
                      src={barbersShowcaseVideo}
                      className="absolute inset-0 w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                    />
                    {/* Status bar overlay */}
                    <div className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-black/60 to-transparent z-10" />
                    {/* Bottom home indicator */}
                    <div className="absolute bottom-2 inset-x-0 flex justify-center z-10">
                      <div className="w-24 h-1 rounded-full bg-white/50" />
                    </div>
                  </div>
                </div>
                {/* Side buttons */}
                <div className="absolute -left-[9px] top-24 w-[7px] h-8 rounded-l-sm bg-foreground/70" aria-hidden="true" />
                <div className="absolute -left-[9px] top-36 w-[7px] h-12 rounded-l-sm bg-foreground/70" aria-hidden="true" />
                <div className="absolute -left-[9px] top-52 w-[7px] h-12 rounded-l-sm bg-foreground/70" aria-hidden="true" />
                <div className="absolute -right-[9px] top-36 w-[7px] h-16 rounded-r-sm bg-foreground/70" aria-hidden="true" />
                {/* Gold glow beneath phone */}
                <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-16 rounded-full bg-gold/20 blur-2xl" aria-hidden="true" />
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* Hours + CTA */}
      <section className="surface-linen border-y border-border py-24 md:py-32 overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 md:grid-cols-2 md:px-8">
          <Reveal variant="slide-left">
            <div>
              <p className="eyebrow">Honolulu Hours</p>
              <h2 className="mt-4 font-serif text-3xl sm:text-4xl">Open for you</h2>
            </div>

            <ul className="mt-8 divide-y divide-border">
              {loc.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4 py-3 text-sm">
                  <span className="text-muted-foreground">{h.day}</span>
                  <span className="font-medium text-foreground">{h.hours}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal variant="scale-up" delay={0.15} className="flex flex-col justify-center">
            <p className="eyebrow">Ready when you are</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
              Reserve your appointment in Honolulu
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {loc.address}
              <br />
              <a href={BUSINESS.phoneHref} className="text-gold hover:underline font-medium">
                {BUSINESS.phone}
              </a>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton size="lg" onClick={() => openBooking()}>
                Book Now
              </GoldButton>
              <Link to="/contact">
                <GoldButton size="lg" variant="outline">
                  Find Us
                </GoldButton>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Faq />
    </>
  );
}
