import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/status-badge";
import { Inbox, Users, Clock, TrendingUp, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin overview — ResolveDesk" }] }),
  component: AdminDashboard,
});

const stats = [
  { label: "Total tickets", value: "1,284", trend: "+8.2%", icon: Inbox, color: "text-info" },
  { label: "Active users", value: "342", trend: "+12", icon: Users, color: "text-primary" },
  { label: "Avg response", value: "1.8h", trend: "-22%", icon: Clock, color: "text-success" },
  { label: "SLA compliance", value: "97%", trend: "+1.2%", icon: TrendingUp, color: "text-warning" },
];

function AdminDashboard() {
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
            <h2 className="font-semibold">Volume by category</h2>
            <Link to="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">View tickets <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-6 space-y-4">
            {[
              { l: "Billing", v: 86, c: "bg-primary" },
              { l: "Technical", v: 72, c: "bg-info" },
              { l: "Account", v: 54, c: "bg-success" },
              { l: "Feature Request", v: 38, c: "bg-warning" },
              { l: "Other", v: 22, c: "bg-muted-foreground" },
            ].map((s) => (
              <div key={s.l}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{s.l}</span><span className="font-semibold">{s.v}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className={`h-full ${s.c}`} style={{ width: `${s.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Recent activity</h2>
          <ul className="mt-5 space-y-4">
            {[
              { who: "AM", name: "Alex Morgan", action: "resolved TKT-2031", time: "2m" },
              { who: "JD", name: "Jane Doe", action: "submitted TKT-2042", time: "8m" },
              { who: "SK", name: "Sara Kim", action: "replied to TKT-2039", time: "23m" },
              { who: "RP", name: "Ravi Patel", action: "assigned TKT-2040", time: "1h" },
              { who: "MO", name: "Mia Ortiz", action: "closed TKT-2025", time: "3h" },
            ].map((a, i) => (
              <li key={i} className="flex items-center gap-3">
                <Avatar className="h-9 w-9"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{a.who}</AvatarFallback></Avatar>
                <div className="flex-1 text-sm">
                  <span className="font-medium">{a.name}</span>{" "}
                  <span className="text-muted-foreground">{a.action}</span>
                </div>
                <span className="text-xs text-muted-foreground">{a.time}</span>
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
          {[
            { id: "TKT-2042", subject: "Payment processing failed for premium plan", user: "Jane Doe", status: "open" as const, time: "8m ago" },
            { id: "TKT-2039", subject: "Refund request for order #88421", user: "Sara Kim", status: "in_progress" as const, time: "5h ago" },
            { id: "TKT-2036", subject: "API rate limit incorrectly applied", user: "Ravi Patel", status: "open" as const, time: "1d ago" },
          ].map((t) => (
            <div key={t.id} className="grid grid-cols-12 items-center gap-3 px-6 py-4">
              <div className="col-span-12 sm:col-span-7">
                <div className="font-mono text-xs text-muted-foreground">{t.id}</div>
                <div className="font-medium">{t.subject}</div>
              </div>
              <div className="col-span-6 sm:col-span-2 text-sm text-muted-foreground">{t.user}</div>
              <div className="col-span-3 sm:col-span-2"><StatusBadge status={t.status} /></div>
              <div className="col-span-3 sm:col-span-1 text-right text-xs text-muted-foreground">{t.time}</div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
