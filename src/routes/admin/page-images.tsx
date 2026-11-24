import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  AdminCard,
  AdminPageHeader,
  FieldLabel,
  ImageUploadField,
  useAdminAction,
} from "@/components/admin/AdminUi";
import { useSiteContent } from "@/components/SiteContentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { discardUpload, saveSetting } from "@/lib/admin.functions";
import { PAGE_IMAGE_SLOTS, type PageImageKey, type PageImages } from "@/lib/site-content";

export const Route = createFileRoute("/admin/page-images")({
  component: PageImagesAdmin,
});

function PageImagesAdmin() {
  const { pageImages } = useSiteContent();
  const [form, setForm] = useState<PageImages>(pageImages);
  const { run, busy } = useAdminAction();

  useEffect(() => setForm(pageImages), [pageImages]);

  const dirty = JSON.stringify(form) !== JSON.stringify(pageImages);
  const keys = Object.keys(PAGE_IMAGE_SLOTS) as PageImageKey[];

  function setSlot(key: PageImageKey, patch: Partial<PageImages[PageImageKey]>) {
    setForm((f) => ({ ...f, [key]: { ...f[key], ...patch } }));
  }

  function undo() {
    // Remove any photos uploaded on this screen that were never saved.
    for (const k of keys) {
      if (form[k].src !== pageImages[k].src) {
        void discardUpload({ data: { src: form[k].src } }).catch(() => {});
      }
    }
    setForm(pageImages);
  }

  const pages = ["Home", "About"] as const;

  return (
    <>
      <AdminPageHeader
        title="Page photos"
        description="The fixed photos on the Home and About pages. Upload a replacement, then press Save."
        actions={
          <>
            {dirty ? (
              <Button variant="ghost" onClick={undo}>
                Undo
              </Button>
            ) : null}
            <Button
              disabled={!dirty || busy}
              onClick={() =>
                void run(
                  () => saveSetting({ data: { key: "page_images", value: form } }),
                  "Page photos saved",
                )
              }
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Save changes
            </Button>
          </>
        }
      />

      {pages.map((page) => (
        <AdminCard key={page} title={`${page} page`} className="mb-6">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {keys
              .filter((k) => PAGE_IMAGE_SLOTS[k].page === page)
              .map((k) => (
                <div key={k}>
                  <p className="mb-2 text-sm font-medium">
                    {PAGE_IMAGE_SLOTS[k].label.replace(`${page} — `, "")}
                    {form[k].src !== pageImages[k].src ? (
                      <span className="ml-2 text-xs text-amber-300">unsaved</span>
                    ) : null}
                  </p>
                  <ImageUploadField
                    src={form[k].src}
                    alt={form[k].alt}
                    folder="pages"
                    onUploaded={(url) => {
                      // Replacing an unsaved upload → remove the previous one.
                      if (form[k].src !== pageImages[k].src) {
                        void discardUpload({ data: { src: form[k].src } }).catch(() => {});
                      }
                      setSlot(k, { src: url });
                    }}
                  />
                  <label className="mt-3 block">
                    <FieldLabel>Description</FieldLabel>
                    <Input
                      value={form[k].alt}
                      maxLength={200}
                      onChange={(e) => setSlot(k, { alt: e.target.value })}
                    />
                  </label>
                </div>
              ))}
          </div>
        </AdminCard>
      ))}
    </>
  );
}
