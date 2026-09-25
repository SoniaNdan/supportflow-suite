import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, UserRoundX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard-layout";
import { RequireAuth } from "@/components/require-auth";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  assignTicket,
  fetchSupportAdmins,
  revokeTicketAssignment,
  updateTicketPriority,
  type SupportAdmin,
} from "@/lib/admin-api";
import {
  fetchTickets,
  updateTicketStatus,
  type TicketPriority,
  type TicketStatus,
  type TicketSummary,
} from "@/lib/tickets-api";

export const Route = createFileRoute("/admin/tickets")({
  head: () => ({ meta: [{ title: "Tickets — Admin" }] }),
  component: () => (
    <RequireAuth staff>
      <AdminTickets />
    </RequireAuth>
  ),
});

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

function AdminTickets() {
  const { isSystemAdmin } = useAuth();
  const [rows, setRows] = useState<TicketSummary[]>([]);
  const [admins, setAdmins] = useState<SupportAdmin[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const [tickets, supportAdmins] = await Promise.all([
          fetchTickets(),
          isSystemAdmin ? fetchSupportAdmins() : Promise.resolve([]),
        ]);
        if (cancelled) return;
        setRows(tickets);
        setAdmins(supportAdmins);
      } catch (error) {
        if (!cancelled) toast.error(messageOf(error));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSystemAdmin]);

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        if (statusFilter && row.status !== statusFilter) return false;
        if (priorityFilter && row.priority !== priorityFilter) return false;
        if (assigneeFilter === "unassigned" && row.assigned_to) return false;
        if (assigneeFilter && assigneeFilter !== "unassigned" && String(row.assigned_to ?? "") !== assigneeFilter) return false;
        if (
          search &&
          !`${row.ticket_no} ${row.subject} ${row.user_name ?? ""} ${row.user_email ?? ""} ${row.category}`
            .toLowerCase()
            .includes(search.toLowerCase())
        ) {
          return false;
        }
        return true;
      }),
    [rows, search, statusFilter, priorityFilter, assigneeFilter],
  );

  function replaceTicket(updated: TicketSummary) {
    setRows((current) => current.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)));
  }

  async function changeStatus(ticket: TicketSummary, status: TicketStatus) {
    if (status === ticket.status) return;
    const key = `${ticket.id}:status`;
    setSaving(key);
    try {
      replaceTicket(await updateTicketStatus(ticket.ticket_no, status));
      toast.success(`${ticket.ticket_no} status updated`);
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setSaving(null);
    }
  }

  async function changePriority(ticket: TicketSummary, priority: TicketPriority) {
    if (priority === ticket.priority) return;
    const key = `${ticket.id}:priority`;
    setSaving(key);
    try {
      replaceTicket(await updateTicketPriority(ticket.ticket_no, priority));
      toast.success(`${ticket.ticket_no} priority updated`);
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setSaving(null);
    }
  }

  async function changeAssignee(ticket: TicketSummary, value: string) {
    const assignedTo = value ? Number(value) : null;
    if ((ticket.assigned_to ?? null) === assignedTo) return;
    const key = `${ticket.id}:assign`;
    setSaving(key);
    try {
      replaceTicket(await assignTicket(ticket.ticket_no, assignedTo));
      toast.success(assignedTo ? `${ticket.ticket_no} assigned` : `${ticket.ticket_no} unassigned`);
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setSaving(null);
    }
  }

  async function revoke(ticket: TicketSummary) {
    if (!ticket.assigned_to) return;
    const key = `${ticket.id}:assign`;
    setSaving(key);
    try {
      replaceTicket(await revokeTicketAssignment(ticket.ticket_no));
      toast.success(`${ticket.ticket_no} assignment revoked`);
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setSaving(null);
    }
  }

  return (
    <DashboardLayout
      variant="admin"
      title={isSystemAdmin ? "Ticket management" : "My assigned tickets"}
      breadcrumbs={[{ label: "Admin" }, { label: "Tickets" }]}
    >
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tickets, users, categories…"
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <select
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">All statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="">All priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {isSystemAdmin && (
            <select
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
            >
              <option value="">All assignees</option>
              <option value="unassigned">Unassigned</option>
              {admins.map((admin) => (
                <option key={admin.id} value={admin.id}>{admin.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Assigned admin</th>
                <th className="px-4 py-3 font-medium">Read state</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">No tickets match your filters.</td></tr>
              )}
              {filtered.map((ticket) => (
                <tr key={ticket.id} className="align-top transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link to="/complaints/$id" params={{ id: ticket.ticket_no }}>
                      <div className="font-mono text-xs text-muted-foreground">{ticket.ticket_no}</div>
                      <div className="max-w-[260px] truncate font-medium">{ticket.subject}</div>
                      <div className="text-xs text-muted-foreground">{ticket.category}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{ticket.user_name ?? "User"}</div>
                    <div className="text-xs text-muted-foreground">{ticket.user_email ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="mb-2"><PriorityBadge p={ticket.priority} /></div>
                    <select
                      aria-label={`Priority for ${ticket.ticket_no}`}
                      disabled={saving === `${ticket.id}:priority`}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      value={ticket.priority}
                      onChange={(event) => void changePriority(ticket, event.target.value as TicketPriority)}
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="mb-2"><StatusBadge status={ticket.status} /></div>
                    <select
                      aria-label={`Status for ${ticket.ticket_no}`}
                      disabled={saving === `${ticket.id}:status`}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                      value={ticket.status}
                      onChange={(event) => void changeStatus(ticket, event.target.value as TicketStatus)}
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In progress</option>
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {isSystemAdmin ? (
                      <div className="space-y-2">
                        <select
                          aria-label={`Assignee for ${ticket.ticket_no}`}
                          disabled={saving === `${ticket.id}:assign`}
                          className="max-w-[190px] rounded-md border border-border bg-background px-2 py-1 text-xs"
                          value={ticket.assigned_to ?? ""}
                          onChange={(event) => void changeAssignee(ticket, event.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {admins.map((admin) => (
                            <option key={admin.id} value={admin.id}>{admin.name}</option>
                          ))}
                        </select>
                        {!!ticket.assigned_to && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 gap-1 px-2 text-xs text-destructive"
                            disabled={saving === `${ticket.id}:assign`}
                            onClick={() => void revoke(ticket)}
                          >
                            <UserRoundX className="h-3.5 w-3.5" /> Revoke
                          </Button>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">{ticket.assigned_name ?? "You"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {!!ticket.is_unread ? (
                      <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                        <span className="h-2 w-2 rounded-full bg-primary" /> Unread
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Read</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
