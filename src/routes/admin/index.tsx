import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, Clock, DollarSign, Loader2, Phone, Users } from "lucide-react";
import { AdminCard, AdminPageHeader } from "@/components/admin/AdminUi";
import {
  StatusBadge,
  cleanNotes,
  money,
  sortBookings,
  type BookingRow,
} from "@/components/admin/bookings-shared";
import { useSiteContent } from "@/components/SiteContentContext";
import { listBookings } from "@/lib/admin.functions";
import {
  addDaysIso,
  formatDayHours,
  hoursForDate,
  isDateClosed,
  prettyDate,
  shopNow,
} from "@/lib/site-content";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

function Overview() {
  const content = useSiteContent();
  const today = shopNow().date;
  const weekEnd = addDaysIso(today, 6);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "bookings", "overview", today],
    queryFn: () => listBookings({ data: { from: today, to: weekEnd } }),
    refetchInterval: 60_000,
  });

  const rows = sortBookings((data ?? []) as BookingRow[]);
  const active = rows.filter((b) => b.status !== "cancelled");
  const todays = active.filter((b) => b.booking_date === today);
  const revenue = active.reduce((sum, b) => sum + b.price_cents, 0);
  const closedToday = isDateClosed(content, today);
  const todayHours = hoursForDate(content.hours, today);

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description={`Today is ${prettyDate(today, { weekday: "long", month: "long" })} (Honolulu time).`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={CalendarCheck} label="Bookings today" value={isLoading ? "…" : todays.length} />
        <Stat icon={Users} label="Next 7 days" value={isLoading ? "…" : active.length} />
        <Stat
          icon={DollarSign}
          label="Expected (7 days)"
          value={isLoading ? "…" : money(revenue)}
        />
        <Stat
          icon={Clock}
          label="Today's hours"
          value={
            closedToday
              ? "Closed"
              : todayHours
                ? formatDayHours(todayHours).replace(" HST", "")
                : "—"
          }
        />
      </div>

      <AdminCard title="Today's appointments" className="mt-6">
        {isLoading ? (
          <Loader2 className="size-5 animate-spin text-gold" />
        ) : error ? (
          <p className="text-sm text-red-400">{(error as Error).message}</p>
        ) : todays.length === 0 ? (
          <p className="text-sm text-muted-foreground">No appointments today.</p>
        ) : (
          <ul className="divide-y divide-border">
            {todays.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3">
                <span className="w-20 font-medium tabular-nums">{b.booking_time}</span>
                <span className="min-w-0 flex-1">
                  <span className="font-medium">{b.customer_name}</span>
                  <span className="text-muted-foreground"> · {b.service_name}</span>
                  {cleanNotes(b.notes) ? (
                    <span className="block text-xs text-muted-foreground">
                      “{cleanNotes(b.notes)}”
                    </span>
                  ) : null}
                </span>
                <a
                  href={`tel:${b.customer_phone}`}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Phone className="size-3.5" />
                  {b.customer_phone}
                </a>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
        <Link to="/admin/bookings" className="mt-4 inline-block text-sm text-gold hover:underline">
          View all bookings →
        </Link>
      </AdminCard>

      <AdminCard title="Coming up this week" className="mt-6">
        {active.filter((b) => b.booking_date !== today).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nothing booked yet for the rest of the week.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {active
              .filter((b) => b.booking_date !== today)
              .slice(0, 12)
              .map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-x-4 py-2.5 text-sm">
                  <span className="w-28 text-muted-foreground">{prettyDate(b.booking_date)}</span>
                  <span className="w-20 tabular-nums">{b.booking_time}</span>
                  <span className="flex-1">
                    {b.customer_name}
                    <span className="text-muted-foreground"> · {b.service_name}</span>
                  </span>
                </li>
              ))}
          </ul>
        )}
      </AdminCard>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs tracking-wide uppercase">{label}</span>
        <Icon className="size-4 text-gold" />
      </div>
      <p className="mt-3 font-serif text-3xl tabular-nums">{value}</p>
    </div>
  );
}
