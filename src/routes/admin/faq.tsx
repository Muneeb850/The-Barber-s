import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Pencil, Plus } from "lucide-react";
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
import { deleteFaq, reorderItems, upsertFaq } from "@/lib/admin.functions";
import type { FaqItem } from "@/lib/site-content";

export const Route = createFileRoute("/admin/faq")({
  component: FaqAdmin,
});

type Draft = { id?: string; question: string; answer: string };

function FaqAdmin() {
  const { faqs } = useSiteContent();
  const [list, setList] = useState<FaqItem[]>(faqs);
  const [editing, setEditing] = useState<Draft | null>(null);
  const { run, busy } = useAdminAction();

  useEffect(() => setList(faqs), [faqs]);

  async function move(from: number, to: number) {
    const next = moveItem(list, from, to);
    setList(next);
    await run(
      () => reorderItems({ data: { table: "faqs", ids: next.map((f) => f.id) } }),
      "Order saved",
    );
  }

  return (
    <>
      <AdminPageHeader
        title="FAQ"
        description="Questions and answers at the bottom of the home page."
        actions={
          <Button onClick={() => setEditing({ question: "", answer: "" })}>
            <Plus className="size-4" /> Add question
          </Button>
        }
      />
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions — the FAQ section is hidden.</p>
      ) : (
        <ul className="space-y-2">
          {list.map((f, i) => (
            <li
              key={f.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-3"
            >
              <MoveButtons index={i} total={list.length} onMove={move} disabled={busy} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{f.question}</p>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{f.answer}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditing({ ...f })}
                aria-label="Edit question"
              >
                <Pencil className="size-4" />
              </Button>
              <ConfirmDelete
                iconOnly
                title="Delete this question?"
                description={f.question}
                onConfirm={() => run(() => deleteFaq({ data: { id: f.id } }), "Question deleted")}
                disabled={busy}
              />
            </li>
          ))}
        </ul>
      )}
      <FaqDialog draft={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function FaqDialog({ draft, onClose }: { draft: Draft | null; onClose: () => void }) {
  const [form, setForm] = useState<Draft>({ question: "", answer: "" });
  const { run, busy } = useAdminAction();
  useEffect(() => {
    if (draft) setForm(draft);
  }, [draft]);
  const valid = form.question.trim() && form.answer.trim();

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const ok = await run(
      () => upsertFaq({ data: form }),
      form.id ? "Question updated" : "Question added",
    );
    if (ok) onClose();
  }

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit question" : "Add question"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <FieldLabel>Question</FieldLabel>
            <Input
              value={form.question}
              maxLength={200}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            />
          </label>
          <label className="block">
            <FieldLabel>Answer</FieldLabel>
            <Textarea
              rows={5}
              maxLength={1500}
              value={form.answer}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
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
