import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2, Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AdminPageHeader,
  ConfirmDelete,
  FieldLabel,
  ImageUploadField,
  moveItem,
  useAdminAction,
} from "@/components/admin/AdminUi";
import { useSiteContent } from "@/components/SiteContentContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  deleteGalleryImage,
  discardUpload,
  reorderItems,
  upsertGalleryImage,
} from "@/lib/admin.functions";
import type { GalleryItem } from "@/lib/site-content";

export const Route = createFileRoute("/admin/gallery")({
  component: GalleryAdmin,
});

type Draft = { id?: string; src: string; alt: string; span: "tall" | "wide"; originalSrc?: string };

function GalleryAdmin() {
  const { gallery } = useSiteContent();
  const [list, setList] = useState<GalleryItem[]>(gallery);
  const [editing, setEditing] = useState<Draft | null>(null);
  const { run, busy } = useAdminAction();

  useEffect(() => setList(gallery), [gallery]);

  async function move(from: number, to: number) {
    const next = moveItem(list, from, to);
    setList(next);
    await run(
      () => reorderItems({ data: { table: "gallery_images", ids: next.map((g) => g.id) } }),
      "Order saved",
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Gallery"
        description="Photos on the Gallery page and the “Fresh from the chair” strip on the home page (first 12). Use the arrows to change the order."
        actions={
          <Button onClick={() => setEditing({ src: "", alt: "", span: "tall" })}>
            <Plus className="size-4" /> Add photo
          </Button>
        }
      />

      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          The gallery is empty. Add your first photo.
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {list.map((g, i) => (
            <li key={g.id} className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="relative aspect-square bg-muted/30">
                <img src={g.src} alt={g.alt} className="size-full object-cover" loading="lazy" />
                <span className="absolute top-2 left-2 rounded bg-background/80 px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                  #{i + 1} · {g.span === "tall" ? "Portrait" : "Landscape"}
                </span>
              </div>
              <div className="p-2">
                <p
                  className="line-clamp-2 min-h-[2.5em] text-xs text-muted-foreground"
                  title={g.alt}
                >
                  {g.alt || "No description"}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={busy || i === 0}
                      onClick={() => void move(i, i - 1)}
                      aria-label="Move earlier"
                    >
                      <ArrowLeft className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      disabled={busy || i === list.length - 1}
                      onClick={() => void move(i, i + 1)}
                      aria-label="Move later"
                    >
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() =>
                        setEditing({
                          id: g.id,
                          src: g.src,
                          alt: g.alt,
                          span: g.span,
                          originalSrc: g.src,
                        })
                      }
                      aria-label="Edit photo"
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <ConfirmDelete
                      iconOnly
                      title="Delete this photo?"
                      description="It will be removed from the website straight away."
                      onConfirm={() =>
                        run(() => deleteGalleryImage({ data: { id: g.id } }), "Photo deleted")
                      }
                      disabled={busy}
                    />
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PhotoDialog draft={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function PhotoDialog({ draft, onClose }: { draft: Draft | null; onClose: () => void }) {
  const [form, setForm] = useState<Draft>({ src: "", alt: "", span: "tall" });
  const { run, busy } = useAdminAction();

  useEffect(() => {
    if (draft) setForm(draft);
  }, [draft]);

  // Uploaded in this dialog but not saved → clean it up from storage.
  const unsavedUpload = form.src && form.src !== form.originalSrc ? form.src : null;

  function cancel() {
    if (unsavedUpload) void discardUpload({ data: { src: unsavedUpload } }).catch(() => {});
    onClose();
  }

  function onUploaded(url: string) {
    if (unsavedUpload) void discardUpload({ data: { src: unsavedUpload } }).catch(() => {});
    setForm((f) => ({ ...f, src: url }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.src) return;
    const ok = await run(
      () =>
        upsertGalleryImage({
          data: { id: form.id, src: form.src, alt: form.alt, span: form.span },
        }),
      form.id ? "Photo updated" : "Photo added",
    );
    if (ok) onClose();
  }

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && cancel()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit photo" : "Add photo"}</DialogTitle>
          <DialogDescription>
            JPG, PNG or WebP. Large photos are resized automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <ImageUploadField
            src={form.src || null}
            alt={form.alt}
            folder="gallery"
            onUploaded={onUploaded}
            aspect={form.span === "tall" ? "aspect-[3/4]" : "aspect-[4/3]"}
          />
          <label className="block">
            <FieldLabel hint="helps Google & screen readers">Short description</FieldLabel>
            <Input
              value={form.alt}
              maxLength={200}
              placeholder="e.g. Skin fade with hard part"
              onChange={(e) => setForm((f) => ({ ...f, alt: e.target.value }))}
            />
          </label>
          <div>
            <FieldLabel>Shape on gallery page</FieldLabel>
            <div className="flex gap-2">
              {(
                [
                  ["tall", "Portrait (tall)"],
                  ["wide", "Landscape (wide)"],
                ] as const
              ).map(([v, l]) => (
                <Button
                  key={v}
                  type="button"
                  size="sm"
                  variant={form.span === v ? "default" : "outline"}
                  onClick={() => setForm((f) => ({ ...f, span: v }))}
                >
                  {l}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={cancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={!form.src || busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
