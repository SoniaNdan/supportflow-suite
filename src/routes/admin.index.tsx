import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Inbox, Users, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin overview — ResolveDesk" }] }),
  component: () => <RequireAuth staff><AdminDashboard /></RequireAuth>,
});

type Row = {
  id: string; ticket_no: string; subject: string; user_id: string; category: string;
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
};

function AdminDashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [users, setUsers] = useState<Record<string, string>>({});
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ data: c }, { count }] = await Promise.all([
        supabase.from("complaints")
          .select("id, ticket_no, subject, user_id, category, status, priority, created_at")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);
      const list = (c ?? []) as Row[];
      setRows(list);
      setUserCount(count ?? 0);
      const uids = Array.from(new Set(list.map((r) => r.user_id)));
      if (uids.length) {
        const { data: p } = await supabase.from("profiles").select("id, full_name, email").in("id", uids);
        const map: Record<string, string> = {};
        (p ?? []).forEach((x: { id: string; full_name: string | null; email: string | null }) => {
          map[x.id] = x.full_name || x.email || "User";
        });
        setUsers(map);
      }
    })();
  }, []);

  const total = rows.length;
  const open = rows.filter((r) => r.status === "open" || r.status === "in_progress").length;
  const resolved = rows.filter((r) => r.status === "resolved" || r.status === "closed").length;
  const stats = [
    { label: "Total tickets", value: total, icon: Inbox, color: "text-info" },
    { label: "Active users", value: userCount, icon: Users, color: "text-primary" },
    { label: "Open / in progress", value: open, icon: Clock, color: "text-warning" },
    { label: "Resolved", value: resolved, icon: CheckCircle2, color: "text-success" },
  ];

  // category breakdown
  const cats: Record<string, number> = {};
  rows.forEach((r) => { cats[r.category] = (cats[r.category] ?? 0) + 1; });
  const catList = Object.entries(cats).map(([l, v]) => ({ l, v }));
  const max = Math.max(1, ...catList.map((c) => c.v));

  const critical = rows.filter((r) => (r.priority === "urgent" || r.priority === "high") && (r.status === "open" || r.status === "in_progress")).slice(0, 5);

  return (
    <DashboardLayout
      variant="admin"
      title="Admin overview"
      breadcrumbs={[{ label: "Admin" }, { label: "Overview" }]}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{s.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Volume by category</h2>
            <Link to="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">View tickets <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-6 space-y-4">
            {catList.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
            {catList.map((s) => (
              <div key={s.l}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{s.l}</span><span className="font-semibold">{s.v}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${(s.v / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-5 space-y-3">
            {rows.slice(0, 6).map((r) => (
              <li key={r.id} className="flex items-center gap-3 text-sm">
                <div className="flex-1">
                  <div className="font-medium">{users[r.user_id] ?? "User"}</div>
                  <div className="truncate text-xs text-muted-foreground">{r.ticket_no} · {r.subject}</div>
                </div>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold">Open critical tickets</h2>
          <Link to="/admin/tickets" className="text-sm text-primary hover:underline">Manage</Link>
        </div>
        <div className="divide-y divide-border">
          {critical.length === 0 && <div className="px-6 py-10 text-center text-sm text-muted-foreground">All critical tickets are handled. Nice work.</div>}
          {critical.map((t) => (
            <Link key={t.id} to="/complaints/$id" params={{ id: t.ticket_no }} className="grid grid-cols-12 items-center gap-3 px-6 py-4 hover:bg-muted/40">
              <div className="col-span-12 sm:col-span-7">
                <div className="font-mono text-xs text-muted-foreground">{t.ticket_no}</div>
                <div className="font-medium">{t.subject}</div>
              </div>
              <div className="col-span-6 sm:col-span-2 text-sm text-muted-foreground">{users[t.user_id] ?? "—"}</div>
              <div className="col-span-3 sm:col-span-1"><PriorityBadge p={t.priority} /></div>
              <div className="col-span-3 sm:col-span-2"><StatusBadge status={t.status} /></div>
            </Link>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
