import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import { AdminCard, AdminPageHeader, FieldLabel } from "@/components/admin/AdminUi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { passwordProblem } from "@/lib/password";

export const Route = createFileRoute("/admin/account")({
  component: AccountPage,
});

function AccountPage() {
  const auth = useAdminAuth();
  const email = "email" in auth ? auth.email : null;
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const problem = passwordProblem(password, confirm);
    if (problem) return setError(problem);
    if (!email) return setError("Could not determine your email.");
    setBusy(true);
    try {
      // Re-check the current password before allowing a change.
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (reauthError) throw new Error("Current password is incorrect.");
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw new Error(updateError.message);
      toast.success("Password changed");
      setCurrent("");
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password.");
    } finally {
      setBusy(false);
    }
  }

  async function signOutEverywhere() {
    await supabase.auth.signOut({ scope: "global" });
    await auth.signOut();
  }

  return (
    <>
      <AdminPageHeader title="My account" description={email ?? undefined} />
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard title="Change password">
          <form onSubmit={submit} className="space-y-4">
            <label className="block">
              <FieldLabel>Current password</FieldLabel>
              <Input
                type="password"
                autoComplete="current-password"
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
              />
            </label>
            <label className="block">
              <FieldLabel hint="min 10 characters, letters + a number">New password</FieldLabel>
              <Input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <label className="block">
              <FieldLabel>Confirm new password</FieldLabel>
              <Input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </label>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? <Loader2 className="size-4 animate-spin" /> : null}
              Update password
            </Button>
          </form>
        </AdminCard>

        <AdminCard
          title="Security"
          description="You're signed out automatically after 30 minutes without activity."
        >
          <p className="text-sm text-muted-foreground">
            Lost a phone or used a shared computer? Sign out of the dashboard on every device.
          </p>
          <Button className="mt-4" variant="outline" onClick={() => void signOutEverywhere()}>
            Sign out on all devices
          </Button>
        </AdminCard>
      </div>
    </>
  );
}
