import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarCheck,
  Clock,
  ExternalLink,
  HelpCircle,
  Images,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquareQuote,
  Scissors,
  Settings,
  ShieldAlert,
  Store,
  UserCog,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { AdminAuthProvider, useAdminAuth } from "@/components/admin/AdminAuth";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/components/SiteContentContext";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  // The session lives in the browser, so the dashboard is rendered client-side only.
  ssr: false,
  head: () => ({
    meta: [{ title: "Admin · Tom's Barber" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminRoot,
});

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/reset-password"];

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/hours", label: "Hours & Closures", icon: Clock },
  { to: "/admin/services", label: "Services & Prices", icon: Scissors },
  { to: "/admin/gallery", label: "Gallery", icon: Images },
  { to: "/admin/page-images", label: "Page Photos", icon: Store },
  { to: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { to: "/admin/faq", label: "FAQ", icon: HelpCircle },
  { to: "/admin/settings", label: "Business & Settings", icon: Settings },
  { to: "/admin/account", label: "My Account", icon: UserCog },
] as const;

function AdminRoot() {
  return (
    <AdminAuthProvider>
      <AdminGate />
    </AdminAuthProvider>
  );
}

function AdminGate() {
  const auth = useAdminAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isPublic = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isPublic && auth.status === "signed-out") {
      void navigate({ to: "/admin/login", replace: true });
    }
  }, [auth.status, isPublic, navigate]);

  if (isPublic) return <Outlet />;

  if (auth.status === "loading" || auth.status === "signed-out") {
    return (
      <div className="grid min-h-svh place-items-center bg-background">
        <Loader2 className="size-7 animate-spin text-gold" aria-label="Loading" />
      </div>
    );
  }

  if (auth.status === "not-admin") {
    return (
      <div className="grid min-h-svh place-items-center bg-background px-5">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto size-10 text-red-400" />
          <h1 className="mt-4 font-serif text-2xl">Access denied</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {auth.email ?? "This account"} is not allowed to use the admin dashboard.
          </p>
          <Button className="mt-6" variant="outline" onClick={() => void auth.signOut()}>
            Sign out
          </Button>
        </div>
      </div>
    );
  }

  return <AdminShell />;
}

function AdminShell() {
  const auth = useAdminAuth();
  const { business, source } = useSiteContent();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const email = "email" in auth ? auth.email : null;

  useEffect(() => setMobileOpen(false), [pathname]);

  const nav = (
    <nav className="flex flex-col gap-0.5" aria-label="Admin">
      {NAV.map((item) => {
        const active =
          "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-gold/15 text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <item.icon className={cn("size-4", active ? "text-gold" : "")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const sidebarFooter = (
    <div className="space-y-2 border-t border-border pt-4">
      <a
        href="/"
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 px-3 text-xs text-muted-foreground hover:text-foreground"
      >
        <ExternalLink className="size-3.5" /> View website
      </a>
      <p className="truncate px-3 text-xs text-muted-foreground" title={email ?? ""}>
        {email}
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => void auth.signOut()}
      >
        <LogOut className="size-4" /> Sign out
      </Button>
    </div>
  );

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <p className="font-serif text-lg">{business.name} · Admin</p>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </header>
      {mobileOpen ? (
        <div className="fixed inset-x-0 top-[57px] bottom-0 z-30 overflow-y-auto border-b border-border bg-background p-4 lg:hidden">
          {nav}
          <div className="mt-4">{sidebarFooter}</div>
        </div>
      ) : null}

      <div className="flex">
        <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col justify-between border-r border-border p-4 lg:flex">
          <div>
            <p className="px-3 pb-5 font-serif text-xl">
              {business.name}
              <span className="block text-[0.65rem] tracking-[0.22em] text-gold uppercase font-sans">
                Admin Dashboard
              </span>
            </p>
            {nav}
          </div>
          {sidebarFooter}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">
          {source === "fallback" ? (
            <div className="mb-6 rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              The database isn't connected or set up yet, so the site is showing built-in default
              content. Changes can't be saved until the Supabase setup is complete.
            </div>
          ) : null}
          <div className="mx-auto max-w-5xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
