import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Users, FileText, Briefcase, Sparkles, Activity, Zap, Clock, CheckCircle2 } from "lucide-react";
import { adminGetMetrics } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverview,
});

function AdminOverview() {
  const fetchMetrics = useServerFn(adminGetMetrics);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: () => fetchMetrics(),
  });

  if (isLoading) return <div className="text-muted">Loading metrics…</div>;
  if (error) return <div className="text-red-400">Failed to load metrics: {(error as Error).message}</div>;
  if (!data) return null;

  const stats = [
    { label: "Total Users", value: data.counts.users, icon: Users, color: "from-electric to-cyan-400" },
    { label: "Analyses Run", value: data.counts.analyses, icon: FileText, color: "from-teal to-emerald-400" },
    { label: "Internships", value: data.counts.internships, icon: Briefcase, color: "from-amber-400 to-orange-500" },
    { label: "AI Calls", value: data.counts.aiCalls, icon: Sparkles, color: "from-fuchsia-500 to-pink-500" },
  ];

  const aiCards = [
    { label: "Success Rate", value: `${data.ai.successRate}%`, icon: CheckCircle2 },
    { label: "Total Tokens", value: data.ai.totalTokens.toLocaleString(), icon: Zap },
    { label: "Avg Latency", value: `${data.ai.avgLatencyMs} ms`, icon: Clock },
    { label: "Total Calls", value: data.ai.totalCalls, icon: Activity },
  ];

  const maxTokens = Math.max(1, ...data.tokensSeries.map((d) => d.tokens));

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted">Overview</p>
        <h1 className="text-3xl font-bold mt-1">Mission Control</h1>
        <p className="text-sm text-muted mt-1">Pulse of NayePankh AI — users, analyses, internships, and AI usage.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="glass-panel rounded-2xl p-4">
            <div className={`size-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}>
              <s.icon className="size-5 text-white" />
            </div>
            <p className="text-2xl font-bold tabular-nums">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Token usage (last 30 days)</h2>
            <span className="text-xs font-mono text-muted">{data.tokensSeries.length} days with activity</span>
          </div>
          {data.tokensSeries.length === 0 ? (
            <p className="text-sm text-muted py-8 text-center">No activity yet.</p>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {data.tokensSeries.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                  <div
                    className="w-full bg-gradient-to-t from-electric to-teal rounded-t opacity-80 hover:opacity-100"
                    style={{ height: `${(d.tokens / maxTokens) * 100}%` }}
                    title={`${d.date}: ${d.tokens.toLocaleString()} tokens`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-3">
          <h2 className="font-semibold mb-2">AI Health</h2>
          {aiCards.map((a) => (
            <div key={a.label} className="flex items-center justify-between border-b border-glass-border/50 pb-2 last:border-0">
              <div className="flex items-center gap-2 text-sm text-muted">
                <a.icon className="size-4" /> {a.label}
              </div>
              <div className="font-mono text-white">{a.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Recent AI calls</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs font-mono uppercase tracking-wider text-muted">
              <tr>
                <th className="py-2 pr-3">Time</th>
                <th className="py-2 pr-3">Model</th>
                <th className="py-2 pr-3">Tokens</th>
                <th className="py-2 pr-3">Latency</th>
                <th className="py-2 pr-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.recentUsage.slice(0, 12).map((r, i) => (
                <tr key={i} className="border-t border-glass-border/40">
                  <td className="py-2 pr-3 text-muted">{new Date(r.created_at as string).toLocaleString()}</td>
                  <td className="py-2 pr-3 font-mono text-xs">{r.model}</td>
                  <td className="py-2 pr-3 tabular-nums">{r.total_tokens ?? "—"}</td>
                  <td className="py-2 pr-3 tabular-nums">{r.latency_ms} ms</td>
                  <td className="py-2 pr-3">
                    {r.success ? <span className="text-teal">OK</span> : <span className="text-red-400" title={r.error ?? ""}>Error</span>}
                  </td>
                </tr>
              ))}
              {data.recentUsage.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted">No AI calls yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
