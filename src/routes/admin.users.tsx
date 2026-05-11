import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RequireAuth } from "@/components/require-auth";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }] }),
  component: () => <RequireAuth admin><AdminUsers /></RequireAuth>,
});

type Profile = { id: string; full_name: string | null; email: string | null; created_at: string };
type RoleRow = { user_id: string; role: "admin" | "agent" | "user" };

const roleCls: Record<string, string> = {
  admin: "bg-primary/15 text-primary",
  agent: "bg-info/15 text-info",
  user: "bg-muted text-muted-foreground",
};

function AdminUsers() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<Record<string, RoleRow["role"][]>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: r }, { data: c }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email, created_at"),
        supabase.from("user_roles").select("user_id, role"),
        supabase.from("complaints").select("user_id"),
      ]);
      setProfiles((p ?? []) as Profile[]);
      const rmap: typeof roles = {};
      ((r ?? []) as RoleRow[]).forEach((x) => { (rmap[x.user_id] ??= []).push(x.role); });
      setRoles(rmap);
      const cmap: typeof counts = {};
      ((c ?? []) as { user_id: string }[]).forEach((x) => { cmap[x.user_id] = (cmap[x.user_id] ?? 0) + 1; });
      setCounts(cmap);
      setLoading(false);
    })();
  }, []);

  return (
    <DashboardLayout
      variant="admin"
      title="User management"
      breadcrumbs={[{ label: "Admin" }, { label: "Users" }]}
    >
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3 font-medium">User</th>
                <th className="px-6 py-3 font-medium">Roles</th>
                <th className="px-6 py-3 font-medium">Complaints</th>
                <th className="px-6 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading && <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">Loading…</td></tr>}
              {!loading && profiles.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">No users yet.</td></tr>}
              {profiles.map((u) => {
                const name = u.full_name || u.email || "User";
                const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
                const userRoles = roles[u.id] ?? ["user"];
                return (
                  <tr key={u.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9"><AvatarFallback className="bg-accent text-accent-foreground text-xs">{initials}</AvatarFallback></Avatar>
                        <div>
                          <div className="font-medium">{name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex flex-wrap gap-1">
                        {userRoles.map((r) => (
                          <span key={r} className={`rounded-md px-2 py-0.5 text-xs font-semibold ${roleCls[r]}`}>{r}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-3">{counts[u.id] ?? 0}</td>
                    <td className="px-6 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-4 text-xs text-muted-foreground">
        Tip: to grant admin or agent access, insert a row into <code className="rounded bg-muted px-1">user_roles</code> from the database panel.
      </p>
    </DashboardLayout>
  );
}
