import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  checkIsAdmin,
  listUsers,
  setUserRole,
  listInternships,
  createInternship,
  updateInternship,
  deleteInternship,
  listAnalyses,
  getAnalysis,
  deleteAnalysis,
  aiUsageStats,
} from "@/lib/admin.functions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, LogOut, Plus, Trash2, Edit, Shield, ShieldOff, Eye } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — NayePankh AI" }] }),
  component: AdminPage,
});

function AdminPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [meId, setMeId] = useState<string>("");

  const check = useServerFn(checkIsAdmin);

  useEffect(() => {
    check()
      .then((r) => {
        setIsAdmin(r.isAdmin);
        setMeId(r.userId);
      })
      .catch(() => setIsAdmin(false))
      .finally(() => setChecking(false));
  }, [check]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-panel p-8 rounded-2xl max-w-md text-center">
          <Shield className="mx-auto w-10 h-10 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your account does not have the admin role. Ask an existing admin to grant it, or
            insert a row into user_roles with role = 'admin'.
          </p>
          <div className="mt-6 flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link to="/">Home</Link>
            </Button>
            <Button onClick={signOut}>
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 backdrop-blur sticky top-0 z-10 bg-background/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-bold tracking-tight">
              NayePankh
            </Link>
            <Badge variant="secondary">Admin Console</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {meId.slice(0, 8)}…
            </span>
            <Button size="sm" variant="outline" onClick={signOut}>
              <LogOut className="w-4 h-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users & Roles</TabsTrigger>
            <TabsTrigger value="internships">Internships</TabsTrigger>
            <TabsTrigger value="analyses">Analyses</TabsTrigger>
            <TabsTrigger value="usage">AI Usage</TabsTrigger>
          </TabsList>
          <TabsContent value="users" className="mt-6">
            <UsersTab meId={meId} />
          </TabsContent>
          <TabsContent value="internships" className="mt-6">
            <InternshipsTab />
          </TabsContent>
          <TabsContent value="analyses" className="mt-6">
            <AnalysesTab />
          </TabsContent>
          <TabsContent value="usage" className="mt-6">
            <UsageTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// ===================== USERS TAB =====================
function UsersTab({ meId }: { meId: string }) {
  const list = useServerFn(listUsers);
  const setRole = useServerFn(setUserRole);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    list()
      .then(setUsers)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, [list]);

  const toggleAdmin = async (userId: string, currentlyAdmin: boolean) => {
    try {
      await setRole({ data: { userId, role: "admin", grant: !currentlyAdmin } });
      toast.success(currentlyAdmin ? "Admin revoked" : "Admin granted");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <Loader2 className="w-5 h-5 animate-spin" />;

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left p-3">User</th>
            <th className="text-left p-3">Email</th>
            <th className="text-left p-3">Roles</th>
            <th className="text-left p-3">Joined</th>
            <th className="text-right p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const adminRole = u.roles?.includes("admin");
            const isSelf = u.id === meId;
            return (
              <tr key={u.id} className="border-t border-border/40 hover:bg-muted/20">
                <td className="p-3">
                  <div className="font-medium">{u.display_name || "—"}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {u.id.slice(0, 8)}…
                  </div>
                </td>
                <td className="p-3">{u.email || "—"}</td>
                <td className="p-3">
                  <div className="flex gap-1 flex-wrap">
                    {(u.roles || []).map((r: string) => (
                      <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>
                        {r}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3 text-muted-foreground text-xs">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-3 text-right">
                  <Button
                    size="sm"
                    variant={adminRole ? "outline" : "default"}
                    disabled={isSelf && adminRole}
                    onClick={() => toggleAdmin(u.id, adminRole)}
                  >
                    {adminRole ? (
                      <>
                        <ShieldOff className="w-3 h-3" /> Revoke admin
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3" /> Make admin
                      </>
                    )}
                  </Button>
                </td>
              </tr>
            );
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={5} className="p-6 text-center text-muted-foreground">
                No users yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ===================== INTERNSHIPS TAB =====================
const EMPTY_INTERNSHIP = {
  title: "",
  company: "",
  domain: "AI Development",
  location: "",
  stipend: "",
  description: "",
  tags: [] as string[],
  is_active: true,
};

function InternshipsTab() {
  const list = useServerFn(listInternships);
  const create = useServerFn(createInternship);
  const update = useServerFn(updateInternship);
  const remove = useServerFn(deleteInternship);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const refresh = () => {
    setLoading(true);
    list()
      .then(setRows)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, [list]);

  const startNew = () => {
    setEditing({ ...EMPTY_INTERNSHIP });
    setOpen(true);
  };

  const startEdit = (row: any) => {
    setEditing({ ...row, tags: row.tags || [] });
    setOpen(true);
  };

  const save = async () => {
    try {
      const payload = {
        title: editing.title,
        company: editing.company,
        domain: editing.domain,
        location: editing.location || null,
        stipend: editing.stipend || null,
        description: editing.description || null,
        tags: typeof editing.tags === "string"
          ? editing.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
          : editing.tags,
        is_active: !!editing.is_active,
      };
      if (editing.id) {
        await update({ data: { id: editing.id, patch: payload } });
        toast.success("Updated");
      } else {
        await create({ data: payload });
        toast.success("Created");
      }
      setOpen(false);
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this internship?")) return;
    try {
      await remove({ data: { id } });
      toast.success("Deleted");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">{rows.length} listings</p>
        <Button onClick={startNew}>
          <Plus className="w-4 h-4" /> New internship
        </Button>
      </div>

      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <div className="glass-panel rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Company</th>
                <th className="text-left p-3">Domain</th>
                <th className="text-left p-3">Active</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
                  <td className="p-3 font-medium">{r.title}</td>
                  <td className="p-3">{r.company}</td>
                  <td className="p-3">
                    <Badge variant="secondary">{r.domain}</Badge>
                  </td>
                  <td className="p-3">
                    {r.is_active ? (
                      <Badge>Active</Badge>
                    ) : (
                      <Badge variant="outline">Hidden</Badge>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => del(r.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No internships yet — create your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit internship" : "New internship"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Field label="Title">
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Company">
                  <Input
                    value={editing.company}
                    onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                  />
                </Field>
                <Field label="Domain">
                  <Input
                    value={editing.domain}
                    onChange={(e) => setEditing({ ...editing, domain: e.target.value })}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Location">
                  <Input
                    value={editing.location ?? ""}
                    onChange={(e) => setEditing({ ...editing, location: e.target.value })}
                  />
                </Field>
                <Field label="Stipend">
                  <Input
                    value={editing.stipend ?? ""}
                    onChange={(e) => setEditing({ ...editing, stipend: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Description">
                <Textarea
                  rows={4}
                  value={editing.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </Field>
              <Field label="Tags (comma-separated)">
                <Input
                  value={Array.isArray(editing.tags) ? editing.tags.join(", ") : editing.tags}
                  onChange={(e) => setEditing({ ...editing, tags: e.target.value })}
                />
              </Field>
              <div className="flex items-center gap-3">
                <Switch
                  checked={!!editing.is_active}
                  onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                />
                <Label>Active (visible to candidates)</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

// ===================== ANALYSES TAB =====================
function AnalysesTab() {
  const list = useServerFn(listAnalyses);
  const fetchOne = useServerFn(getAnalysis);
  const remove = useServerFn(deleteAnalysis);
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<any | null>(null);

  const refresh = () => {
    setLoading(true);
    list()
      .then(setRows)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(refresh, [list]);

  const view = async (id: string) => {
    try {
      const row = await fetchOne({ data: { id } });
      setDetail(row);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this analysis?")) return;
    try {
      await remove({ data: { id } });
      toast.success("Deleted");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <Loader2 className="w-5 h-5 animate-spin" />;

  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left p-3">Candidate</th>
            <th className="text-left p-3">Level</th>
            <th className="text-left p-3">Score</th>
            <th className="text-left p-3">Top Match</th>
            <th className="text-left p-3">Recommendation</th>
            <th className="text-left p-3">Date</th>
            <th className="text-right p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-border/40 hover:bg-muted/20">
              <td className="p-3 font-medium">{r.candidate_name || "—"}</td>
              <td className="p-3">{r.experience_level || "—"}</td>
              <td className="p-3">{r.profile_score ?? "—"}</td>
              <td className="p-3">
                {r.top_match_role}{" "}
                {r.top_match_percent != null && (
                  <span className="text-muted-foreground">({r.top_match_percent}%)</span>
                )}
              </td>
              <td className="p-3">
                <Badge variant="secondary">{r.hire_recommendation || "—"}</Badge>
              </td>
              <td className="p-3 text-xs text-muted-foreground">
                {new Date(r.created_at).toLocaleString()}
              </td>
              <td className="p-3 text-right space-x-2">
                <Button size="sm" variant="outline" onClick={() => view(r.id)}>
                  <Eye className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="destructive" onClick={() => del(r.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="p-6 text-center text-muted-foreground">
                No analyses recorded yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{detail?.candidate_name || "Analysis"}</DialogTitle>
          </DialogHeader>
          <pre className="text-xs bg-muted/30 p-4 rounded overflow-auto">
            {JSON.stringify(detail?.result, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===================== USAGE TAB =====================
function UsageTab() {
  const stats = useServerFn(aiUsageStats);
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    stats()
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [stats]);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin" />;
  if (!data) return null;
  const t = data.totals;

  const Stat = ({ label, value }: { label: string; value: any }) => (
    <div className="glass-panel rounded-xl p-4">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Calls" value={t.calls} />
        <Stat label="Total tokens" value={t.total.toLocaleString()} />
        <Stat label="Avg latency" value={`${t.avgLatency} ms`} />
        <Stat label="Success / Fail" value={`${t.success} / ${t.failed}`} />
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left p-3">When</th>
              <th className="text-left p-3">Model</th>
              <th className="text-left p-3">Tokens (P/C/T)</th>
              <th className="text-left p-3">Latency</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: any) => (
              <tr key={r.id} className="border-t border-border/40">
                <td className="p-3 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="p-3 font-mono text-xs">{r.model}</td>
                <td className="p-3 text-xs">
                  {r.prompt_tokens ?? 0} / {r.completion_tokens ?? 0} / {r.total_tokens ?? 0}
                </td>
                <td className="p-3 text-xs">{r.latency_ms ?? "—"} ms</td>
                <td className="p-3">
                  {r.success ? (
                    <Badge>OK</Badge>
                  ) : (
                    <Badge variant="destructive" title={r.error || ""}>
                      Failed
                    </Badge>
                  )}
                </td>
              </tr>
            ))}
            {data.rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No AI usage logs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
