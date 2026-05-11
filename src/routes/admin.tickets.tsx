import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/admin/tickets")({
  head: () => ({ meta: [{ title: "Tickets — Admin" }] }),
  component: () => <RequireAuth staff><AdminTickets /></RequireAuth>,
});

type Row = {
  id: string; ticket_no: string; subject: string; user_id: string; category: string;
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
};

function AdminTickets() {
  const [rows, setRows] = useState<Row[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: c } = await supabase.from("complaints")
        .select("id, ticket_no, subject, user_id, category, status, priority, created_at")
        .order("created_at", { ascending: false });
      const list = (c ?? []) as Row[];
      setRows(list);
      const uids = Array.from(new Set(list.map((r) => r.user_id)));
      if (uids.length) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, email").in("id", uids);
        const map: Record<string, string> = {};
        (p ?? []).forEach((x: { id: string; full_name: string | null; email: string | null }) => {
          map[x.id] = x.full_name || x.email || "User";
        });
        setUsers(map);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => rows.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (priorityFilter && r.priority !== priorityFilter) return false;
    if (search && !`${r.ticket_no} ${r.subject} ${users[r.user_id] ?? ""}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [rows, search, statusFilter, priorityFilter, users]);

  return (
    <DashboardLayout
      variant="admin"
      title="Ticket management"
      breadcrumbs={[{ label: "Admin" }, { label: "Tickets" }]}
    >
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tickets, users, categories…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            <option value="open">Open</option><option value="in_progress">In progress</option>
            <option value="pending">Pending</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
          </select>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All priorities</option>
            <option value="urgent">Urgent</option><option value="high">High</option>
            <option value="medium">Medium</option><option value="low">Low</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No tickets match your filters.</td></tr>}
              {filtered.map((t) => (
                <tr key={t.id} className="cursor-pointer transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link to="/complaints/$id" params={{ id: t.ticket_no }}>
                      <div className="font-mono text-xs text-muted-foreground">{t.ticket_no}</div>
                      <div className="font-medium">{t.subject}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{users[t.user_id] ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                  <td className="px-4 py-3"><PriorityBadge p={t.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
