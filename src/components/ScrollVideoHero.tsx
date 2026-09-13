import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useBooking } from "@/components/booking/BookingContext";
import { GoldButton } from "@/components/ui/GoldButton";
import { LOCATIONS, BUSINESS } from "@/lib/site-data";

export const HERO_VIDEO_SRC = "/hero-haircut.mp4";

export function ScrollVideoHero() {
  const { openBooking } = useBooking();
  const activeLoc = LOCATIONS[0];

  return (
    <section
      aria-label={`${BUSINESS.name} introduction`}
      className="relative flex h-screen min-h-[650px] w-full items-center justify-center overflow-hidden bg-espresso"
    >
      {/* Background Autoplay Video */}
      <video
        src={HERO_VIDEO_SRC}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
        aria-hidden="true"
      />

      {/* Dark Overlay Gradients for 100% Contrast in Light and Dark Mode */}
      <div
        className="absolute inset-0 bg-espresso/55 dark:bg-espresso/75 transition-colors duration-500"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-espresso/40 via-transparent to-background/95 transition-colors duration-500"
        aria-hidden="true"
      />

      {/* Hero Content Overlay */}
      <div className="relative z-10 mx-auto max-w-3xl px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-[0.7rem] tracking-[0.42em] text-gold-soft uppercase font-medium"
        >
          {activeLoc.city} · Est. 2018
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-6 font-serif text-4xl leading-[1.08] text-slate-100 sm:text-6xl md:text-7xl drop-shadow-md"
        >
          The Art of the
          <span className="block italic shimmer-gold">Modern Gentleman</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
          className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-zinc-200 sm:text-base font-normal drop-shadow-sm"
        >
          Precision cuts, hot towel rituals and an unhurried chair on {activeLoc.street}.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10 flex justify-center"
        >
          <GoldButton size="lg" onClick={() => openBooking()}>
            Book Appointment
          </GoldButton>
        </motion.div>
      </div>

      {/* Down Arrow Indicator */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-gold-soft/80">
        <ChevronDown className="size-6 animate-bounce" aria-hidden="true" />
        <span className="sr-only">Scroll down</span>
      </div>
    </section>
  );
}
