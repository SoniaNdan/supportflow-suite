import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Search, Filter, FilePlus2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/complaints/")({
  head: () => ({ meta: [{ title: "My complaints — ResolveDesk" }] }),
  component: MyComplaints,
});

const data = [
  { id: "TKT-2041", subject: "Cannot access my account after password reset", category: "Account", status: "in_progress" as const, priority: "high" as const, date: "Nov 12" },
  { id: "TKT-2039", subject: "Refund request for order #88421", category: "Billing", status: "open" as const, priority: "urgent" as const, date: "Nov 12" },
  { id: "TKT-2031", subject: "Feature request: dark mode for mobile", category: "Feature", status: "resolved" as const, priority: "low" as const, date: "Nov 11" },
  { id: "TKT-2024", subject: "Invoice not generated correctly", category: "Billing", status: "pending" as const, priority: "medium" as const, date: "Nov 10" },
  { id: "TKT-2018", subject: "App crashes on iOS 17 when opening reports", category: "Technical", status: "resolved" as const, priority: "high" as const, date: "Nov 9" },
  { id: "TKT-2009", subject: "Need invoice in EUR currency", category: "Billing", status: "closed" as const, priority: "low" as const, date: "Nov 7" },
];

const filters = ["All", "Open", "In Progress", "Resolved", "Closed"] as const;

function MyComplaints() {
  const [active, setActive] = useState<typeof filters[number]>("All");
  return (
    <DashboardLayout
      title="My complaints"
      breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "My complaints" }]}
      actions={<Button asChild className="shadow-glow"><Link to="/complaints/new"><FilePlus2 className="mr-2 h-4 w-4" />New</Link></Button>}
    >
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by subject or ID…" className="pl-9" />
          </div>
          <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  active === f ? "bg-background text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                }`}
              >{f}</button>
            ))}
          </div>
          <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" />More filters</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">Ticket</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((t) => (
                <tr key={t.id} className="cursor-pointer transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <Link to="/complaints/$id" params={{ id: t.id }} className="block">
                      <div className="font-mono text-xs text-muted-foreground">{t.id}</div>
                      <div className="mt-0.5 font-medium">{t.subject}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{t.category}</td>
                  <td className="px-6 py-4"><PriorityBadge p={t.priority} /></td>
                  <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-6 py-4 text-muted-foreground">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border px-6 py-3 text-sm">
          <span className="text-muted-foreground">Showing 1–6 of 24</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm"><ChevronLeft className="h-4 w-4" /></Button>
            {[1, 2, 3, 4].map((p) => (
              <Button key={p} size="sm" variant={p === 1 ? "default" : "outline"}>{p}</Button>
            ))}
            <Button variant="outline" size="sm"><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}
