import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard-layout";
import { RequireAuth } from "@/components/require-auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { fetchAdminUsers, updateUserStatus, type AdminUser } from "@/lib/admin-api";
import { fetchTickets } from "@/lib/tickets-api";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: () => (
    <RequireAuth admin>
      <AdminUsers />
    </RequireAuth>
  ),
});

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ticketCounts, setTicketCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [nextUsers, tickets] = await Promise.all([fetchAdminUsers(), fetchTickets()]);
        if (cancelled) return;
        const counts: Record<number, number> = {};
        tickets.forEach((ticket) => {
          if (ticket.user_id !== undefined) counts[ticket.user_id] = (counts[ticket.user_id] ?? 0) + 1;
        });
        setUsers(nextUsers);
        setTicketCounts(counts);
      } catch (error) {
        if (!cancelled) toast.error(messageOf(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(
    () => ({
      total: users.length,
      active: users.filter((candidate) => candidate.status === "active").length,
      suspended: users.filter((candidate) => candidate.status === "suspended").length,
      admins: users.filter((candidate) => candidate.role === "admin").length,
    }),
    [users],
  );

  async function toggleStatus(target: AdminUser) {
    const nextStatus = target.status === "active" ? "suspended" : "active";
    setSavingId(target.id);
    try {
      const updated = await updateUserStatus(target.id, nextStatus);
      setUsers((current) => current.map((candidate) => (candidate.id === updated.id ? updated : candidate)));
      toast.success(`${updated.name} is now ${updated.status}.`);
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <DashboardLayout
      variant="admin"
      title="User management"
      breadcrumbs={[{ label: "Admin" }, { label: "Users" }]}
    >
      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total accounts", summary.total],
          ["Active", summary.active],
          ["Suspended", summary.suspended],
          ["Administrators", summary.admins],
        ].map(([label, value]) => (
          <Card key={label} className="p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-bold">{loading ? "—" : value}</div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Tickets</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && users.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No users yet.</td></tr>
              )}
              {users.map((target) => {
                const initials = target.name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const protectedAccount =
                  target.id === user?.id ||
                  (target.role === "admin" && target.admin_level === "system_admin");

                return (
                  <tr key={target.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-accent text-xs text-accent-foreground">{initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{target.name}</div>
                          <div className="text-xs text-muted-foreground">{target.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="rounded-md bg-muted px-2 py-1 text-xs font-semibold">
                        {target.role === "admin"
                          ? target.admin_level === "system_admin"
                            ? "System Admin"
                            : "Support Admin"
                          : "User"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          target.status === "active"
                            ? "bg-success/15 text-success"
                            : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {target.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">{ticketCounts[target.id] ?? 0}</td>
                    <td className="px-6 py-3 text-muted-foreground">
                      {new Date(target.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3">
                      {protectedAccount ? (
                        <span className="text-xs text-muted-foreground">Protected</span>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant={target.status === "active" ? "outline" : "default"}
                          disabled={savingId === target.id}
                          onClick={() => void toggleStatus(target)}
                        >
                          {savingId === target.id
                            ? "Saving…"
                            : target.status === "active"
                              ? "Suspend"
                              : "Activate"}
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
