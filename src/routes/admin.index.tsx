import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Clock, Inbox, UserRoundCheck, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard-layout";
import { RequireAuth } from "@/components/require-auth";
import { Card } from "@/components/ui/card";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminStats, fetchAdminUsers, type AdminStats } from "@/lib/admin-api";
import { fetchTickets, type TicketSummary } from "@/lib/tickets-api";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin overview — ResolveDesk" }] }),
  component: () => (
    <RequireAuth staff>
      <AdminDashboard />
    </RequireAuth>
  ),
});

const emptyStats: AdminStats = {
  total: 0,
  unassigned: 0,
  open: 0,
  in_progress: 0,
  pending: 0,
  resolved: 0,
  closed: 0,
};

function AdminDashboard() {
  const { user, isSystemAdmin } = useAuth();
  const [rows, setRows] = useState<TicketSummary[]>([]);
  const [stats, setStats] = useState<AdminStats>(emptyStats);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [nextStats, tickets, users] = await Promise.all([
          fetchAdminStats(),
          fetchTickets(),
          isSystemAdmin ? fetchAdminUsers() : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setStats(nextStats);
        setRows(tickets);
        setActiveUsers(users.filter((candidate) => candidate.status === "active").length);
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Unable to load admin dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSystemAdmin]);

  const cards = isSystemAdmin
    ? [
        { label: "Total tickets", value: stats.total, icon: Inbox },
        { label: "Unassigned", value: stats.unassigned, icon: UserRoundCheck },
        { label: "Open / in progress", value: stats.open + stats.in_progress, icon: Clock },
        { label: "Resolved", value: stats.resolved, icon: CheckCircle2 },
        { label: "Active users", value: activeUsers, icon: Users },
      ]
    : [
        { label: "Assigned tickets", value: stats.total, icon: Inbox },
        { label: "Open", value: stats.open, icon: Clock },
        { label: "In progress", value: stats.in_progress, icon: Clock },
        { label: "Pending", value: stats.pending, icon: Clock },
        { label: "Resolved", value: stats.resolved, icon: CheckCircle2 },
      ];

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    rows.forEach((row) => counts.set(row.category, (counts.get(row.category) ?? 0) + 1));
    return Array.from(counts.entries()).map(([label, value]) => ({ label, value }));
  }, [rows]);
  const maxCategory = Math.max(1, ...categories.map((item) => item.value));

  const critical = rows
    .filter(
      (row) =>
        (row.priority === "urgent" || row.priority === "high") &&
        (row.status === "open" || row.status === "in_progress" || row.status === "pending"),
    )
    .slice(0, 5);

  return (
    <DashboardLayout
      variant="admin"
      title={isSystemAdmin ? "System administration" : "Support dashboard"}
      breadcrumbs={[{ label: "Admin" }, { label: "Overview" }]}
    >
      <div className="mb-5 rounded-xl border border-border bg-card px-5 py-4">
        <p className="text-sm font-medium">
          {isSystemAdmin ? "Full system overview" : `Assigned workload for ${user?.name ?? "Support Admin"}`}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {isSystemAdmin
            ? "Monitor all tickets, assignments and user activity from one workspace."
            : "Only tickets assigned to your account are included in these figures and lists."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{card.label}</span>
              <card.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 text-3xl font-bold tracking-tight">{loading ? "—" : card.value}</div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Ticket volume by category</h2>
            <Link to="/admin/tickets" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              View tickets <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-6 space-y-4">
            {!loading && categories.length === 0 && <p className="text-sm text-muted-foreground">No ticket data yet.</p>}
            {categories.map((item) => (
              <div key={item.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-semibold">{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary" style={{ width: `${(item.value / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold">Recent tickets</h2>
          <ul className="mt-5 space-y-3">
            {!loading && rows.length === 0 && <li className="text-sm text-muted-foreground">No tickets to display.</li>}
            {rows.slice(0, 6).map((row) => (
              <li key={row.id} className="flex items-center gap-3 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{row.user_name ?? "User"}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {row.ticket_no} · {row.subject}
                  </div>
                </div>
                <StatusBadge status={row.status} />
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="font-semibold">Priority attention</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">High and urgent active tickets in your permitted scope.</p>
          </div>
          <Link to="/admin/tickets" className="text-sm text-primary hover:underline">
            Manage
          </Link>
        </div>
        <div className="divide-y divide-border">
          {!loading && critical.length === 0 && (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">No high-priority active tickets.</div>
          )}
          {critical.map((ticket) => (
            <Link
              key={ticket.id}
              to="/complaints/$id"
              params={{ id: ticket.ticket_no }}
              className="grid grid-cols-12 items-center gap-3 px-6 py-4 hover:bg-muted/40"
            >
              <div className="col-span-12 sm:col-span-6">
                <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  {ticket.ticket_no}
                  {!!ticket.is_unread && <span className="h-2 w-2 rounded-full bg-primary" title="Unread activity" />}
                </div>
                <div className="font-medium">{ticket.subject}</div>
              </div>
              <div className="col-span-6 text-sm text-muted-foreground sm:col-span-2">{ticket.user_name ?? "—"}</div>
              <div className="col-span-3 sm:col-span-2"><PriorityBadge p={ticket.priority} /></div>
              <div className="col-span-3 sm:col-span-2"><StatusBadge status={ticket.status} /></div>
            </Link>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
