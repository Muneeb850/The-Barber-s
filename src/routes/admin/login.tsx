import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/AdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getAdminMe } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const auth = useAdminAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status === "admin") void navigate({ to: "/admin", replace: true });
  }, [auth.status, navigate]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      // Same message for wrong email or wrong password (don't reveal which accounts exist).
      if (signInError) throw new Error("Incorrect email or password.");
      const me = await getAdminMe();
      if (!me.isAdmin) {
        await supabase.auth.signOut();
        throw new Error("This account does not have admin access.");
      }
      await auth.refresh();
      void navigate({ to: "/admin", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setBusy(false);
      setPassword("");
    }
  }

  async function forgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    });
    setBusy(false);
    // Always show the same message, whether or not the email exists.
    setInfo("If that email belongs to an admin, a password reset link is on its way.");
  }

  return (
    <div className="grid min-h-svh place-items-center bg-background px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-gold/15">
            <Lock className="size-5 text-gold" />
          </div>
          <h1 className="mt-4 font-serif text-3xl">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tom's Barber dashboard</p>
        </div>

        <form
          onSubmit={mode === "login" ? login : forgot}
          className="space-y-4 rounded-lg border border-border bg-card p-6"
        >
          <label className="block">
            <span className="mb-1.5 block text-sm">Email</span>
            <Input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          {mode === "login" ? (
            <label className="block">
              <span className="mb-1.5 block text-sm">Password</span>
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          ) : null}

          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          {info ? <p className="text-sm text-emerald-400">{info}</p> : null}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : null}
            {mode === "login" ? "Sign in" : "Send reset link"}
          </Button>

          <button
            type="button"
            className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              setMode(mode === "login" ? "forgot" : "login");
              setError(null);
              setInfo(null);
            }}
          >
            {mode === "login" ? "Forgot password?" : "Back to sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
