/**
 * Browser-side image upload for the admin dashboard.
 * Resizes large photos (max 2000px) and converts them to WebP before uploading
 * to the public "site-images" Supabase Storage bucket. Storage RLS only lets
 * admins upload, so this fails for anyone else even if called directly.
 */
import { supabase } from "@/integrations/supabase/client";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // must match bucket limit
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const ACCEPT_ATTR = ACCEPTED.join(",");
const MAX_DIMENSION = 2000;

async function toWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file; // browser can't decode (e.g. some AVIFs) → upload original
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.85));
  return blob && blob.size < file.size ? blob : file;
}

export async function uploadSiteImage(file: File, folder: "gallery" | "pages"): Promise<string> {
  if (!ACCEPTED.includes(file.type)) {
    throw new Error("Please choose a JPG, PNG, WebP or AVIF image.");
  }
  const body = await toWebp(file);
  if (body.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large (max 5 MB). Please choose a smaller photo.");
  }
  const ext = body.type === "image/webp" ? "webp" : (file.name.split(".").pop() ?? "jpg");
  const path = `${folder}/${crypto.randomUUID()}.${ext.toLowerCase()}`;

  const { error } = await supabase.storage.from("site-images").upload(path, body, {
    contentType: body.type || file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);

  return supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}
