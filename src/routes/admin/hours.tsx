import { createFileRoute } from "@tanstack/react-router";
import { CalendarX, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminCard, AdminPageHeader, useAdminAction } from "@/components/admin/AdminUi";
import { useSiteContent } from "@/components/SiteContentContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { saveSetting } from "@/lib/admin.functions";
import { formatDayHours, prettyDate, shopNow, type DayHours } from "@/lib/site-content";

export const Route = createFileRoute("/admin/hours")({
  component: HoursPage,
});

function HoursPage() {
  const content = useSiteContent();
  const [hours, setHours] = useState<DayHours[]>(content.hours);
  const [closedDates, setClosedDates] = useState<string[]>(content.closedDates);
  const [newDate, setNewDate] = useState("");
  const hoursAction = useAdminAction();
  const datesAction = useAdminAction();
  const today = shopNow().date;

  useEffect(() => setHours(content.hours), [content.hours]);
  useEffect(() => setClosedDates(content.closedDates), [content.closedDates]);

  const invalid = hours.find((h) => !h.closed && h.open >= h.close);
  const hoursDirty = JSON.stringify(hours) !== JSON.stringify(content.hours);

  function update(i: number, patch: Partial<DayHours>) {
    setHours((prev) => prev.map((h, idx) => (idx === i ? { ...h, ...patch } : h)));
  }

  function copyMondayToWeekdays() {
    const mon = hours[0];
    setHours((prev) =>
      prev.map((h, i) =>
        i > 0 && i < 5 ? { ...h, open: mon.open, close: mon.close, closed: mon.closed } : h,
      ),
    );
  }

  async function saveDates(next: string[]) {
    const sorted = [...new Set(next)].sort();
    const ok = await datesAction.run(
      () => saveSetting({ data: { key: "closed_dates", value: sorted } }),
      "Closed dates saved",
    );
    if (ok) setClosedDates(sorted);
  }

  const upcomingClosed = closedDates.filter((d) => d >= today);
  const pastClosed = closedDates.filter((d) => d < today);

  return (
    <>
      <AdminPageHeader
        title="Hours & closures"
        description="Opening hours show on the website and control which appointment times customers can book. All times are Honolulu time (HST)."
      />

      <AdminCard title="Weekly opening hours">
        <div className="divide-y divide-border">
          {hours.map((h, i) => (
            <div key={h.day} className="flex flex-wrap items-center gap-3 py-3">
              <span className="w-28 font-medium">{h.day}</span>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Switch
                  checked={!h.closed}
                  onCheckedChange={(open) => update(i, { closed: !open })}
                  aria-label={`${h.day} open`}
                />
                {h.closed ? "Closed" : "Open"}
              </label>
              {!h.closed ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    className="w-32"
                    value={h.open}
                    onChange={(e) => update(i, { open: e.target.value })}
                    aria-label={`${h.day} opening time`}
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    className="w-32"
                    value={h.close}
                    onChange={(e) => update(i, { close: e.target.value })}
                    aria-label={`${h.day} closing time`}
                  />
                </div>
              ) : null}
              <span className="ml-auto hidden text-xs text-muted-foreground md:block">
                Shows as: {formatDayHours(h)}
              </span>
            </div>
          ))}
        </div>

        {invalid ? (
          <p className="mt-3 text-sm text-red-400">
            {invalid.day}: closing time must be after opening time.
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            disabled={!hoursDirty || !!invalid || hoursAction.busy}
            onClick={() =>
              void hoursAction.run(
                () => saveSetting({ data: { key: "hours", value: hours } }),
                "Opening hours saved",
              )
            }
          >
            {hoursAction.busy ? <Loader2 className="size-4 animate-spin" /> : null}
            Save hours
          </Button>
          <Button variant="outline" onClick={copyMondayToWeekdays}>
            Copy Monday to Tue–Fri
          </Button>
          {hoursDirty ? (
            <Button variant="ghost" onClick={() => setHours(content.hours)}>
              Undo changes
            </Button>
          ) : null}
        </div>
      </AdminCard>

      <AdminCard
        className="mt-6"
        title="Holidays & days off"
        description="Customers can't book on these dates. Existing bookings on a date are not cancelled automatically — check the Bookings page."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Input
            type="date"
            min={today}
            className="w-48"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
          />
          <Button
            variant="outline"
            disabled={!newDate || closedDates.includes(newDate) || datesAction.busy}
            onClick={() => {
              void saveDates([...closedDates, newDate]);
              setNewDate("");
            }}
          >
            <Plus className="size-4" /> Add closed date
          </Button>
        </div>

        {upcomingClosed.length === 0 ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarX className="size-4" /> No upcoming closed dates.
          </p>
        ) : (
          <ul className="mt-4 flex flex-wrap gap-2">
            {upcomingClosed.map((d) => (
              <li
                key={d}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 py-1 pr-1 pl-3 text-sm"
              >
                {prettyDate(d, { year: "numeric" })}
                <button
                  type="button"
                  className="rounded-full p-1 text-muted-foreground hover:bg-red-500/15 hover:text-red-300"
                  onClick={() => void saveDates(closedDates.filter((x) => x !== d))}
                  aria-label={`Remove ${d}`}
                  disabled={datesAction.busy}
                >
                  <X className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {pastClosed.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-xs text-muted-foreground"
            onClick={() => void saveDates(upcomingClosed)}
          >
            Clear {pastClosed.length} past date{pastClosed.length > 1 ? "s" : ""}
          </Button>
        ) : null}
      </AdminCard>
    </>
  );
}
