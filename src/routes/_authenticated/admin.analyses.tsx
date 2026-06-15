import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, Eye, X } from "lucide-react";
import { adminListAnalyses, adminGetAnalysis, adminDeleteAnalysis } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/analyses")({
  component: AdminAnalyses,
});

function AdminAnalyses() {
  const list = useServerFn(adminListAnalyses);
  const get = useServerFn(adminGetAnalysis);
  const del = useServerFn(adminDeleteAnalysis);
  const qc = useQueryClient();
  const [viewing, setViewing] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "analyses"],
    queryFn: () => list(),
  });

  const detail = useQuery({
    queryKey: ["admin", "analyses", viewing],
    queryFn: () => get({ data: { id: viewing! } }),
    enabled: !!viewing,
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "analyses"] }),
  });

  const filtered = (data ?? []).filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (r.candidate_name ?? "").toLowerCase().includes(s) ||
      (r.top_match_role ?? "").toLowerCase().includes(s) ||
      (r.experience_level ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-3 justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted">Database</p>
          <h1 className="text-3xl font-bold">Candidate analyses</h1>
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, role, level…"
          className="rounded-lg bg-white/5 border border-glass-border px-3 py-2 text-sm w-72"
        />
      </div>

      {isLoading && <div className="text-muted">Loading…</div>}
      {error && <div className="text-red-400">{(error as Error).message}</div>}

      {data && (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs font-mono uppercase tracking-wider text-muted bg-white/[0.02]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Top match</th>
                  <th className="px-4 py-3">Recommendation</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-t border-glass-border/40 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">{r.candidate_name ?? "—"}</td>
                    <td className="px-4 py-3">{r.experience_level ?? "—"}</td>
                    <td className="px-4 py-3 tabular-nums">{r.profile_score ?? "—"}</td>
                    <td className="px-4 py-3">
                      {r.top_match_role ?? "—"}
                      {r.top_match_percent != null && (
                        <span className="text-xs text-muted ml-1">({r.top_match_percent}%)</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{r.hire_recommendation ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button onClick={() => setViewing(r.id)} className="text-electric hover:text-white p-1.5 rounded hover:bg-white/5">
                          <Eye className="size-4" />
                        </button>
                        <button
                          onClick={() => { if (confirm("Delete this analysis?")) remove.mutate(r.id); }}
                          className="text-red-400 hover:text-white p-1.5 rounded hover:bg-white/5"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-muted">No analyses recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setViewing(null)}>
          <div className="glass-panel rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-auto p-6 space-y-4 relative" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Analysis detail</h2>
              <button onClick={() => setViewing(null)} className="text-muted hover:text-white"><X className="size-5" /></button>
            </div>
            {detail.isLoading && <p className="text-muted">Loading…</p>}
            {detail.data && (
              <pre className="text-xs font-mono whitespace-pre-wrap bg-black/40 p-4 rounded-lg overflow-x-auto">
                {JSON.stringify(detail.data.result, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
