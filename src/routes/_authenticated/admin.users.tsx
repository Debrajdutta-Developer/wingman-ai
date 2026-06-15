import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { adminListUsers, adminSetRole } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: AdminUsers,
});

function AdminUsers() {
  const list = useServerFn(adminListUsers);
  const setRole = useServerFn(adminSetRole);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => list(),
  });

  const mutate = useMutation({
    mutationFn: (input: { userId: string; role: "admin" | "user"; grant: boolean }) => setRole({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted">Identity</p>
        <h1 className="text-3xl font-bold">Users & roles</h1>
        <p className="text-sm text-muted mt-1">Grant or revoke admin access.</p>
      </div>

      {isLoading && <p className="text-muted">Loading…</p>}
      {mutate.error && <p className="text-sm text-red-400">{(mutate.error as Error).message}</p>}

      <div className="glass-panel rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-mono uppercase tracking-wider text-muted bg-white/[0.02]">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((u) => {
              const isAdmin = u.roles.includes("admin");
              return (
                <tr key={u.id} className="border-t border-glass-border/40 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-gradient-to-br from-electric to-teal flex items-center justify-center text-white text-xs font-bold">
                        {(u.display_name ?? u.email ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <span className="text-white">{u.display_name ?? "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{u.email ?? "—"}</td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {u.roles.map((r) => (
                        <span key={r} className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${r === "admin" ? "bg-electric/20 text-electric" : "bg-white/5 text-muted"}`}>
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => mutate.mutate({ userId: u.id, role: "admin", grant: !isAdmin })}
                      disabled={mutate.isPending}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
                        isAdmin ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "bg-electric/10 text-electric hover:bg-electric/20"
                      } disabled:opacity-50`}
                    >
                      {isAdmin ? <><ShieldOff className="size-3.5" /> Revoke admin</> : <><ShieldCheck className="size-3.5" /> Make admin</>}
                    </button>
                  </td>
                </tr>
              );
            })}
            {(data ?? []).length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
