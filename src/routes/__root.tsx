import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { BookingProvider } from "@/components/booking/BookingContext";
import { ThemeProvider } from "@/components/ThemeContext";
import { BookingWizard } from "@/components/booking/BookingWizard";
import { FloatingBookButton } from "@/components/FloatingBookButton";
import { AvailabilityTicker } from "@/components/sections/AvailabilityTicker";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "The Barbers | Premium Grooming Lounge in Honolulu, HI" },
      {
        name: "description",
        content:
          "The Barbers is a premier barbershop and grooming lounge in Honolulu, HI (1430 Kona St). Precision cuts, beard sculpting and hot towel straight shaves.",
      },
      { name: "author", content: "The Barbers" },
      { property: "og:title", content: "The Barbers | Premium Grooming Lounge in Honolulu, HI" },
      {
        property: "og:description",
        content:
          "Precision cuts, beard sculpting and hot towel shaves at 1430 Kona St, Honolulu, HI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap",
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function PageTransitionWrapper({ children }: { children: ReactNode }) {
  const routerState = useRouterState();
  const reduce = useReducedMotion();

  return (
    <motion.div
      key={routerState.location.pathname}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BookingProvider>
          <AvailabilityTicker />
          <SiteNav />
          <main>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <PageTransitionWrapper>
              <Outlet />
            </PageTransitionWrapper>
          </main>
          <SiteFooter />
          <FloatingBookButton />
          <BookingWizard />
          <Toaster position="bottom-center" />
        </BookingProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
