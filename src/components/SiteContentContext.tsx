import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_CONTENT, type SiteContent } from "@/lib/site-content";

const SiteContentContext = createContext<SiteContent>(DEFAULT_CONTENT);

export function SiteContentProvider({
  value,
  children,
}: {
  value: SiteContent | undefined;
  children: ReactNode;
}) {
  return (
    <SiteContentContext.Provider value={value ?? DEFAULT_CONTENT}>
      {children}
    </SiteContentContext.Provider>
  );
}

/** Live, admin-editable site content. Falls back to built-in defaults. */
export function useSiteContent() {
  return useContext(SiteContentContext);
}

/** Only services that are switched on in the admin dashboard. */
export function useActiveServices() {
  return useSiteContent().services.filter((s) => s.isActive);
}
