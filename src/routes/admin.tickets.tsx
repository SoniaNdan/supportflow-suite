import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Search, Filter, Download, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/admin/tickets")({
  head: () => ({ meta: [{ title: "Tickets — Admin" }] }),
  component: AdminTickets,
});

const data = [
  { id: "TKT-2042", subject: "Payment processing failed for premium plan", user: "Jane Doe", category: "Billing", status: "open" as const, priority: "urgent" as const, assigned: "Unassigned" },
  { id: "TKT-2041", subject: "Cannot access account after password reset", user: "Mia Ortiz", category: "Account", status: "in_progress" as const, priority: "high" as const, assigned: "Alex M." },
  { id: "TKT-2039", subject: "Refund for order #88421", user: "Sara Kim", category: "Billing", status: "in_progress" as const, priority: "urgent" as const, assigned: "Alex M." },
  { id: "TKT-2036", subject: "API rate limit incorrectly applied", user: "Ravi Patel", category: "Technical", status: "open" as const, priority: "high" as const, assigned: "Sara K." },
  { id: "TKT-2031", subject: "Feature request: dark mode for mobile", user: "Liam Chen", category: "Feature", status: "resolved" as const, priority: "low" as const, assigned: "Sara K." },
  { id: "TKT-2024", subject: "Invoice not generated correctly", user: "Noah Lee", category: "Billing", status: "pending" as const, priority: "medium" as const, assigned: "Alex M." },
];

function AdminTickets() {
  return (
    <DashboardLayout
      variant="admin"
      title="Ticket management"
      breadcrumbs={[{ label: "Admin" }, { label: "Tickets" }]}
      actions={
        <div className="flex gap-2">
          <Button variant="outline"><Download className="mr-2 h-4 w-4" />Export</Button>
          <Button className="shadow-glow">Bulk assign</Button>
        </div>
      }
    >
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tickets, users, categories…" className="pl-9" />
          </div>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option>All statuses</option><option>Open</option><option>In progress</option><option>Resolved</option>
          </select>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option>All priorities</option><option>Urgent</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />More</Button>
        </div>

        <div className="flex items-center justify-between border-b border-border bg-accent/30 px-6 py-2 text-sm">
          <div className="flex items-center gap-3">
            <Checkbox /> <span>2 selected</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost">Assign</Button>
            <Button size="sm" variant="ghost">Change status</Button>
            <Button size="sm" variant="ghost" className="text-destructive">Delete</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 w-10"><Checkbox /></th>
                <th className="px-4 py-3 font-medium">Ticket</th>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Assigned</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3"><Checkbox /></td>
                  <td className="px-4 py-3">
                    <div className="font-mono text-xs text-muted-foreground">{t.id}</div>
                    <div className="font-medium">{t.subject}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.user}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.category}</td>
                  <td className="px-4 py-3"><PriorityBadge p={t.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-sm">{t.assigned}</td>
                  <td className="px-4 py-3"><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
