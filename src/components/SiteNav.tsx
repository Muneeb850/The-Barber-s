import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { useBooking } from "@/components/booking/BookingContext";
import { GoldButton } from "@/components/ui/GoldButton";
import { BUSINESS, LOCATIONS } from "@/lib/site-data";
import logo from "@/assets/logo.png";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/barbers", label: "Our Barbers" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
] as const;

const LUXURY_EASE = [0.22, 0.61, 0.36, 1] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openBooking } = useBooking();
  const routerState = useRouterState();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [routerState.location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Floating Pill Navbar ─────────────────────────────────── */}
      <motion.header
        layout
        transition={{ duration: 0.5, ease: LUXURY_EASE }}
        className={`fixed z-50 transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
          scrolled
            ? "inset-x-4 top-3 md:inset-x-8 lg:inset-x-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-[min(960px,calc(100vw-4rem))]"
            : "inset-x-0 top-0"
        }`}
      >
        <motion.div
          layout
          className={`transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
            scrolled
              ? "rounded-full border border-border bg-background/95 dark:bg-card/95 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl"
              : "border-b border-transparent bg-transparent"
          }`}
        >
          <nav
            className={`mx-auto grid grid-cols-[1fr_auto] items-center gap-4 transition-all duration-500 ease-[cubic-bezier(0.22,0.61,0.36,1)] ${
              scrolled ? "px-5 py-3 md:px-7" : "max-w-7xl px-5 py-5 md:px-8"
            }`}
            aria-label="Main"
          >
            {/* Brand & Location */}
            <div className="flex items-center gap-3.5 min-w-0">
              <Link
                to="/"
                className="flex shrink-0 items-center gap-2 group"
                onClick={() => setMenuOpen(false)}
              >
                <img
                  src={logo}
                  alt={BUSINESS.name}
                  className={`object-contain transition-all duration-500 ${
                    scrolled ? "h-10" : "h-14"
                  }`}
                />
              </Link>

              <div
                className={`hidden sm:flex items-center gap-1.5 border-l pl-3.5 shrink-0 border-border/80`}
              >
                <MapPin className="size-3 shrink-0 text-gold" aria-hidden="true" />
                <span className="text-[0.65rem] font-medium tracking-[0.22em] uppercase text-muted-foreground">
                  Honolulu, HI
                </span>
              </div>
            </div>

            {/* Desktop Links & Controls */}
            <div className="hidden items-center gap-6 lg:flex">
              <ul className="flex items-center gap-6">
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      activeOptions={{ exact: l.to === "/" }}
                      activeProps={{ className: "text-gold font-semibold" }}
                      className="relative text-[0.68rem] tracking-[0.22em] uppercase transition-colors duration-300 group text-foreground/85 hover:text-foreground"
                    >
                      {l.label}
                      <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gold transition-all duration-300 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>

              <GoldButton
                size="sm"
                onClick={() => openBooking()}
                className={scrolled ? "scale-95" : ""}
              >
                Book Now
              </GoldButton>
            </div>

            {/* Mobile Controls (Hamburger) */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                className="shrink-0 rounded-full border border-border p-2 text-foreground hover:border-foreground/60 transition-colors duration-300"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </button>
            </div>
          </nav>
        </motion.div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {menuOpen ? (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: LUXURY_EASE }}
              className={`overflow-hidden lg:hidden ${
                scrolled
                  ? "mt-2 rounded-2xl border border-border bg-background/95 dark:bg-card/95 backdrop-blur-xl shadow-2xl"
                  : "border-t border-border bg-background/97 backdrop-blur-xl"
              }`}
            >
              <ul className="space-y-1 px-6 py-5">
                <li className="pb-2 mb-2 border-b border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3.5 text-gold" />
                  <span>{LOCATIONS[0].address}</span>
                </li>
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <Link
                      to={l.to}
                      activeOptions={{ exact: l.to === "/" }}
                      activeProps={{ className: "text-gold font-bold" }}
                      onClick={() => setMenuOpen(false)}
                      className="block py-2.5 font-serif text-xl transition-colors text-foreground hover:text-gold"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li className="pt-3">
                  <GoldButton
                    className="w-full"
                    onClick={() => {
                      setMenuOpen(false);
                      openBooking();
                    }}
                  >
                    Book Now
                  </GoldButton>
                </li>
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
