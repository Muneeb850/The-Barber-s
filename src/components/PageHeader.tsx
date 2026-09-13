import { Reveal } from "@/components/Reveal";

export function PageHeader({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <header className="relative overflow-hidden surface-linen pt-36 pb-20 md:pt-44 md:pb-28">
      <div
        className="pointer-events-none absolute -top-16 right-10 size-72 rounded-full bg-gold/10 blur-3xl animate-float-slow"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-5 font-serif text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <div className="rule-gold mx-auto mt-7 max-w-24" aria-hidden="true" />
          {intro ? (
            <p className="mt-7 text-base leading-relaxed text-muted-foreground">{intro}</p>
          ) : null}
        </Reveal>
      </div>
    </header>
  );
}
