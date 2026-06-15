import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { LayoutDashboard, FileText, Briefcase, Users, LogOut, Home, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { claimAdminIfFirst, getMyRoles } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin · NayePankh AI" }] }),
  component: AdminLayout,
});

const nav: Array<{ to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }> = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/analyses", label: "Analyses", icon: FileText },
  { to: "/admin/internships", label: "Internships", icon: Briefcase },
  { to: "/admin/users", label: "Users & Roles", icon: Users },
];

function AdminLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const getRoles = useServerFn(getMyRoles);
  const claim = useServerFn(claimAdminIfFirst);
  const [state, setState] = useState<"loading" | "admin" | "needs_claim" | "denied">("loading");
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: u } = await supabase.auth.getUser();
        setEmail(u.user?.email ?? "");
        const { roles } = await getRoles();
        if (cancelled) return;
        if (roles.includes("admin")) setState("admin");
        else setState("needs_claim");
      } catch {
        if (!cancelled) setState("denied");
      }
    })();
    return () => { cancelled = true; };
  }, [getRoles]);

  const onClaim = async () => {
    try {
      const res = await claim();
      if (res.claimed) setState("admin");
      else setState("denied");
    } catch {
      setState("denied");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (state === "loading") {
    return <div className="min-h-screen flex items-center justify-center text-muted bg-navy">Loading admin…</div>;
  }
  if (state === "needs_claim") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-navy">
        <div className="glass-panel rounded-2xl p-8 max-w-md text-center space-y-4">
          <ShieldCheck className="size-10 text-electric mx-auto" />
          <h1 className="text-xl font-bold text-white">Claim admin access</h1>
          <p className="text-sm text-muted">No admin exists yet. Become the first admin for this workspace.</p>
          <button onClick={onClaim} className="rounded-lg bg-gradient-to-r from-electric to-teal text-white px-4 py-2 text-sm font-semibold">
            Make me admin
          </button>
          <Link to="/" className="block text-xs text-muted hover:text-white">← Back to app</Link>
        </div>
      </div>
    );
  }
  if (state === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-navy">
        <div className="glass-panel rounded-2xl p-8 max-w-md text-center space-y-4">
          <h1 className="text-xl font-bold text-white">Admin access required</h1>
          <p className="text-sm text-muted">Signed in as <span className="text-white">{email}</span>. Ask an existing admin to grant your role.</p>
          <button onClick={signOut} className="text-xs text-muted hover:text-white">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-navy text-white">
      <aside className="w-60 shrink-0 border-r border-glass-border bg-navy/60 backdrop-blur-xl flex flex-col">
        <div className="p-5 border-b border-glass-border">
          <div className="flex items-center gap-2.5">
            <div className="size-9 bg-gradient-to-br from-electric to-teal rounded-lg flex items-center justify-center shadow-lg shadow-electric/30">
              <ShieldCheck className="size-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold">Admin OS</p>
              <p className="text-[10px] font-mono uppercase tracking-widest text-muted">NayePankh AI</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {nav.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? "bg-electric/15 text-electric" : "text-muted hover:bg-white/5 hover:text-white"
                }`}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-glass-border space-y-1">
          <Link to="/" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-white/5 hover:text-white">
            <Home className="size-4" /> Back to app
          </Link>
          <button onClick={signOut} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-white/5 hover:text-white">
            <LogOut className="size-4" /> Sign out
          </button>
          <p className="px-3 pt-2 text-[10px] font-mono text-muted truncate" title={email}>{email}</p>
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-6 md:p-8 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
