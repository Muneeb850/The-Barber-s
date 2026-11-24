import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader, FieldLabel, useAdminAction } from "@/components/admin/AdminUi";
import { useSiteContent } from "@/components/SiteContentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { saveSetting } from "@/lib/admin.functions";
import type { BannerSettings, BookingSettings, BusinessInfo } from "@/lib/site-content";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function SettingsPage() {
  return (
    <>
      <AdminPageHeader
        title="Business & settings"
        description="Contact details shown across the website, the top banner and online booking."
      />
      <div className="space-y-6">
        <BusinessForm />
        <div className="grid gap-6 lg:grid-cols-2">
          <BannerForm />
          <BookingForm />
        </div>
      </div>
    </>
  );
}

function BusinessForm() {
  const { business } = useSiteContent();
  const [form, setForm] = useState<BusinessInfo>(business);
  const { run, busy } = useAdminAction();
  useEffect(() => setForm(business), [business]);

  const set = <K extends keyof BusinessInfo>(k: K, v: BusinessInfo[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const dirty = JSON.stringify(form) !== JSON.stringify(business);

  const errors: string[] = [];
  if (!form.name.trim()) errors.push("Business name is required.");
  if (form.phone.replace(/\D/g, "").length < 7) errors.push("Enter a valid phone number.");
  if (!emailRe.test(form.email.trim())) errors.push("Enter a valid email.");
  if (!form.street.trim() || !form.city.trim()) errors.push("Address is required.");
  form.socials.forEach((s, i) => {
    if (!s.label.trim() || !/^https?:\/\/\S+\.\S+/.test(s.href.trim())) {
      errors.push(`Social link #${i + 1} needs a name and a full link starting with https://`);
    }
  });

  return (
    <AdminCard title="Business details">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <FieldLabel>Business name</FieldLabel>
          <Input value={form.name} maxLength={80} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Tagline</FieldLabel>
          <Input
            value={form.tagline}
            maxLength={160}
            onChange={(e) => set("tagline", e.target.value)}
          />
        </label>
        <label className="block">
          <FieldLabel>Phone</FieldLabel>
          <Input value={form.phone} maxLength={30} onChange={(e) => set("phone", e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel>Public email</FieldLabel>
          <Input
            type="email"
            value={form.email}
            maxLength={255}
            onChange={(e) => set("email", e.target.value)}
          />
        </label>
        <label className="block">
          <FieldLabel>Street address</FieldLabel>
          <Input
            value={form.street}
            maxLength={160}
            onChange={(e) => set("street", e.target.value)}
          />
        </label>
        <label className="block">
          <FieldLabel hint="city, state, ZIP">City</FieldLabel>
          <Input value={form.city} maxLength={160} onChange={(e) => set("city", e.target.value)} />
        </label>
        <label className="block">
          <FieldLabel hint="shown above the Instagram photo strip">Instagram handle</FieldLabel>
          <Input
            value={form.instagramHandle}
            maxLength={60}
            placeholder="@tomsbarber"
            onChange={(e) => set("instagramHandle", e.target.value)}
          />
        </label>
      </div>

      <div className="mt-6">
        <FieldLabel>Social media links</FieldLabel>
        <ul className="space-y-2">
          {form.socials.map((s, i) => (
            <li key={i} className="flex gap-2">
              <Input
                className="w-36"
                placeholder="Instagram"
                value={s.label}
                maxLength={30}
                onChange={(e) =>
                  set(
                    "socials",
                    form.socials.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                  )
                }
              />
              <Input
                placeholder="https://instagram.com/yourpage"
                value={s.href}
                maxLength={300}
                onChange={(e) =>
                  set(
                    "socials",
                    form.socials.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)),
                  )
                }
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  set(
                    "socials",
                    form.socials.filter((_, j) => j !== i),
                  )
                }
                aria-label="Remove link"
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
        {form.socials.length < 8 ? (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => set("socials", [...form.socials, { label: "", href: "https://" }])}
          >
            <Plus className="size-4" /> Add link
          </Button>
        ) : null}
      </div>

      {dirty && errors.length ? (
        <ul className="mt-4 space-y-0.5 text-sm text-red-400">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex gap-2">
        <Button
          disabled={!dirty || errors.length > 0 || busy}
          onClick={() =>
            void run(
              () =>
                saveSetting({
                  data: {
                    key: "business",
                    value: {
                      ...form,
                      socials: form.socials.map((s) => ({
                        label: s.label.trim(),
                        href: s.href.trim(),
                      })),
                    },
                  },
                }),
              "Business details saved",
            )
          }
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : null}
          Save details
        </Button>
        {dirty ? (
          <Button variant="ghost" onClick={() => setForm(business)}>
            Undo
          </Button>
        ) : null}
      </div>
    </AdminCard>
  );
}

function BannerForm() {
  const { banner } = useSiteContent();
  const [form, setForm] = useState<BannerSettings>(banner);
  const { run, busy } = useAdminAction();
  useEffect(() => setForm(banner), [banner]);
  const dirty = JSON.stringify(form) !== JSON.stringify(banner);

  return (
    <AdminCard
      title="Top banner"
      description="The thin announcement bar at the very top of the website."
    >
      <label className="flex items-center gap-3 text-sm">
        <Switch
          checked={form.enabled}
          onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
        />
        {form.enabled ? "Showing" : "Hidden"}
      </label>
      <label className="mt-4 block">
        <FieldLabel>Message</FieldLabel>
        <Input
          value={form.text}
          maxLength={160}
          placeholder="e.g. Closed Thanksgiving Day · Open again Friday"
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
        />
      </label>
      <Button
        className="mt-4"
        disabled={!dirty || busy}
        onClick={() =>
          void run(
            () =>
              saveSetting({ data: { key: "banner", value: { ...form, text: form.text.trim() } } }),
            "Banner saved",
          )
        }
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        Save banner
      </Button>
    </AdminCard>
  );
}

function BookingForm() {
  const { booking } = useSiteContent();
  const [form, setForm] = useState<BookingSettings>(booking);
  const { run, busy } = useAdminAction();
  useEffect(() => setForm(booking), [booking]);
  const dirty = JSON.stringify(form) !== JSON.stringify(booking);

  return (
    <AdminCard title="Online booking">
      <label className="flex items-center gap-3 text-sm">
        <Switch
          checked={form.enabled}
          onCheckedChange={(v) => setForm((f) => ({ ...f, enabled: v }))}
        />
        {form.enabled ? "Customers can book online" : "Paused — customers are asked to call"}
      </label>
      <label className="mt-4 block">
        <FieldLabel>Time between appointment slots</FieldLabel>
        <Select
          value={String(form.slotInterval)}
          onValueChange={(v) => setForm((f) => ({ ...f, slotInterval: Number(v) }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[15, 20, 30, 45, 60].map((m) => (
              <SelectItem key={m} value={String(m)}>
                Every {m} minutes
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
      <Button
        className="mt-4"
        disabled={!dirty || busy}
        onClick={() =>
          void run(
            () => saveSetting({ data: { key: "booking", value: form } }),
            "Booking settings saved",
          )
        }
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : null}
        Save
      </Button>
    </AdminCard>
  );
}
