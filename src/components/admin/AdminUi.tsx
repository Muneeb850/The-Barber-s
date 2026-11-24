import { useRouter } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ACCEPT_ATTR, uploadSiteImage } from "@/lib/image-upload";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-lg border border-border bg-card p-5 sm:p-6", className)}>
      {title ? <h2 className="font-serif text-xl">{title}</h2> : null}
      {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      <div className={title || description ? "mt-5" : ""}>{children}</div>
    </section>
  );
}

/**
 * Run an admin mutation with a toast, then refresh the site content so the
 * dashboard and the public pages show the change straight away.
 */
export function useAdminAction() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const run = useCallback(
    async <T,>(fn: () => Promise<T>, success: string): Promise<T | undefined> => {
      setBusy(true);
      try {
        const out = await fn();
        await router.invalidate();
        toast.success(success);
        return out;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(msg.replace(/^Error:\s*/, "") || "Something went wrong");
        return undefined;
      } finally {
        setBusy(false);
      }
    },
    [router],
  );

  return { run, busy };
}

export function ConfirmDelete({
  title,
  description,
  onConfirm,
  label = "Delete",
  iconOnly = false,
  disabled,
}: {
  title: string;
  description: string;
  onConfirm: () => unknown;
  label?: string;
  iconOnly?: boolean;
  disabled?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size={iconOnly ? "icon" : "sm"}
          disabled={disabled}
          className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
          aria-label={label}
        >
          <Trash2 className="size-4" />
          {iconOnly ? null : label}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 text-white hover:bg-red-700"
            onClick={() => void onConfirm()}
          >
            {label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function MoveButtons({
  index,
  total,
  onMove,
  disabled,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        disabled={disabled || index === 0}
        onClick={() => onMove(index, index - 1)}
        aria-label="Move up"
      >
        <ArrowUp className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7"
        disabled={disabled || index === total - 1}
        onClick={() => onMove(index, index + 1)}
        aria-label="Move down"
      >
        <ArrowDown className="size-3.5" />
      </Button>
    </div>
  );
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Image preview + "Upload new photo" button. Calls onUploaded with the public URL. */
export function ImageUploadField({
  src,
  alt,
  folder,
  onUploaded,
  aspect = "aspect-[4/3]",
}: {
  src: string | null;
  alt: string;
  folder: "gallery" | "pages";
  onUploaded: (url: string) => void;
  aspect?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadSiteImage(file, folder);
      onUploaded(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative overflow-hidden rounded-md border border-border bg-muted/30",
          aspect,
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center text-sm text-muted-foreground">
            No image yet
          </div>
        )}
        {uploading ? (
          <div className="absolute inset-0 grid place-items-center bg-background/70">
            <Loader2 className="size-6 animate-spin text-gold" />
          </div>
        ) : null}
      </div>
      <input
        ref={input}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={(e) => void onFile(e.target.files?.[0])}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={uploading}
        onClick={() => input.current?.click()}
      >
        <ImagePlus className="size-4" />
        {src ? "Replace photo" : "Upload photo"}
      </Button>
    </div>
  );
}

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 block text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
      {hint ? <span className="ml-1 normal-case tracking-normal opacity-70">({hint})</span> : null}
    </span>
  );
}
