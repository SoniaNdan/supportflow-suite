import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, AlertCircle, Inbox, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ResolveDesk" }] }),
  component: () => <RequireAuth><Notifications /></RequireAuth>,
});

type N = {
  id: string;
  type: string;
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

const filters = ["All", "Unread", "Read"] as const;
type Filter = typeof filters[number];

function iconFor(type: string) {
  if (type === "reply_posted") return MessageSquare;
  if (type === "status_changed") return AlertCircle;
  return Inbox;
}
function colorFor(type: string) {
  if (type === "reply_posted") return "text-info";
  if (type === "status_changed") return "text-warning";
  return "text-primary";
}
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<N[]>([]);
  const [active, setActive] = useState<Filter>("All");
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) toast.error(error.message);
    setItems((data ?? []) as N[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`notifications-stream:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => load(),
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const visible = useMemo(() => {
    if (active === "Unread") return items.filter((n) => !n.is_read);
    if (active === "Read") return items.filter((n) => n.is_read);
    return items;
  }, [items, active]);

  const unreadCount = items.filter((n) => !n.is_read).length;

  async function setRead(id: string, is_read: boolean) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, is_read } : n)));
    const { error } = await supabase.from("notifications").update({ is_read }).eq("id", id);
    if (error) { toast.error(error.message); load(); }
  }

  async function markAllRead() {
    if (unreadCount === 0) return;
    const ids = items.filter((n) => !n.is_read).map((n) => n.id);
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    const { error } = await supabase.from("notifications").update({ is_read: true }).in("id", ids);
    if (error) { toast.error(error.message); load(); }
    else toast.success("All notifications marked as read");
  }

  async function remove(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
    const { error } = await supabase.from("notifications").delete().eq("id", id);
    if (error) { toast.error(error.message); load(); }
  }

  function open(n: N) {
    if (!n.is_read) setRead(n.id, true);
    if (n.link) navigate({ to: n.link });
  }

  return (
    <DashboardLayout
      title="Notifications"
      breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Notifications" }]}
      actions={
        <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
          Mark all as read{unreadCount > 0 ? ` (${unreadCount})` : ""}
        </Button>
      }
    >
      <Card>
        <div className="flex items-center gap-1 border-b border-border p-3">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                active === f ? "bg-accent font-medium text-accent-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {f}
              {f === "Unread" && unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-3 h-7 w-7" />
            {active === "Unread" ? "You're all caught up!" : "No notifications yet."}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {visible.map((n) => {
              const Icon = iconFor(n.type);
              return (
                <li
                  key={n.id}
                  className={`group flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/30 ${
                    !n.is_read ? "bg-accent/20" : ""
                  }`}
                >
                  <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-muted ${colorFor(n.type)}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <button onClick={() => open(n)} className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{n.title}</h3>
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    {n.message && <p className="mt-0.5 truncate text-sm text-muted-foreground">{n.message}</p>}
                  </button>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</span>
                    <button
                      onClick={() => setRead(n.id, !n.is_read)}
                      className="rounded-md px-2 py-1 text-xs text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                      title={n.is_read ? "Mark as unread" : "Mark as read"}
                    >
                      {n.is_read ? "Unread" : "Read"}
                    </button>
                    <button
                      onClick={() => remove(n.id)}
                      className="rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </DashboardLayout>
  );
}
