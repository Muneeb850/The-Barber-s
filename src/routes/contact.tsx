import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { Faq } from "@/components/sections/Faq";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GoldButton } from "@/components/ui/GoldButton";
import { useBooking } from "@/components/booking/BookingContext";
import { BUSINESS, LOCATIONS } from "@/lib/site-data";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Booking | Tom's Barber Honolulu" },
      {
        name: "description",
        content:
          "Visit Tom's Barber in Honolulu at 1430 Kona St #105. Call (808) 949-6081, see operating hours, or book your appointment online.",
      },
      { property: "og:title", content: "Contact & Booking | Tom's Barber Honolulu" },
      {
        property: "og:description",
        content: "Honolulu's premier grooming lounge. Call (808) 949-6081 or book online.",
      },
    ],
  }),
  component: Contact,
});

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Contact() {
  const { openBooking } = useBooking();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const loc = LOCATIONS[0];

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your name.";
    if (!emailRe.test(form.email.trim())) next.email = "Enter a valid email address.";
    if (form.message.trim().length < 10) next.message = "Please tell us a little more.";
    setErrors(next);
    if (Object.keys(next).length) return;
    toast.success("Message sent", {
      description: "Thanks — we'll reply within one business day.",
    });
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <>
      <PageHeader
        eyebrow="Visit Us"
        title="Contact & booking"
        intro="Find us on Kona Street in Honolulu. Book online any time, or send us a note."
      />
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 lg:grid-cols-2 md:px-8">
          <Reveal variant="slide-left">
            <h2 className="font-serif text-3xl sm:text-4xl">Our Lounge</h2>
            <div className="rule-gold mt-6 max-w-24" aria-hidden="true" />

            <div className="mt-8 border border-border/80 p-6 rounded-sm bg-card/60 gold-glow-hover">
              <h3 className="font-serif text-xl text-gold flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-gold" aria-hidden="true" />
                Honolulu, Hawaii
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                <a
                  href={loc.mapLink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="hover:underline font-medium"
                >
                  {loc.address}
                </a>
              </p>
              <p className="mt-6 text-[0.65rem] tracking-[0.2em] text-gold uppercase font-semibold">
                Operating Hours:
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                {loc.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day}</span>
                    <span className="text-foreground/90 font-medium">{h.hours}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 text-sm border-t border-border/60 pt-6">
              <div className="flex items-center gap-2">
                <Phone className="size-4 text-gold shrink-0" aria-hidden="true" />
                <a href={BUSINESS.phoneHref} className="hover:text-gold font-medium">
                  {BUSINESS.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="size-4 text-gold shrink-0" aria-hidden="true" />
                <a href={`mailto:${BUSINESS.email}`} className="hover:text-gold font-medium">
                  {BUSINESS.email}
                </a>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <GoldButton onClick={() => openBooking()}>Book Appointment</GoldButton>
              {BUSINESS.socials.map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noreferrer noopener">
                  <GoldButton variant="outline">{s.label}</GoldButton>
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal variant="scale-up" delay={0.15}>
            <form onSubmit={submit} className="lux-card p-8 rounded-sm gold-glow-hover" noValidate>
              <h2 className="font-serif text-3xl">Send a note</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Questions about a service, private booking or styling? We're happy to help.
              </p>
              <div className="mt-7 space-y-5">
                <label className="block">
                  <span className="eyebrow">Name</span>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="mt-1.5"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name ? (
                    <span className="mt-1 block text-xs text-destructive">{errors.name}</span>
                  ) : null}
                </label>
                <label className="block">
                  <span className="eyebrow">Email</span>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@domain.com"
                    className="mt-1.5"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email ? (
                    <span className="mt-1 block text-xs text-destructive">{errors.email}</span>
                  ) : null}
                </label>
                <label className="block">
                  <span className="eyebrow">Message</span>
                  <Textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="How can we help?"
                    className="mt-1.5 resize-none"
                    aria-invalid={!!errors.message}
                  />
                  {errors.message ? (
                    <span className="mt-1 block text-xs text-destructive">{errors.message}</span>
                  ) : null}
                </label>
                <GoldButton type="submit" size="md" className="w-full">
                  Send message
                </GoldButton>
              </div>
            </form>
          </Reveal>
        </div>
      </section>

      <section className="surface-linen border-y border-border py-24 md:py-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <SectionHeading eyebrow="Find us" title="Interactive map" />

          <Reveal
            delay={0.1}
            variant="scale-up"
            className="mt-12 overflow-hidden border border-border shadow-[var(--shadow-soft)] rounded-sm"
          >
            <iframe
              title={`Map showing ${BUSINESS.name} at ${loc.address}`}
              src={loc.mapEmbed}
              className="h-[420px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </section>

      <Faq />
    </>
  );
}
