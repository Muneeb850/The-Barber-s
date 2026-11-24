import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminMe } from "@/lib/admin.functions";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "not-admin"; email: string | null }
  | { status: "admin"; email: string | null };

type AdminAuthValue = AuthState & { signOut: () => Promise<void>; refresh: () => Promise<void> };

const AdminAuthContext = createContext<AdminAuthValue | null>(null);

/** Auto sign-out after this much inactivity. */
const IDLE_LIMIT_MS = 30 * 60 * 1000;

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const checking = useRef(0);

  const refresh = useCallback(async () => {
    const run = ++checking.current;
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      if (run === checking.current) setState({ status: "signed-out" });
      return;
    }
    try {
      const me = await getAdminMe();
      if (run !== checking.current) return;
      setState(
        me.isAdmin
          ? { status: "admin", email: me.email }
          : { status: "not-admin", email: me.email },
      );
    } catch {
      // Invalid/expired token → treat as signed out.
      await supabase.auth.signOut();
      if (run === checking.current) setState({ status: "signed-out" });
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ status: "signed-out" });
  }, []);

  useEffect(() => {
    void refresh();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        void refresh();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [refresh]);

  // Idle timeout — protects a dashboard left open on a shared/shop computer.
  useEffect(() => {
    if (state.status !== "admin") return;
    let timer = window.setTimeout(() => void signOut(), IDLE_LIMIT_MS);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => void signOut(), IDLE_LIMIT_MS);
    };
    const events = ["mousemove", "keydown", "click", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [state.status, signOut]);

  return (
    <AdminAuthContext.Provider value={{ ...state, signOut, refresh }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
