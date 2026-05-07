import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { ArrowUpRight, FilePlus2, Inbox, CheckCircle2, Clock, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — ResolveDesk" }] }),
  component: Dashboard,
});

const stats = [
  { label: "Total complaints", value: "24", trend: "+12%", icon: Inbox, color: "text-info" },
  { label: "Open", value: "8", trend: "+3", icon: Clock, color: "text-warning" },
  { label: "Resolved", value: "14", trend: "+8", icon: CheckCircle2, color: "text-success" },
  { label: "Avg resolution", value: "2.4h", trend: "-18%", icon: TrendingUp, color: "text-primary" },
];

const recent = [
  { id: "TKT-2041", subject: "Cannot access my account after password reset", category: "Account", status: "in_progress" as const, priority: "high" as const, date: "2h ago" },
  { id: "TKT-2039", subject: "Refund request for order #88421", category: "Billing", status: "open" as const, priority: "urgent" as const, date: "5h ago" },
  { id: "TKT-2031", subject: "Feature request: dark mode for mobile", category: "Feature", status: "resolved" as const, priority: "low" as const, date: "1d ago" },
  { id: "TKT-2024", subject: "Invoice not generated correctly", category: "Billing", status: "pending" as const, priority: "medium" as const, date: "2d ago" },
];

function Dashboard() {
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
            <div className="mt-3 flex items-end justify-between">
              <span className="text-3xl font-bold tracking-tight">{s.value}</span>
              <span className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">{s.trend}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Tickets over time</h2>
            <select className="rounded-md border border-border bg-background px-2 py-1 text-xs">
              <option>Last 7 days</option><option>Last 30 days</option>
            </select>
          </div>
          {/* Chart placeholder */}
          <div className="mt-6 flex h-56 items-end gap-3">
            {[40, 65, 50, 80, 45, 70, 90, 60, 85, 55, 75, 95].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-lg bg-gradient-to-t from-primary/30 to-primary transition-all hover:opacity-80" style={{ height: `${h}%` }} />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Status breakdown</h2>
          <div className="mt-6 space-y-4">
            {[
              { l: "Open", v: 32, c: "bg-info" },
              { l: "In Progress", v: 28, c: "bg-warning" },
              { l: "Resolved", v: 56, c: "bg-success" },
              { l: "Closed", v: 12, c: "bg-muted-foreground" },
            ].map((s) => (
              <div key={s.l}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{s.l}</span><span className="font-semibold">{s.v}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${s.c}`} style={{ width: `${s.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="font-semibold">Recent complaints</h2>
          <Link to="/complaints" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">View all <ArrowUpRight className="h-3.5 w-3.5" /></Link>
        </div>
        <div className="divide-y divide-border">
          {recent.map((t) => (
            <Link key={t.id} to="/complaints/$id" params={{ id: t.id }} className="grid grid-cols-12 items-center gap-3 px-6 py-4 transition-colors hover:bg-muted/40">
              <div className="col-span-12 sm:col-span-6">
                <div className="text-xs font-mono text-muted-foreground">{t.id}</div>
                <div className="mt-0.5 truncate font-medium">{t.subject}</div>
              </div>
              <div className="col-span-4 hidden text-sm text-muted-foreground sm:block">{t.category}</div>
              <div className="col-span-4 sm:col-span-1"><PriorityBadge p={t.priority} /></div>
              <div className="col-span-4 sm:col-span-1"><StatusBadge status={t.status} /></div>
              <div className="col-span-4 hidden text-right text-xs text-muted-foreground sm:block">{t.date}</div>
            </Link>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
