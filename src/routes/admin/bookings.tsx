import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Phone, RefreshCw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader, ConfirmDelete } from "@/components/admin/AdminUi";
import {
  STATUS_LABEL,
  StatusBadge,
  cleanNotes,
  money,
  sortBookings,
  type BookingRow,
  type BookingStatus,
} from "@/components/admin/bookings-shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteBooking, listBookings, updateBookingStatus } from "@/lib/admin.functions";
import { addDaysIso, prettyDate, shopNow } from "@/lib/site-content";

export const Route = createFileRoute("/admin/bookings")({
  component: BookingsPage,
});

type Range = "upcoming" | "today" | "past" | "all";

function BookingsPage() {
  const qc = useQueryClient();
  const today = shopNow().date;
  const [range, setRange] = useState<Range>("upcoming");
  const [status, setStatus] = useState<BookingStatus | "any">("any");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  // Debounce search typing.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filters = useMemo(() => {
    const f: { from?: string; to?: string } = {};
    if (range === "upcoming") f.from = today;
    if (range === "today") Object.assign(f, { from: today, to: today });
    if (range === "past")
      Object.assign(f, { from: addDaysIso(today, -60), to: addDaysIso(today, -1) });
    return {
      ...f,
      status: status === "any" ? undefined : status,
      search: search || undefined,
    };
  }, [range, status, search, today]);

  const queryKey = ["admin", "bookings", "list", filters];
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () => listBookings({ data: filters }),
  });

  let rows = sortBookings((data ?? []) as BookingRow[]);
  if (range === "past") rows = rows.reverse();

  async function changeStatus(id: string, next: BookingStatus) {
    setPendingId(id);
    try {
      await updateBookingStatus({ data: { id, status: next } });
      toast.success(`Marked as ${STATUS_LABEL[next].toLowerCase()}`);
      await qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPendingId(null);
    }
  }

  async function remove(id: string) {
    setPendingId(id);
    try {
      await deleteBooking({ data: { id } });
      toast.success("Booking deleted");
      await qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Bookings"
        description="Every appointment booked through the website. Mark them completed, cancelled or no-show."
        actions={
          <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? "size-4 animate-spin" : "size-4"} /> Refresh
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-wrap gap-1 rounded-md border border-border p-1">
          {(
            [
              ["upcoming", "Upcoming"],
              ["today", "Today"],
              ["past", "Past 60 days"],
              ["all", "All"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setRange(value)}
              className={`rounded px-3 py-1.5 text-sm transition-colors ${
                range === value
                  ? "bg-gold/20 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as BookingStatus | "any")}>
          <SelectTrigger className="md:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any status</SelectItem>
            {Object.entries(STATUS_LABEL).map(([v, l]) => (
              <SelectItem key={v} value={v}>
                {l}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search name, phone, email or reference"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <Loader2 className="size-6 animate-spin text-gold" />
      ) : error ? (
        <p className="text-sm text-red-400">{(error as Error).message}</p>
      ) : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No bookings match these filters.
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((b) => (
            <li
              key={b.id}
              className={`rounded-lg border border-border bg-card p-4 ${
                b.status === "cancelled" ? "opacity-60" : ""
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {prettyDate(b.booking_date)} · {b.booking_time}
                    </span>
                    {b.booking_date === today ? (
                      <span className="ml-2 rounded bg-gold/20 px-1.5 py-0.5 text-[0.65rem] text-foreground uppercase">
                        Today
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 font-serif text-lg">{b.customer_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.service_name} · {b.duration_minutes} min · {money(b.price_cents)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} />
                  <span className="font-mono text-xs text-muted-foreground">{b.reference}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <a
                  href={`tel:${b.customer_phone}`}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="size-3.5" /> {b.customer_phone}
                </a>
                <a
                  href={`mailto:${b.customer_email}`}
                  className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                >
                  <Mail className="size-3.5" /> {b.customer_email}
                </a>
              </div>
              {cleanNotes(b.notes) ? (
                <p className="mt-2 rounded bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  {cleanNotes(b.notes)}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <Select
                  value={b.status}
                  onValueChange={(v) => void changeStatus(b.id, v as BookingStatus)}
                  disabled={pendingId === b.id}
                >
                  <SelectTrigger className="h-8 w-40 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABEL).map(([v, l]) => (
                      <SelectItem key={v} value={v}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {pendingId === b.id ? <Loader2 className="size-4 animate-spin text-gold" /> : null}
                <div className="ml-auto">
                  <ConfirmDelete
                    title="Delete this booking?"
                    description={`${b.customer_name} — ${prettyDate(b.booking_date)} at ${b.booking_time}. This can't be undone. (To free the slot but keep a record, mark it Cancelled instead.)`}
                    onConfirm={() => remove(b.id)}
                    disabled={pendingId === b.id}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
