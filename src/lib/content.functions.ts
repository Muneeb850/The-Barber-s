import { createServerFn } from "@tanstack/react-start";
import type { SiteContent } from "@/lib/site-content";

/** Public: the editable site content (business info, hours, services, gallery, …). */
export const getSiteContent = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteContent> => {
    const { loadSiteContent } = await import("@/lib/content.server");
    return loadSiteContent();
  },
);
