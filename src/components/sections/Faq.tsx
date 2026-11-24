import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { useSiteContent } from "@/components/SiteContentContext";

export function Faq() {
  const { faqs } = useSiteContent();
  if (faqs.length === 0) return null;
  return (
    <section className="py-24 md:py-32">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <SectionHeading eyebrow="Good to know" title="Frequently asked" />
        <Reveal delay={0.1} className="mt-12">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((f, i) => (
              <AccordionItem key={f.id} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-serif text-lg hover:text-gold hover:no-underline">
                  {f.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {f.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
