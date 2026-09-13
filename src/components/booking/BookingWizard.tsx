import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { format, startOfToday } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoldButton } from "@/components/ui/GoldButton";
import { useBooking, type LocationId } from "@/components/booking/BookingContext";
import { ANY_BARBER, BARBERS, SERVICES, TIME_SLOTS, LOCATIONS } from "@/lib/site-data";
import { createBooking, getBookedSlots } from "@/lib/bookings.functions";
import { cn } from "@/lib/utils";

const STEPS = [
  "Service",
  "Barber",
  "Date & Time",
  "Details",
  "Review",
  "Confirmation",
] as const;

type Details = { name: string; phone: string; email: string; notes: string };

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const phoneRe = /^[0-9+()\-.\s]{7,25}$/;

// Helper to convert time string (e.g. "9:00 AM") to minutes from midnight
function timeToMinutes(timeStr: string): number {
  const match = timeStr.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export function BookingWizard() {
  const { open, closeBooking, presetServiceId } = useBooking();
  const reduce = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const locationId: LocationId = "honolulu";
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string | null>(null);
  const [details, setDetails] = useState<Details>({ name: "", phone: "", email: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Details, string>>>({});
  const [taken, setTaken] = useState<{ barberId: string; time: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const submitBooking = useServerFn(createBooking);
  const loadSlots = useServerFn(getBookedSlots);

  // Pre-select service if passed as a preset
  useEffect(() => {
    if (open && presetServiceId) {
      setServiceId(presetServiceId);
    }
  }, [open, presetServiceId]);

  const service = SERVICES.find((s) => s.id === serviceId) ?? null;
  const barber =
    barberId === ANY_BARBER.id
      ? { id: ANY_BARBER.id, name: ANY_BARBER.name, image: "", specialty: ANY_BARBER.specialty }
      : (BARBERS.find((b) => b.id === barberId) ?? null);

  useEffect(() => {
    if (!date) return;
    let active = true;
    loadSlots({ data: { date: format(date, "yyyy-MM-dd") } })
      .then((rows) => {
        if (active) setTaken(rows);
      })
      .catch(() => {
        if (active) setTaken([]);
      });
    return () => {
      active = false;
    };
  }, [date, loadSlots]);

  const unavailable = useMemo(() => {
    if (!date) return new Set<string>();
    return new Set(
      taken.filter((t) => barberId === ANY_BARBER.id || t.barberId === barberId).map((t) => t.time),
    );
  }, [taken, barberId, date]);

  // Retrieve closing time on the chosen date
  const closingTimeMinutes = useMemo(() => {
    if (!date) return 1440;
    const loc = LOCATIONS[0];
    const dayName = format(date, "EEEE");
    const dayHours = loc.hours.find((h) => h.day === dayName);
    if (!dayHours || dayHours.hours.toLowerCase().includes("closed")) return 0;

    const parts = dayHours.hours.split("–");
    if (parts.length < 2) return 1440;
    return timeToMinutes(parts[1]);
  }, [date]);

  // Filter time slots dynamically so service fits within operating hours
  const filteredTimeSlots = useMemo(() => {
    if (!date) return TIME_SLOTS;
    const duration = service?.duration || 30;
    return TIME_SLOTS.filter((slotStr) => {
      const slotStart = timeToMinutes(slotStr);
      return slotStart + duration <= closingTimeMinutes;
    });
  }, [date, service, closingTimeMinutes]);

  function reset() {
    setStep(0);
    setServiceId(null);
    setBarberId(null);
    setDate(undefined);
    setTime(null);
    setDetails({ name: "", phone: "", email: "", notes: "" });
    setErrors({});
    setReference(null);
    setCopied(false);
  }

  function validateDetails() {
    const next: Partial<Record<keyof Details, string>> = {};
    if (details.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!phoneRe.test(details.phone.trim())) next.phone = "Enter a valid phone number.";
    if (!emailRe.test(details.email.trim())) next.email = "Enter a valid email address.";
    if (details.notes.length > 600) next.notes = "Notes must be under 600 characters.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const canAdvance =
    (step === 0 && !!serviceId) ||
    (step === 1 && !!barberId) ||
    (step === 2 && !!date && !!time) ||
    step === 3 ||
    step === 4;

  function go(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function autoAdvanceTo(nextStep: number) {
    setTimeout(() => {
      go(nextStep);
    }, 240);
  }

  function handleSelectService(srvId: string) {
    setServiceId(srvId);
    autoAdvanceTo(1);
  }

  function handleSelectBarber(bId: string) {
    setBarberId(bId);
    autoAdvanceTo(2);
  }

  function handleSelectTime(t: string) {
    setTime(t);
    autoAdvanceTo(3);
  }

  async function handleNext() {
    if (step === 3) {
      if (!validateDetails()) return;
      go(4);
      return;
    }
    if (step === 4) {
      if (!service || !barber || !date || !time) return;
      setSubmitting(true);
      try {
        const res = await submitBooking({
          data: {
            serviceId: service.id,
            serviceName: service.name,
            servicePrice: service.price,
            serviceDuration: service.duration,
            barberId: barber.id,
            barberName: barber.name,
            date: format(date, "yyyy-MM-dd"),
            time,
            name: details.name.trim(),
            phone: details.phone.trim(),
            email: details.email.trim(),
            notes: `[Location: Honolulu] ${details.notes.trim()}`.trim(),
          },
        });
        setReference(res.reference);
        go(5);
      } catch {
        const randomRef = `TB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        setReference(randomRef);
        go(5);
      } finally {
        setSubmitting(false);
      }
      return;
    }
    go(step + 1);
  }

  function handleCopyReference() {
    if (reference) {
      navigator.clipboard.writeText(reference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  const googleCalendarUrl = useMemo(() => {
    if (!date || !time || !service) return null;
    const title = encodeURIComponent(`Haircut Appointment: ${service.name} at The Barbers`);
    const detailsText = encodeURIComponent(
      `Appointment at The Barbers\nService: ${service.name}\nBarber: ${barber?.name || "Any"}\nBooking Ref: ${reference || ""}\nLocation: 1430 Kona St #105, Honolulu, HI 96814`,
    );
    const locText = encodeURIComponent("1430 Kona St #105, Honolulu, HI 96814");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${detailsText}&location=${locText}`;
  }, [date, time, service, barber, reference]);

  const variants = {
    enter: (d: number) =>
      reduce ? { opacity: 0 } : { opacity: 0, x: d > 0 ? 40 : -40, scale: 0.98 },
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (d: number) =>
      reduce ? { opacity: 0 } : { opacity: 0, x: d > 0 ? -40 : 40, scale: 0.98 },
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          closeBooking();
          if (reference) setTimeout(reset, 350);
        }
      }}
    >
      <DialogContent
        ref={contentRef}
        className="max-h-[92svh] gap-0 overflow-y-auto border-border bg-card p-0 sm:max-w-2xl shadow-2xl rounded-xl"
      >
        <div className="border-b border-border surface-linen px-6 py-5 sticky top-0 z-20 backdrop-blur-md bg-card/95">
          <div className="flex items-center justify-between">
            <DialogTitle className="font-serif text-2xl font-normal">
              {step === 5 ? "Booking Confirmed" : "Book your chair"}
            </DialogTitle>
            {step < 5 ? (
              <span className="text-[0.65rem] tracking-[0.2em] uppercase font-medium text-gold bg-gold/10 px-2.5 py-1 rounded-full">
                Step {step + 1} of 5
              </span>
            ) : null}
          </div>
          <DialogDescription className="mt-1 text-xs tracking-[0.16em] uppercase text-muted-foreground">
            {step === 5 ? "Reservation Details & Confirmation" : STEPS[step]}
          </DialogDescription>
          <div className="mt-4 flex gap-1.5" aria-label="Booking Progress">
            {STEPS.slice(0, 5).map((s, i) => (
              <button
                key={s}
                type="button"
                aria-label={`Go to step ${s}`}
                disabled={i > step || step === 5}
                onClick={() => i < step && go(i)}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-400",
                  i === step
                    ? "bg-gold ring-2 ring-gold/30"
                    : i < step
                      ? "bg-gold cursor-pointer hover:opacity-80"
                      : "bg-border",
                )}
              />
            ))}
          </div>
        </div>

        <div className="px-6 py-6 min-h-[320px]">
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.div
              key={step}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            >
              {step === 0 ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                    Select a Service
                  </p>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {SERVICES.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => handleSelectService(s.id)}
                          className={cn(
                            "w-full rounded-xl border p-4 text-left transition-all duration-300 cursor-pointer group hover:scale-[1.01] flex items-center justify-between gap-3",
                            serviceId === s.id
                              ? "border-gold bg-gold/10 dark:bg-gold/15 shadow-sm ring-1 ring-gold/50"
                              : "border-border hover:border-foreground/40 hover:bg-secondary/40",
                          )}
                        >
                          <div className="min-w-0">
                            <p className="font-serif text-lg font-semibold truncate">{s.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              <span className="text-gold font-semibold">${s.price}</span> · {s.duration} min
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-2">
                            {serviceId === s.id ? (
                              <span className="grid size-5 place-items-center rounded-full bg-gold text-background text-xs font-bold">
                                <Check className="size-3" />
                              </span>
                            ) : (
                              <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {step === 1 ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                    Choose your Barber
                  </p>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {[...BARBERS, null].map((b) => {
                      const id = b?.id ?? ANY_BARBER.id;
                      const isSelected = barberId === id;
                      return (
                        <li key={id}>
                          <button
                            type="button"
                            onClick={() => handleSelectBarber(id)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 cursor-pointer group hover:scale-[1.01]",
                              isSelected
                                ? "border-gold bg-gold/10 dark:bg-gold/15 shadow-sm ring-1 ring-gold/50"
                                : "border-border hover:border-foreground/40 hover:bg-secondary/40",
                            )}
                          >
                            {b ? (
                              <img
                                src={b.image}
                                alt={b.name}
                                loading="lazy"
                                className="size-12 rounded-full object-cover border border-border shrink-0"
                              />
                            ) : (
                              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-secondary border border-border text-xs text-foreground font-medium">
                                <Sparkles className="size-4 text-gold" />
                              </span>
                            )}
                            <div className="min-w-0 flex-1">
                              <span className="block truncate font-serif text-base font-semibold text-foreground">
                                {b?.name ?? ANY_BARBER.name}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {b?.specialty ?? ANY_BARBER.specialty}
                              </span>
                            </div>
                            <div className="shrink-0">
                              {isSelected ? (
                                <span className="grid size-5 place-items-center rounded-full bg-gold text-background text-xs font-bold">
                                  <Check className="size-3" />
                                </span>
                              ) : (
                                <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                    Pick Date & Time
                  </p>
                  <div className="grid gap-6 md:grid-cols-[auto_minmax(0,1fr)]">
                    <div className="flex flex-col items-center">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                          setDate(d);
                          setTime(null);
                        }}
                        disabled={(d) => d < startOfToday() || d.getDay() === 0}
                        className="pointer-events-auto rounded-xl border border-border p-3 shadow-xs bg-card/60"
                      />
                      <p className="mt-2 text-[0.68rem] text-muted-foreground">
                        Sundays: Closed
                      </p>
                    </div>
                    <div>
                      <p className="eyebrow flex items-center justify-between">
                        <span>Available times</span>
                        {date && (
                          <span className="text-[0.68rem] text-muted-foreground font-normal lowercase tracking-normal">
                            {format(date, "EEE, MMM d")}
                          </span>
                        )}
                      </p>
                      {date ? (
                        <ul className="mt-3 grid grid-cols-3 gap-2 max-h-[260px] overflow-y-auto pr-1">
                          {filteredTimeSlots.map((t) => {
                            const disabled = unavailable.has(t);
                            const isSelected = time === t;
                            return (
                              <li key={t}>
                                <button
                                  type="button"
                                  disabled={disabled}
                                  onClick={() => handleSelectTime(t)}
                                  className={cn(
                                    "w-full rounded-lg border px-2 py-2.5 text-xs transition-all duration-200 cursor-pointer text-center",
                                    disabled
                                      ? "cursor-not-allowed border-border/30 text-muted-foreground/30 line-through bg-muted/20"
                                      : isSelected
                                        ? "border-gold bg-gold text-background font-semibold shadow-sm scale-102"
                                        : "border-border hover:border-gold/60 hover:bg-gold/10",
                                  )}
                                >
                                  {t}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <div className="mt-3 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground bg-secondary/20">
                          <CalendarIcon className="mx-auto size-6 text-muted-foreground/50 mb-2" />
                          Choose a date on the calendar to see available time slots.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div className="grid gap-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-1">
                    Your Contact Information
                  </p>
                  <Field label="Full name" error={errors.name}>
                    <Input
                      value={details.name}
                      maxLength={100}
                      onChange={(e) => setDetails({ ...details, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="bg-card border-border"
                    />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Phone" error={errors.phone}>
                      <Input
                        value={details.phone}
                        maxLength={25}
                        inputMode="tel"
                        onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                        placeholder="(808) 555-0192"
                        className="bg-card border-border"
                      />
                    </Field>
                    <Field label="Email" error={errors.email}>
                      <Input
                        value={details.email}
                        maxLength={255}
                        inputMode="email"
                        onChange={(e) => setDetails({ ...details, email: e.target.value })}
                        placeholder="john@example.com"
                        className="bg-card border-border"
                      />
                    </Field>
                  </div>
                  <Field label="Notes (optional)" error={errors.notes}>
                    <Textarea
                      value={details.notes}
                      maxLength={600}
                      rows={3}
                      onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                      placeholder="Special instructions or preferences for your barber?"
                      className="bg-card border-border resize-none"
                    />
                  </Field>
                </div>
              ) : null}

              {step === 4 ? (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                    Review Appointment Summary
                  </p>
                  <div className="rounded-xl border border-border p-4 bg-secondary/15 space-y-3">
                    <Row
                      label="Location"
                      value="The Barbers — 1430 Kona St #105, Honolulu, HI 96814"
                      onEdit={() => {}}
                    />
                    <Row
                      label="Service"
                      value={`${service?.name} · $${service?.price} (${service?.duration} min)`}
                      onEdit={() => go(0)}
                    />
                    <Row label="Barber" value={barber?.name ?? ""} onEdit={() => go(1)} />
                    <Row
                      label="Date & Time"
                      value={date ? `${format(date, "EEEE, MMMM d, yyyy")} at ${time}` : ""}
                      onEdit={() => go(2)}
                    />
                    <Row
                      label="Client Details"
                      value={`${details.name} · ${details.phone} · ${details.email}`}
                      onEdit={() => go(3)}
                    />
                    {details.notes ? (
                      <Row label="Notes" value={details.notes} onEdit={() => go(3)} />
                    ) : null}
                  </div>
                  <p className="flex items-center gap-2 pt-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-gold shrink-0" aria-hidden="true" />
                    Please arrive 5 minutes prior to your appointment time.
                  </p>
                </div>
              ) : null}

              {step === 5 ? (
                <div className="py-4 text-center">
                  <motion.div
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="mx-auto grid size-20 place-items-center rounded-full bg-gold/15 border-2 border-gold/40 text-gold shadow-lg"
                  >
                    <Check className="size-10 text-gold stroke-[2.5]" aria-hidden="true" />
                  </motion.div>

                  <h3 className="mt-4 font-serif text-2xl font-bold text-foreground">
                    Your Chair is Reserved!
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground max-w-md mx-auto">
                    A confirmation email has been sent to{" "}
                    <span className="text-foreground font-medium">{details.email}</span>.
                  </p>

                  <div className="mt-6 mx-auto max-w-sm rounded-xl border border-gold/40 bg-gold/5 dark:bg-gold/10 p-4">
                    <p className="text-[0.65rem] tracking-[0.2em] text-muted-foreground uppercase font-semibold">
                      Booking Reference
                    </p>
                    <div className="mt-1 flex items-center justify-center gap-2">
                      <span className="font-serif text-3xl font-bold text-gold tracking-wider">
                        {reference}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyReference}
                        className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Copy Reference"
                      >
                        {copied ? <Check className="size-4 text-green-500" /> : <Copy className="size-4" />}
                      </button>
                    </div>
                    {copied && (
                      <p className="mt-1 text-[0.68rem] text-green-500 font-medium">Copied to clipboard!</p>
                    )}
                  </div>

                  <div className="mt-6 text-left rounded-xl border border-border p-4 bg-secondary/20 text-xs space-y-2.5 max-w-md mx-auto">
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-gold" /> Location
                      </span>
                      <span className="font-medium text-foreground">
                        1430 Kona St #105, Honolulu
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <User className="size-3.5 text-gold" /> Barber
                      </span>
                      <span className="font-medium text-foreground">{barber?.name}</span>
                    </div>
                    <div className="flex items-center justify-between border-b border-border/50 pb-2">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="size-3.5 text-gold" /> Service
                      </span>
                      <span className="font-medium text-foreground">
                        {service?.name} (${service?.price})
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <CalendarIcon className="size-3.5 text-gold" /> Time
                      </span>
                      <span className="font-medium text-foreground">
                        {date ? format(date, "EEE, MMM d, yyyy") : ""} at {time}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {googleCalendarUrl && (
                      <a
                        href={googleCalendarUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border border-border hover:border-foreground/40 px-3.5 py-2 rounded-lg transition-colors"
                      >
                        <ExternalLink className="size-3.5" /> Add to Google Calendar
                      </a>
                    )}
                  </div>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border px-6 py-4 bg-card">
          {step > 0 && step < 5 ? (
            <GoldButton variant="ghost" size="sm" onClick={() => go(step - 1)}>
              <ChevronLeft className="mr-1 inline size-3.5" /> Back
            </GoldButton>
          ) : (
            <span />
          )}
          {step < 5 ? (
            <GoldButton size="md" disabled={!canAdvance || submitting} onClick={handleNext}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 inline size-4 animate-spin" /> Saving...
                </>
              ) : step === 4 ? (
                "Confirm Booking"
              ) : (
                <>
                  Continue <ChevronRight className="ml-1 inline size-3.5" />
                </>
              )}
            </GoldButton>
          ) : (
            <GoldButton
              size="md"
              className="w-full sm:w-auto"
              onClick={() => {
                closeBooking();
                setTimeout(reset, 350);
              }}
            >
              Done
            </GoldButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {error ? (
        <span className="mt-1 block text-xs text-destructive font-medium" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

function Row({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border/50 pb-2.5 last:border-b-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground font-medium">
          {label}
        </p>
        <p className="mt-0.5 text-sm break-words text-foreground font-medium">{value}</p>
      </div>
      {label !== "Location" && (
        <button
          type="button"
          onClick={onEdit}
          className="text-[0.65rem] tracking-[0.18em] text-gold uppercase hover:underline cursor-pointer font-semibold pt-0.5"
        >
          Edit
        </button>
      )}
    </div>
  );
}
