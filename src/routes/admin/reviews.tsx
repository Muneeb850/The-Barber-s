import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AdminPageHeader,
  ConfirmDelete,
  FieldLabel,
  MoveButtons,
  moveItem,
  useAdminAction,
} from "@/components/admin/AdminUi";
import { useSiteContent } from "@/components/SiteContentContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { deleteTestimonial, reorderItems, upsertTestimonial } from "@/lib/admin.functions";
import type { TestimonialItem } from "@/lib/site-content";

export const Route = createFileRoute("/admin/reviews")({
  component: ReviewsAdmin,
});

type Draft = { id?: string; name: string; rating: number; quote: string };

function ReviewsAdmin() {
  const { testimonials } = useSiteContent();
  const [list, setList] = useState<TestimonialItem[]>(testimonials);
  const [editing, setEditing] = useState<Draft | null>(null);
  const { run, busy } = useAdminAction();

  useEffect(() => setList(testimonials), [testimonials]);

  async function move(from: number, to: number) {
    const next = moveItem(list, from, to);
    setList(next);
    await run(
      () => reorderItems({ data: { table: "testimonials", ids: next.map((t) => t.id) } }),
      "Order saved",
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Reviews"
        description="Customer quotes in the scrolling “Kind words from the chair” section on the home page."
        actions={
          <Button onClick={() => setEditing({ name: "", rating: 5, quote: "" })}>
            <Plus className="size-4" /> Add review
          </Button>
        }
      />
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No reviews — the section is hidden on the website.
        </p>
      ) : (
        <ul className="space-y-2">
          {list.map((t, i) => (
            <li
              key={t.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
            >
              <MoveButtons index={i} total={list.length} onMove={move} disabled={busy} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium">
                  {t.name}
                  <span className="flex" aria-label={`${t.rating} stars`}>
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star key={s} className="size-3 fill-gold text-gold" />
                    ))}
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">“{t.quote}”</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditing({ ...t })}
                aria-label="Edit review"
              >
                <Pencil className="size-4" />
              </Button>
              <ConfirmDelete
                iconOnly
                title="Delete this review?"
                description={`Review by ${t.name} will be removed from the website.`}
                onConfirm={() =>
                  run(() => deleteTestimonial({ data: { id: t.id } }), "Review deleted")
                }
                disabled={busy}
              />
            </li>
          ))}
        </ul>
      )}
      <ReviewDialog draft={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function ReviewDialog({ draft, onClose }: { draft: Draft | null; onClose: () => void }) {
  const [form, setForm] = useState<Draft>({ name: "", rating: 5, quote: "" });
  const { run, busy } = useAdminAction();
  useEffect(() => {
    if (draft) setForm(draft);
  }, [draft]);
  const valid = form.name.trim() && form.quote.trim();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const ok = await run(
      () => upsertTestimonial({ data: form }),
      form.id ? "Review updated" : "Review added",
    );
    if (ok) onClose();
  }

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit review" : "Add review"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <FieldLabel hint="e.g. Marcus H.">Customer name</FieldLabel>
            <Input
              value={form.name}
              maxLength={80}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </label>
          <div>
            <FieldLabel>Rating</FieldLabel>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, rating: n }))}
                  aria-label={`${n} stars`}
                  className="p-1"
                >
                  <Star
                    className={`size-6 ${n <= form.rating ? "fill-gold text-gold" : "text-muted-foreground"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <FieldLabel>Review</FieldLabel>
            <Textarea
              rows={4}
              maxLength={600}
              value={form.quote}
              onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
            />
          </label>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
