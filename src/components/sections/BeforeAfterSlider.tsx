/**
 * BeforeAfterSlider
 *
 * A premium drag/touch-enabled image comparison slider.
 * Drag the divider line to reveal the "After" image over the "Before" image.
 */
import { motion, useMotionValue, useTransform, animate, useReducedMotion } from "framer-motion";
import { useRef, useCallback } from "react";

interface Props {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  /** Initial position of the divider as a fraction 0–1. Default: 0.5 */
  initialPosition?: number;
  className?: string;
}

const LUXURY_EASE = [0.22, 0.61, 0.36, 1] as const;

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt = "After",
  initialPosition = 0.5,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const position = useMotionValue(initialPosition); // 0 → 1
  const reduce = useReducedMotion();

  // Clip-path for the "after" image layer: reveal left side up to `position`
  const clipX = useTransform(position, (v) => `${v * 100}%`);

  const updatePosition = useCallback(
    (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const { left, width } = el.getBoundingClientRect();
      const clamped = Math.min(Math.max((clientX - left) / width, 0.05), 0.95);
      position.set(clamped);
    },
    [position],
  );

  /* ── Mouse ─────────────────────────────────── */
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (e.buttons !== 1) return;
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      updatePosition(e.clientX);
    },
    [updatePosition],
  );

  /* ── Touch ─────────────────────────────────── */
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition],
  );

  /* ── Spring-snap to nearest half on release ── */
  const snapToNearest = useCallback(() => {
    if (reduce) return;
    const v = position.get();
    const target = v < 0.3 ? 0.15 : v > 0.7 ? 0.85 : 0.5;
    if (Math.abs(v - 0.5) < 0.08) return; // close to center, no snap
    animate(position, target, { type: "spring", stiffness: 120, damping: 22 });
  }, [position, reduce]);

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden cursor-col-resize rounded-sm border border-border/60 shadow-[var(--shadow-soft)] ${className}`}
      onMouseMove={onMouseMove}
      onMouseDown={onMouseDown}
      onMouseUp={snapToNearest}
      onTouchMove={onTouchMove}
      onTouchEnd={snapToNearest}
      style={{ touchAction: "none" }}
      role="img"
      aria-label={`Before and after comparison: ${beforeAlt} vs ${afterAlt}`}
    >
      {/* ── Before Layer (bottom) ── */}
      <div className="relative w-full" aria-hidden="true">
        <img
          src={beforeSrc}
          alt={beforeAlt}
          className="block h-full w-full object-cover select-none pointer-events-none"
          style={{ aspectRatio: "16/9" }}
          draggable={false}
          loading="lazy"
        />
        {/* Before label */}
        <span className="absolute bottom-4 right-4 rounded-full border border-amber-100/30 bg-espresso/80 px-3 py-1 text-[0.65rem] tracking-[0.25em] text-amber-100 uppercase backdrop-blur-sm font-medium">
          Before
        </span>
      </div>

      {/* ── After Layer (top, clipped) ── */}
      <motion.div
        className="absolute inset-0"
        style={{ clipPath: useTransform(clipX, (x) => `inset(0 ${100 - parseFloat(x)}% 0 0)`) }}
        aria-hidden="true"
      >
        <img
          src={afterSrc}
          alt={afterAlt}
          className="h-full w-full object-cover select-none pointer-events-none"
          style={{ aspectRatio: "16/9" }}
          draggable={false}
          loading="lazy"
        />
        {/* After label */}
        <span className="absolute bottom-4 left-4 rounded-full border border-gold/60 bg-espresso/80 px-3 py-1 text-[0.65rem] tracking-[0.25em] text-gold uppercase backdrop-blur-sm font-medium">
          After
        </span>
      </motion.div>

      {/* ── Divider Line ── */}
      <motion.div
        className="absolute inset-y-0 -ml-px w-0.5 bg-gold/80 shadow-[0_0_12px_2px_oklch(0.72_0.098_76/0.45)]"
        style={{ left: clipX }}
        aria-hidden="true"
      >
        {/* Drag Handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex size-10 items-center justify-center rounded-full border-2 border-gold bg-espresso shadow-[0_4px_24px_-4px_oklch(0.32_0.036_45/0.5)]">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
            className="text-gold"
          >
            <path
              d="M5 9H13M5 9L7.5 6.5M5 9L7.5 11.5M13 9L10.5 6.5M13 9L10.5 11.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </motion.div>

      {/* Drag hint — fades out on first interaction */}
      <motion.div
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        initial={{ opacity: 1 }}
        whileHover={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: LUXURY_EASE }}
        aria-hidden="true"
      >
        <span className="rounded-full border border-background/30 bg-espresso/70 px-4 py-1.5 text-[0.65rem] tracking-[0.28em] text-background/80 uppercase backdrop-blur-sm">
          Drag to compare
        </span>
      </motion.div>
    </div>
  );
}
