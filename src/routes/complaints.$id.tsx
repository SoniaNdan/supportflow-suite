import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Paperclip, Send, CheckCircle2, Clock, MessageSquare, FileText } from "lucide-react";

export const Route = createFileRoute("/complaints/$id")({
  head: () => ({ meta: [{ title: "Complaint details — ResolveDesk" }] }),
  component: Details,
});

const timeline = [
  { icon: FileText, label: "Complaint submitted", time: "Nov 12, 09:14", done: true },
  { icon: MessageSquare, label: "Assigned to Alex Morgan", time: "Nov 12, 09:42", done: true },
  { icon: Clock, label: "In progress", time: "Nov 12, 11:08", done: true, current: true },
  { icon: CheckCircle2, label: "Resolved", time: "Pending", done: false },
];

function Details() {
  const { id } = Route.useParams();
  return (
    <DashboardLayout
      title={`Complaint ${id}`}
      breadcrumbs={[{ label: "Complaints", to: "/complaints" }, { label: id }]}
      actions={<Button variant="outline">Mark as resolved</Button>}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-xs text-muted-foreground">{id}</div>
                <h2 className="mt-1 text-xl font-bold">Cannot access my account after password reset</h2>
              </div>
              <div className="flex gap-2">
                <PriorityBadge p="high" />
                <StatusBadge status="in_progress" />
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              I requested a password reset yesterday and successfully changed my password, but when I try to log in, I'm getting an "invalid credentials" error. I've tried clearing my cache and using a different browser, but the issue persists.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-xs">
              <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">screenshot-error.png</span>
              <span className="text-muted-foreground">· 248 KB</span>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold">Conversation</h3>
            <div className="mt-5 space-y-5">
              {[
                { name: "Jane Doe", role: "You", initials: "JD", time: "09:14", text: "Hi team, I'm locked out after the reset. Help please!", you: true },
                { name: "Alex Morgan", role: "Support Admin", initials: "AM", time: "09:42", text: "Hi Jane — thanks for reporting. I've cleared the auth cache on our end. Could you try logging in again from an incognito window?", you: false },
                { name: "Jane Doe", role: "You", initials: "JD", time: "10:55", text: "Same error. Attaching another screenshot.", you: true },
              ].map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.you ? "flex-row-reverse" : ""}`}>
                  <Avatar className="h-9 w-9"><AvatarFallback className={m.you ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}>{m.initials}</AvatarFallback></Avatar>
                  <div className={`max-w-[80%] ${m.you ? "items-end text-right" : ""} flex flex-col gap-1`}>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{m.name}</span> · {m.role} · {m.time}
                    </div>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm ${m.you ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <Textarea rows={3} placeholder="Write a reply…" />
              <div className="mt-3 flex items-center justify-between">
                <Button variant="ghost" size="sm"><Paperclip className="mr-2 h-4 w-4" />Attach</Button>
                <Button className="shadow-glow"><Send className="mr-2 h-4 w-4" />Send reply</Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold">Status timeline</h3>
            <ol className="mt-5 space-y-5">
              {timeline.map((t, i) => (
                <li key={i} className="flex gap-3">
                  <div className={`grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border ${
                    t.done ? "border-primary bg-primary text-primary-foreground" : "border-border bg-muted text-muted-foreground"
                  } ${t.current ? "ring-4 ring-primary/20" : ""}`}>
                    <t.icon className="h-4 w-4" />
                  </div>
                  <div className="pt-1">
                    <div className="text-sm font-medium">{t.label}</div>
                    <div className="text-xs text-muted-foreground">{t.time}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold">Details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                ["Category", "Account"],
                ["Assigned to", "Alex Morgan"],
                ["Created", "Nov 12, 09:14"],
                ["Last updated", "10:55"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
