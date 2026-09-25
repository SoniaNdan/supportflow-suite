import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, AlertCircle, Inbox } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import {
  emitNotificationsChanged,
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  ticketNumberFromNotification,
  type NotificationItem,
} from "@/lib/notifications-api";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ResolveDesk" }] }),
  component: () => (
    <RequireAuth>
      <Notifications />
    </RequireAuth>
  ),
});

const filters = ["All", "Unread", "Read"] as const;
type Filter = (typeof filters)[number];

function iconFor(item: NotificationItem) {
  const text = `${item.title} ${item.message}`.toLowerCase();
  if (text.includes("reply")) return MessageSquare;
  if (text.includes("status")) return AlertCircle;
  return Inbox;
}

function colorFor(item: NotificationItem) {
  const text = `${item.title} ${item.message}`.toLowerCase();
  if (text.includes("reply")) return "text-info";
  if (text.includes("status")) return "text-warning";
  return "text-primary";
}

function timeAgo(iso: string) {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

function Notifications() {
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [active, setActive] = useState<Filter>("All");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotifications();
      setItems(data.items);
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    if (active === "Unread") return items.filter((item) => !item.is_read);
    if (active === "Read") return items.filter((item) => item.is_read);
    return items;
  }, [items, active]);

  const unreadCount = items.filter((item) => !item.is_read).length;

  async function setRead(item: NotificationItem) {
    if (item.is_read) return;
    setItems((previous) =>
      previous.map((candidate) =>
        candidate.id === item.id ? { ...candidate, is_read: true } : candidate,
      ),
    );
    try {
      await markNotificationRead(item.id);
      emitNotificationsChanged();
    } catch (error) {
      toast.error(messageOf(error));
      await load();
    }
  }

  async function markAllRead() {
    if (unreadCount === 0) return;
    setItems((previous) => previous.map((item) => ({ ...item, is_read: true })));
    try {
      await markAllNotificationsRead();
      emitNotificationsChanged();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(messageOf(error));
      await load();
    }
  }

  async function open(item: NotificationItem) {
    await setRead(item);
    const ticketNo = ticketNumberFromNotification(item);
    if (ticketNo) {
      navigate({ to: "/complaints/$id", params: { id: ticketNo } });
    }
  }

  return (
    <DashboardLayout
      title="Notifications"
      breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Notifications" }]}
      actions={
        <Button variant="outline" onClick={() => void markAllRead()} disabled={unreadCount === 0}>
          Mark all as read{unreadCount > 0 ? ` (${unreadCount})` : ""}
        </Button>
      }
    >
      <Card>
        <div className="flex items-center gap-1 border-b border-border p-3">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActive(filter)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                active === filter
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {filter}
              {filter === "Unread" && unreadCount > 0 && (
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
            {visible.map((item) => {
              const Icon = iconFor(item);
              const ticketNo = ticketNumberFromNotification(item);
              return (
                <li
                  key={item.id}
                  className={`group flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/30 ${
                    !item.is_read ? "bg-accent/20" : ""
                  }`}
                >
                  <div
                    className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-muted ${colorFor(item)}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <button
                    onClick={() => void open(item)}
                    className="min-w-0 flex-1 text-left"
                    disabled={!ticketNo && item.is_read}
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{item.title}</h3>
                      {!item.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    </div>
                    {item.message && (
                      <p className="mt-0.5 text-sm text-muted-foreground">{item.message}</p>
                    )}
                  </button>
                  <div className="flex flex-shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(item.created_at)}
                    </span>
                    {!item.is_read && (
                      <button
                        onClick={() => void setRead(item)}
                        className="rounded-md px-2 py-1 text-xs text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                        title="Mark as read"
                      >
                        Read
                      </button>
                    )}
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
