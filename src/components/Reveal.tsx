import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealVariant = "fade-up" | "slide-left" | "slide-right" | "scale-up" | "fade";

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  scale?: number;
  variant?: RevealVariant;
  className?: string;
  as?: "div" | "section" | "li" | "article" | "header" | "ul";
};

export const LUXURY_EASE = [0.22, 0.61, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 28,
  x = 0,
  scale = 1,
  variant,
  className,
  as = "div",
}: Props) {
  const reduce = useReducedMotion();
  const Comp = motion[as];

  // Derive initial values based on variant if provided
  let initialX = x;
  let initialY = y;
  let initialScale = scale;

  if (variant === "slide-left") {
    initialX = -60;
    initialY = 0;
  } else if (variant === "slide-right") {
    initialX = 60;
    initialY = 0;
  } else if (variant === "scale-up") {
    initialScale = 0.94;
    initialY = 20;
  } else if (variant === "fade") {
    initialY = 0;
    initialX = 0;
  }

  return (
    <Comp
      className={className}
      initial={
        reduce ? { opacity: 0 } : { opacity: 0, y: initialY, x: initialX, scale: initialScale }
      }
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.85, delay, ease: LUXURY_EASE }}
    >
      {children}
    </Comp>
  );
}

/**
 * Gallery Page Alternating Left/Right Drop-In Animation Component
 * Item index 0, 2, 4... slides/drops in from Left
 * Item index 1, 3, 5... slides/drops in from Right
 */
export function GalleryReveal({
  children,
  index,
  className,
}: {
  children: ReactNode;
  index: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const isEven = index % 2 === 0;
  const initialX = isEven ? -80 : 80;
  const initialY = -24; // Subtle drop effect combined with horizontal slide

  return (
    <motion.li
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: initialX, y: initialY }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.75,
        delay: (index % 3) * 0.06,
        ease: LUXURY_EASE,
      }}
    >
      {children}
    </motion.li>
  );
}

/**
 * Image Mask / Scale Reveal for About Page and photo highlights
 */
export function ImageMaskReveal({
  src,
  alt,
  width,
  height,
  className,
  imgClassName,
  delay = 0,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  imgClassName?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={`relative overflow-hidden ${className || ""}`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.95, delay, ease: LUXURY_EASE }}
    >
      <motion.img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        initial={reduce ? undefined : { scale: 1.12 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: delay + 0.1, ease: LUXURY_EASE }}
        className={`w-full object-cover ${imgClassName || ""}`}
      />
    </motion.div>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-4 font-serif text-3xl leading-tight font-normal text-foreground sm:text-4xl md:text-5xl">
        {title}
      </h2>
      <div
        className={`rule-gold mt-6 max-w-24 ${align === "center" ? "mx-auto" : ""}`}
        aria-hidden="true"
      />
      {intro ? (
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">{intro}</p>
      ) : null}
    </Reveal>
  );
}
