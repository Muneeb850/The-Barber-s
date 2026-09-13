import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { Reveal, SectionHeading, ImageMaskReveal } from "@/components/Reveal";
import { BUSINESS } from "@/lib/site-data";
import realInterior from "@/assets/real-interior.jpg";
import realExterior from "@/assets/real-exterior.jpg";
import realLadiesService from "@/assets/real-ladies-service.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About The Barbers | Our Story & Philosophy — Honolulu Barbershop" },
      {
        name: "description",
        content:
          "The story behind The Barbers: a Honolulu grooming lounge built on craft, patience and hospitality. Meet our team and see inside the shop.",
      },
      { property: "og:title", content: "About The Barbers — Honolulu Barbershop" },
      {
        property: "og:description",
        content: "Craft, patience and hospitality in Honolulu. The story behind The Barbers.",
      },
    ],
  }),
  component: About,
});

const VALUES = [
  {
    title: "Consultation first",
    body: "Every appointment opens with a conversation. We plan the cut before a blade touches hair.",
  },
  {
    title: "Time, generously given",
    body: "We book unhurried chairs so nobody's grooming session gets compressed.",
  },
  {
    title: "Hospitality as standard",
    body: "Fresh refreshments, hot steamed towels, and an atmosphere built for relaxation.",
  },
];

function About() {
  return (
    <>
      <PageHeader
        eyebrow="Our Story"
        title="Established in Honolulu"
        intro={`${BUSINESS.name} was created with one philosophy: a haircut should feel like a luxurious ritual, never a chore.`}
      />

      {/* Founder & Origins Section */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 md:grid-cols-2 md:px-8">
          <ImageMaskReveal
            src={realInterior}
            alt="The Barbers barbershop — barbers working on clients at Kona Street Honolulu"
            width={1600}
            height={1100}
            className="shadow-[var(--shadow-soft)] rounded-sm border border-border/80"
          />

          <Reveal variant="scale-up" delay={0.15}>
            <p className="eyebrow">The Vision</p>
            <h2 className="mt-4 font-serif text-3xl leading-tight sm:text-4xl">
              Craftsmanship & Community
            </h2>
            <p className="mt-1 text-[0.65rem] tracking-[0.22em] text-gold uppercase font-medium">
              Honolulu, Hawaii
            </p>
            <div className="rule-gold mt-6 max-w-24" aria-hidden="true" />
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {BUSINESS.name} was founded with a clear vision: to create a grooming experience
              that rejects the rushed pace of modern commercial barbershops. Committed to the
              highest standards of the craft, we established a sanctuary where every cut is a
              precise collaboration and every service is given the dedicated time it deserves.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Located at 1430 Kona St in Honolulu, our lounge brings together master barbers
              selected for their razor precision, contemporary styling, and genuine island
              hospitality.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="surface-linen border-y border-border py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading
            eyebrow="Philosophy"
            title="Three rules we don't bend"
            intro="The reason our clients trust us chair after chair."
          />
          <ul className="mt-14 grid gap-6 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal
                as="li"
                key={v.title}
                variant="scale-up"
                delay={i * 0.12}
                className="lux-card lux-card-hover p-8 rounded-sm gold-glow-hover"
              >
                <span className="font-serif text-4xl text-gold/50">0{i + 1}</span>
                <h3 className="mt-4 font-serif text-2xl">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* Inside the Shop */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading eyebrow="Inside the lounge" title="Comfort, style and precision" />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            <ImageMaskReveal
              src={realExterior}
              alt="The Barbers — exterior of our Kona Street location in Honolulu"
              width={1200}
              height={900}
              delay={0.1}
              className="shadow-[var(--shadow-soft)] rounded-sm"
              imgClassName="h-[420px]"
            />
            <ImageMaskReveal
              src={realLadiesService}
              alt="Expert stylist performing ladies curl styling service"
              width={1200}
              height={1200}
              delay={0.25}
              className="shadow-[var(--shadow-soft)] rounded-sm"
              imgClassName="h-[420px]"
            />
          </div>
        </div>
      </section>
    </>
  );
}
