import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, CheckCircle2, AlertCircle, Inbox } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — ResolveDesk" }] }),
  component: Notifications,
});

const items = [
  { icon: MessageSquare, title: "Alex Morgan replied to TKT-2041", desc: "I've cleared the auth cache on our end…", time: "2m ago", unread: true, color: "text-info" },
  { icon: CheckCircle2, title: "TKT-2031 was resolved", desc: "Your feature request was added to the roadmap.", time: "1h ago", unread: true, color: "text-success" },
  { icon: AlertCircle, title: "Priority on TKT-2039 raised to Urgent", desc: "Admin updated the priority level.", time: "3h ago", unread: true, color: "text-warning" },
  { icon: Inbox, title: "Weekly summary is ready", desc: "You resolved 8 tickets this week. Great job!", time: "Yesterday", unread: false, color: "text-primary" },
  { icon: MessageSquare, title: "Sara Kim mentioned you in TKT-2024", desc: "@jane could you confirm the invoice details?", time: "2d ago", unread: false, color: "text-info" },
];

const filters = ["All", "Unread", "Mentions", "System"] as const;

function Notifications() {
  const [active, setActive] = useState<typeof filters[number]>("All");
  return (
    <DashboardLayout
      title="Notifications"
      breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Notifications" }]}
      actions={<Button variant="outline">Mark all as read</Button>}
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
            >{f}</button>
          ))}
        </div>
        <ul className="divide-y divide-border">
          {items.map((n, i) => (
            <li key={i} className={`flex items-start gap-4 px-6 py-4 transition-colors hover:bg-muted/30 ${n.unread ? "bg-accent/20" : ""}`}>
              <div className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-muted ${n.color}`}>
                <n.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{n.title}</h3>
                  {n.unread && <span className="h-2 w-2 rounded-full bg-primary" />}
                </div>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">{n.desc}</p>
              </div>
              <span className="flex-shrink-0 text-xs text-muted-foreground">{n.time}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-border p-10 text-center text-sm text-muted-foreground">
          <Bell className="mx-auto mb-2 h-6 w-6" />
          You're all caught up!
        </div>
      </Card>
    </DashboardLayout>
  );
}
