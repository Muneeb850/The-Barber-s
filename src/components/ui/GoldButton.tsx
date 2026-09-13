import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "gold" | "outline" | "ghost";
type Size = "md" | "lg" | "sm";

const base =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm font-sans uppercase tracking-[0.18em] transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  gold: "bg-red-600 text-white font-semibold shadow-[0_4px_20px_-4px_rgba(220,38,38,0.5)] hover:bg-red-700 dark:hover:bg-red-500 hover:shadow-[0_8px_25px_-4px_rgba(220,38,38,0.65)] active:scale-[0.98]",
  outline:
    "border border-foreground/30 bg-transparent text-foreground hover:border-red-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-600/10",
  ghost: "text-foreground hover:text-red-500 dark:hover:text-red-400",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[0.68rem]",
  md: "px-6 py-3 text-xs",
  lg: "px-8 py-4 text-xs",
};

export const GoldButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ className, variant = "gold", size = "md", children, ...props }, ref) => (
  <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props}>
    <span className="relative z-10">{children}</span>
  </button>
));
GoldButton.displayName = "GoldButton";
