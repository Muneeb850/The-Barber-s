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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { deleteService, reorderItems, upsertService } from "@/lib/admin.functions";
import type { ServiceItem } from "@/lib/site-content";

export const Route = createFileRoute("/admin/services")({
  component: ServicesPage,
});

type Draft = Omit<ServiceItem, "id" | "sortOrder"> & { id?: string };

const EMPTY: Draft = {
  name: "",
  description: "",
  price: 30,
  duration: 30,
  category: "men",
  subtitle: "",
  tag: "",
  isActive: true,
};

function ServicesPage() {
  const { services } = useSiteContent();
  const [list, setList] = useState(services);
  const [editing, setEditing] = useState<Draft | null>(null);
  const { run, busy } = useAdminAction();

  useEffect(() => setList(services), [services]);

  async function move(from: number, to: number) {
    const next = moveItem(list, from, to);
    setList(next);
    await run(
      () => reorderItems({ data: { table: "services", ids: next.map((s) => s.id) } }),
      "Order saved",
    );
  }

  async function toggle(s: ServiceItem, isActive: boolean) {
    await run(
      () => upsertService({ data: { ...s, isActive } }),
      isActive ? `${s.name} is now visible` : `${s.name} is hidden from the website`,
    );
  }

  const groups: { key: ServiceItem["category"]; label: string }[] = [
    { key: "men", label: "Men's services" },
    { key: "ladies", label: "Ladies' services" },
  ];

  return (
    <>
      <AdminPageHeader
        title="Services & prices"
        description="What customers see on the Services page and can choose when booking. Hide a service to take it off the website without deleting it."
        actions={
          <Button onClick={() => setEditing({ ...EMPTY })}>
            <Plus className="size-4" /> Add service
          </Button>
        }
      />

      {groups.map((g) => {
        const items = list
          .map((s, index) => ({ s, index }))
          .filter(({ s }) => s.category === g.key);
        return (
          <section key={g.key} className="mb-8">
            <h2 className="mb-3 text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              {g.label}
            </h2>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground">None yet.</p>
            ) : (
              <ul className="space-y-2">
                {items.map(({ s, index }) => (
                  <li
                    key={s.id}
                    className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3 ${
                      s.isActive ? "" : "opacity-55"
                    }`}
                  >
                    <MoveButtons index={index} total={list.length} onMove={move} disabled={busy} />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {s.name}
                        {s.tag ? (
                          <span className="ml-2 rounded border border-gold/40 px-1.5 py-0.5 text-[0.6rem] text-gold uppercase">
                            {s.tag}
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        ${s.price} · {s.duration} min
                        {s.description ? ` · ${s.description}` : ""}
                      </p>
                    </div>
                    <label className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
                      <Switch
                        checked={s.isActive}
                        onCheckedChange={(v) => void toggle(s, v)}
                        disabled={busy}
                        aria-label="Show on website"
                      />
                      {s.isActive ? "Visible" : "Hidden"}
                    </label>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditing({ ...s })}
                      aria-label={`Edit ${s.name}`}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <ConfirmDelete
                      iconOnly
                      title={`Delete "${s.name}"?`}
                      description="It will be removed from the website and booking form. Past bookings keep their details. Tip: you can hide it instead."
                      onConfirm={() =>
                        run(() => deleteService({ data: { id: s.id } }), "Service deleted")
                      }
                      disabled={busy}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}

      <ServiceDialog draft={editing} onClose={() => setEditing(null)} />
    </>
  );
}

function ServiceDialog({ draft, onClose }: { draft: Draft | null; onClose: () => void }) {
  const [form, setForm] = useState<Draft>(EMPTY);
  const { run, busy } = useAdminAction();

  useEffect(() => {
    if (draft) setForm(draft);
  }, [draft]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setForm((f) => ({ ...f, [k]: v }));
  const valid =
    form.name.trim().length > 0 &&
    Number.isFinite(form.price) &&
    form.price >= 0 &&
    form.duration >= 5;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const ok = await run(
      () => upsertService({ data: form }),
      form.id ? "Service updated" : "Service added",
    );
    if (ok) onClose();
  }

  return (
    <Dialog open={!!draft} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit service" : "Add service"}</DialogTitle>
          <DialogDescription>Prices are in US dollars.</DialogDescription>
        </DialogHeader>
        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <FieldLabel>Name</FieldLabel>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={120}
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <FieldLabel>Price ($)</FieldLabel>
              <Input
                type="number"
                min={0}
                max={10000}
                value={form.price}
                onChange={(e) => set("price", Math.round(Number(e.target.value)))}
              />
            </label>
            <label className="block">
              <FieldLabel>Minutes</FieldLabel>
              <Input
                type="number"
                min={5}
                max={600}
                step={5}
                value={form.duration}
                onChange={(e) => set("duration", Math.round(Number(e.target.value)))}
              />
            </label>
            <label className="block">
              <FieldLabel>Category</FieldLabel>
              <Select
                value={form.category}
                onValueChange={(v) => set("category", v as Draft["category"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men</SelectItem>
                  <SelectItem value="ladies">Ladies</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>
          <label className="block">
            <FieldLabel>Description</FieldLabel>
            <Textarea
              rows={3}
              value={form.description}
              maxLength={600}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <FieldLabel hint="optional">Badge</FieldLabel>
              <Input
                placeholder="e.g. Popular"
                value={form.tag}
                maxLength={40}
                onChange={(e) => set("tag", e.target.value)}
              />
            </label>
            <label className="block">
              <FieldLabel hint="optional">Subtitle</FieldLabel>
              <Input
                placeholder="e.g. Haircut, Beard, Shampoo"
                value={form.subtitle}
                maxLength={120}
                onChange={(e) => set("subtitle", e.target.value)}
              />
            </label>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
            Show on website
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
