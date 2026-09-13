import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { SectionHeading } from "@/components/Reveal";
import { TESTIMONIALS } from "@/lib/site-data";

export function Testimonials() {
  const loop = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section className="overflow-hidden py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Guest Book"
          title="Kind words from the chair"
          intro="Over 1,800 five-star visits since we opened our doors in Honolulu."
        />
      </div>

      <div
        className="group relative mt-14 flex overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <motion.ul
          drag="x"
          dragConstraints={{ left: -1200, right: 0 }}
          dragElastic={0.06}
          className="flex w-max animate-marquee cursor-grab gap-6 px-5 group-hover:[animation-play-state:paused] active:cursor-grabbing"
        >
          {loop.map((t, i) => (
            <li
              key={`${t.name}-${i}`}
              className="lux-card lux-card-hover w-[19rem] shrink-0 p-7 sm:w-[23rem]"
            >
              <div className="flex items-center gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sand font-serif text-sm text-espresso">
                  {t.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-serif text-lg">{t.name}</p>
                  <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="size-3.5 fill-gold text-gold" aria-hidden="true" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                &ldquo;{t.quote}&rdquo;
              </p>
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
