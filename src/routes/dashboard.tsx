import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { ArrowUpRight, FilePlus2, Inbox, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ResolveDesk" }] }),
  component: () => <RequireAuth><Dashboard /></RequireAuth>,
});

type Row = {
  id: string; ticket_no: string; subject: string; category: string;
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
};

function Dashboard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("complaints")
      .select("id, ticket_no, subject, category, status, priority, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, [user]);

  const total = rows.length;
  const open = rows.filter((r) => r.status === "open" || r.status === "in_progress").length;
  const resolved = rows.filter((r) => r.status === "resolved" || r.status === "closed").length;
  const pending = rows.filter((r) => r.status === "pending").length;
  const recent = rows.slice(0, 5);

  const stats = [
    { label: "Total complaints", value: total, icon: Inbox, color: "text-info" },
    { label: "Open", value: open, icon: Clock, color: "text-warning" },
    { label: "Resolved", value: resolved, icon: CheckCircle2, color: "text-success" },
    { label: "Pending", value: pending, icon: TrendingUp, color: "text-primary" },
  ];

  const breakdown = [
    { l: "Open", v: rows.filter((r) => r.status === "open").length, c: "bg-info" },
    { l: "In Progress", v: rows.filter((r) => r.status === "in_progress").length, c: "bg-warning" },
    { l: "Pending", v: rows.filter((r) => r.status === "pending").length, c: "bg-primary" },
    { l: "Resolved", v: rows.filter((r) => r.status === "resolved").length, c: "bg-success" },
    { l: "Closed", v: rows.filter((r) => r.status === "closed").length, c: "bg-muted-foreground" },
  ];
  const max = Math.max(1, ...breakdown.map((b) => b.v));

  return (
    <DashboardLayout
      title="Dashboard"
      breadcrumbs={[{ label: "Home", to: "/" }, { label: "Dashboard" }]}
      actions={<Button asChild className="shadow-glow"><Link to="/complaints/new"><FilePlus2 className="mr-2 h-4 w-4" /> New complaint</Link></Button>}
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
          <h2 className="font-semibold">Status breakdown</h2>
          <div className="mt-6 space-y-4">
            {breakdown.map((s) => (
              <div key={s.l}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{s.l}</span><span className="font-semibold">{s.v}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${s.c}`} style={{ width: `${(s.v / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Quick tips</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>• Add a clear subject line for fastest triage</li>
            <li>• Attach screenshots when reporting bugs</li>
            <li>• Mark resolved tickets to keep your inbox clean</li>
          </ul>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold">Recent complaints</h2>
          <Link to="/complaints" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="divide-y divide-border">
          {recent.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No complaints yet. <Link to="/complaints/new" className="text-primary hover:underline">Submit your first one</Link>.
            </div>
          )}
          {recent.map((t) => (
            <Link key={t.id} to="/complaints/$id" params={{ id: t.ticket_no }} className="grid grid-cols-12 items-center gap-3 px-6 py-4 transition-colors hover:bg-muted/40">
              <div className="col-span-12 sm:col-span-6">
                <div className="text-xs font-mono text-muted-foreground">{t.ticket_no}</div>
                <div className="mt-0.5 truncate font-medium">{t.subject}</div>
              </div>
              <div className="col-span-4 hidden text-sm text-muted-foreground sm:block">{t.category}</div>
              <div className="col-span-4 sm:col-span-1"><PriorityBadge p={t.priority} /></div>
              <div className="col-span-4 sm:col-span-1"><StatusBadge status={t.status} /></div>
              <div className="col-span-4 hidden text-right text-xs text-muted-foreground sm:block">{new Date(t.created_at).toLocaleDateString()}</div>
            </Link>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
