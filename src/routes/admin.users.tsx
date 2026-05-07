import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, UserPlus, MoreHorizontal } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: AdminUsers,
});

const users = [
  { name: "Jane Doe", email: "jane@acme.com", role: "User", tickets: 12, status: "Active", initials: "JD" },
  { name: "Alex Morgan", email: "alex@resolvedesk.com", role: "Admin", tickets: 0, status: "Active", initials: "AM" },
  { name: "Sara Kim", email: "sara@resolvedesk.com", role: "Agent", tickets: 0, status: "Active", initials: "SK" },
  { name: "Ravi Patel", email: "ravi@northpeak.io", role: "User", tickets: 5, status: "Active", initials: "RP" },
  { name: "Mia Ortiz", email: "mia@studio.co", role: "User", tickets: 3, status: "Suspended", initials: "MO" },
  { name: "Liam Chen", email: "liam@hello.dev", role: "User", tickets: 8, status: "Active", initials: "LC" },
];

const roleCls: Record<string, string> = {
  Admin: "bg-primary/15 text-primary",
  Agent: "bg-info/15 text-info",
  User: "bg-muted text-muted-foreground",
};

function AdminUsers() {
  return (
    <DashboardLayout
      variant="admin"
      title="User management"
      breadcrumbs={[{ label: "Admin" }, { label: "Users" }]}
      actions={<Button className="shadow-glow"><UserPlus className="mr-2 h-4 w-4" />Add user</Button>}
    >
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search users…" className="pl-9" />
          </div>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option>All roles</option><option>Admin</option><option>Agent</option><option>User</option>
          </select>
          <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
            <option>All statuses</option><option>Active</option><option>Suspended</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Tickets</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.email} className="transition-colors hover:bg-muted/30">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{u.initials}</AvatarFallback></Avatar>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3"><span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${roleCls[u.role]}`}>{u.role}</span></td>
                  <td className="px-6 py-3">{u.tickets}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs ${u.status === "Active" ? "text-success" : "text-destructive"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === "Active" ? "bg-success" : "bg-destructive"}`} /> {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-3"><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
