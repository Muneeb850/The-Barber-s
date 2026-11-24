import { Instagram } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { useSiteContent } from "@/components/SiteContentContext";

export function InstagramStrip() {
  const { gallery, business } = useSiteContent();
  if (gallery.length === 0) return null;
  const instagram =
    business.socials.find((s) => s.label.toLowerCase().includes("insta")) ?? business.socials[0];
  return (
    <section className="border-y border-border surface-linen py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow={business.instagramHandle || "Instagram"}
          title="Fresh from the chair"
          intro="A daily look at the cuts leaving our doors."
        />
        <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {gallery.slice(0, 12).map((g, i) => (
            <Reveal as="li" key={g.id} delay={i * 0.06}>
              <a
                href={instagram?.href ?? "#"}
                target="_blank"
                rel="noreferrer noopener"
                className="group relative block aspect-square overflow-hidden"
              >
                <img
                  src={g.src}
                  alt={g.alt}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-110"
                />
                <span className="absolute inset-0 grid place-items-center bg-espresso/0 opacity-0 transition-all duration-500 group-hover:bg-espresso/45 group-hover:opacity-100">
                  <Instagram className="size-6 text-background" aria-hidden="true" />
                </span>
              </a>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
