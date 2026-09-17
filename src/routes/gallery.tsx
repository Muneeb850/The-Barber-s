import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { GalleryReveal, LUXURY_EASE } from "@/components/Reveal";
import { GALLERY } from "@/lib/site-data";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | Cuts, Shaves & Styling at Tom's Barber Honolulu" },
      {
        name: "description",
        content:
          "Browse fades, beard sculpts, hot towel shaves and styling work from the chairs at Tom's Barber in Honolulu.",
      },
      { property: "og:title", content: "Gallery | Tom's Barber Honolulu" },
      {
        property: "og:description",
        content: "Fades, beard sculpts and hot towel shaves from Tom's Barber chairs in Honolulu, HI.",
      },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const [index, setIndex] = useState<number | null>(null);
  const reduce = useReducedMotion();

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (dir: number) =>
      setIndex((i) => (i === null ? i : (i + dir + GALLERY.length) % GALLERY.length)),
    [],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, close, step]);

  return (
    <>
      <PageHeader
        eyebrow="Portfolio"
        title="The gallery"
        intro="Work from our chairs — tap any image to view it full size."
      />

      <section className="py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GALLERY.map((g, i) => (
              <GalleryReveal
                key={g.alt}
                index={i}
                className={g.span === "tall" ? "sm:row-span-2" : ""}
              >
                <motion.button
                  type="button"
                  onClick={() => setIndex(i)}
                  whileHover={reduce ? undefined : { rotateX: -3, rotateY: 3, scale: 1.025, y: -4 }}
                  transition={{ duration: 0.5, ease: LUXURY_EASE }}
                  style={{ transformPerspective: 1000 }}
                  className="group relative block h-full w-full overflow-hidden rounded-sm border border-border/60 bg-card shadow-[var(--shadow-soft)] gold-glow-hover cursor-pointer"
                >
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-750 ease-[cubic-bezier(0.22,0.61,0.36,1)] group-hover:scale-[1.07] ${g.span === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"
                      }`}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-espresso/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 flex items-end p-5">
                    <span className="text-xs font-medium tracking-widest text-gold uppercase drop-shadow-md">
                      View Fullsize
                    </span>
                  </span>
                </motion.button>
              </GalleryReveal>
            ))}
          </ul>
        </div>
      </section>

      <AnimatePresence>
        {index !== null ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Gallery image viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: LUXURY_EASE }}
            className="fixed inset-0 z-[60] grid place-items-center bg-espresso/92 p-5 backdrop-blur-sm"
            onClick={close}
          >
            <motion.img
              key={index}
              src={GALLERY[index].src}
              alt={GALLERY[index].alt}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.45, ease: LUXURY_EASE }}
              className="max-h-[82svh] max-w-[92vw] object-contain shadow-[var(--shadow-lift)] rounded-sm border border-gold/30"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 text-center text-xs tracking-wider text-amber-100/90 font-medium">
              {GALLERY[index].alt}
            </p>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute top-5 right-5 rounded-full border border-amber-100/30 p-2 text-amber-100 transition-colors hover:border-gold hover:text-gold cursor-pointer"
            >
              <X className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Previous image"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full border border-amber-100/30 p-2 text-amber-100 transition-colors hover:border-gold hover:text-gold cursor-pointer"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full border border-amber-100/30 p-2 text-amber-100 transition-colors hover:border-gold hover:text-gold cursor-pointer"
            >
              <ChevronRight className="size-5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
