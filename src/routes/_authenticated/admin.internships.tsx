import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { adminListInternships, adminUpsertInternship, adminDeleteInternship } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/internships")({
  component: AdminInternships,
});

const DOMAINS = [
  "AI Development", "AI Agent Development", "Python Development", "Data Analytics",
  "Frontend Development", "Web Development", "Backend Development", "Full Stack Development",
];

type Internship = {
  id?: string;
  title: string;
  company: string;
  domain: string;
  location: string;
  stipend: string;
  description: string;
  tags: string[];
  is_active: boolean;
};

const empty: Internship = {
  title: "", company: "", domain: DOMAINS[0], location: "", stipend: "",
  description: "", tags: [], is_active: true,
};

function AdminInternships() {
  const list = useServerFn(adminListInternships);
  const upsert = useServerFn(adminUpsertInternship);
  const del = useServerFn(adminDeleteInternship);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Internship | null>(null);

  const { data } = useQuery({
    queryKey: ["admin", "internships"],
    queryFn: () => list(),
  });

  const save = useMutation({
    mutationFn: (input: Internship) => upsert({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "internships"] });
      setEditing(null);
    },
  });
  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "internships"] }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.25em] text-muted">Catalog</p>
          <h1 className="text-3xl font-bold">Internships</h1>
          <p className="text-sm text-muted mt-1">Roles the matching agent draws from.</p>
        </div>
        <button onClick={() => setEditing({ ...empty })} className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-electric to-teal text-white px-4 py-2 text-sm font-semibold">
          <Plus className="size-4" /> Add internship
        </button>
      </div>

      <div className="grid gap-3">
        {(data ?? []).map((it) => (
          <div key={it.id} className="glass-panel rounded-xl p-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-white">{it.title}</h3>
                <span className="text-xs text-muted">@ {it.company}</span>
                {!it.is_active && <span className="text-[10px] uppercase font-mono text-amber-400 border border-amber-400/30 px-1.5 py-0.5 rounded">Hidden</span>}
              </div>
              <p className="text-xs text-electric font-mono uppercase tracking-wider mt-1">{it.domain}</p>
              {it.description && <p className="text-sm text-muted mt-1 line-clamp-2">{it.description}</p>}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {it.location && <span className="text-[11px] bg-white/5 px-2 py-0.5 rounded">📍 {it.location}</span>}
                {it.stipend && <span className="text-[11px] bg-white/5 px-2 py-0.5 rounded">💰 {it.stipend}</span>}
                {(it.tags ?? []).map((t) => <span key={t} className="text-[11px] bg-white/5 px-2 py-0.5 rounded">{t}</span>)}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => setEditing({ ...empty, ...it, tags: it.tags ?? [], location: it.location ?? "", stipend: it.stipend ?? "", description: it.description ?? "" })} className="p-2 text-electric hover:bg-white/5 rounded">
                <Pencil className="size-4" />
              </button>
              <button onClick={() => { if (confirm("Delete this internship?")) remove.mutate(it.id); }} className="p-2 text-red-400 hover:bg-white/5 rounded">
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
        {(data ?? []).length === 0 && (
          <div className="glass-panel rounded-xl p-10 text-center text-muted">
            No internships yet. Click <span className="text-white">Add internship</span> to seed the catalog.
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="glass-panel rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setEditing(null)} className="absolute top-4 right-4 text-muted hover:text-white"><X className="size-5" /></button>
            <form onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }} className="space-y-3">
              <h2 className="text-lg font-bold">{editing.id ? "Edit" : "New"} internship</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Field label="Title"><input required value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className={inputCls} /></Field>
                <Field label="Company"><input required value={editing.company} onChange={(e) => setEditing({ ...editing, company: e.target.value })} className={inputCls} /></Field>
                <Field label="Domain">
                  <select value={editing.domain} onChange={(e) => setEditing({ ...editing, domain: e.target.value })} className={inputCls}>
                    {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </Field>
                <Field label="Location"><input value={editing.location} onChange={(e) => setEditing({ ...editing, location: e.target.value })} className={inputCls} /></Field>
                <Field label="Stipend"><input value={editing.stipend} onChange={(e) => setEditing({ ...editing, stipend: e.target.value })} className={inputCls} /></Field>
                <Field label="Tags (comma-separated)">
                  <input
                    value={editing.tags.join(", ")}
                    onChange={(e) => setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })}
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="Description">
                <textarea rows={4} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className={inputCls} />
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                Active (visible publicly)
              </label>
              {save.error && <p className="text-sm text-red-400">{(save.error as Error).message}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(null)} className="px-4 py-2 text-sm text-muted hover:text-white">Cancel</button>
                <button disabled={save.isPending} className="rounded-lg bg-gradient-to-r from-electric to-teal text-white px-4 py-2 text-sm font-semibold disabled:opacity-60">
                  {save.isPending ? "Saving…" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = "w-full rounded-lg bg-white/5 border border-glass-border px-3 py-2 text-sm text-white focus:border-electric focus:outline-none";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-mono uppercase tracking-wider text-muted mb-1 block">{label}</span>
      {children}
    </label>
  );
}
