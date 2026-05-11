import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Search, FilePlus2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/complaints/")({
  head: () => ({ meta: [{ title: "My complaints — ResolveDesk" }] }),
  component: () => <RequireAuth><MyComplaints /></RequireAuth>,
});

const filters = ["All", "Open", "In Progress", "Pending", "Resolved", "Closed"] as const;
const statusMap: Record<string, string> = {
  All: "", Open: "open", "In Progress": "in_progress", Pending: "pending", Resolved: "resolved", Closed: "closed",
};

type Row = {
  id: string; ticket_no: string; subject: string; category: string;
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
};

function MyComplaints() {
  const { user } = useAuth();
  const [active, setActive] = useState<typeof filters[number]>("All");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("complaints")
      .select("id, ticket_no, subject, category, status, priority, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setRows((data ?? []) as Row[]);
        setLoading(false);
      });
  }, [user]);

  const filtered = useMemo(() => {
    const want = statusMap[active];
    return rows.filter((r) => {
      if (want && r.status !== want) return false;
      if (search && !`${r.ticket_no} ${r.subject}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [rows, active, search]);

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
            <Input placeholder="Search by subject or ID…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
              {loading && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                  No complaints yet. <Link to="/complaints/new" className="text-primary hover:underline">Submit your first one</Link>.
                </td></tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id} className="cursor-pointer transition-colors hover:bg-muted/30">
                  <td className="px-6 py-4">
                    <Link to="/complaints/$id" params={{ id: t.ticket_no }} className="block">
                      <div className="font-mono text-xs text-muted-foreground">{t.ticket_no}</div>
                      <div className="mt-0.5 font-medium">{t.subject}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{t.category}</td>
                  <td className="px-6 py-4"><PriorityBadge p={t.priority} /></td>
                  <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                  <td className="px-6 py-4 text-muted-foreground">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
