import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/complaints/$id")({
  head: () => ({ meta: [{ title: "Complaint details — ResolveDesk" }] }),
  component: () => <RequireAuth><Details /></RequireAuth>,
});

type Complaint = {
  id: string; ticket_no: string; subject: string; description: string; category: string;
  status: "open" | "in_progress" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  user_id: string; created_at: string; updated_at: string;
};
type Reply = { id: string; user_id: string; message: string; created_at: string };

const STATUSES: Complaint["status"][] = ["open", "in_progress", "pending", "resolved", "closed"];

function Details() {
  const { id } = Route.useParams();
  const { user, isStaff } = useAuth();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; email: string | null }>>({});
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    const { data: c } = await supabase.from("complaints").select("*").eq("ticket_no", id).maybeSingle();
    if (!c) { setLoading(false); return; }
    setComplaint(c as Complaint);
    const { data: r } = await supabase
      .from("complaint_replies")
      .select("*")
      .eq("complaint_id", c.id)
      .order("created_at");
    const reps = (r ?? []) as Reply[];
    setReplies(reps);
    const ids = Array.from(new Set([c.user_id, ...reps.map((x) => x.user_id)]));
    const { data: p } = await supabase.from("profiles").select("id, full_name, email").in("id", ids);
    const map: typeof profiles = {};
    (p ?? []).forEach((x: { id: string; full_name: string | null; email: string | null }) => {
      map[x.id] = { full_name: x.full_name, email: x.email };
    });
    setProfiles(map);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function sendReply() {
    if (!complaint || !user || !reply.trim()) return;
    setSending(true);
    const { error } = await supabase.from("complaint_replies").insert({
      complaint_id: complaint.id, user_id: user.id, message: reply.trim(),
    });
    setSending(false);
    if (error) return toast.error(error.message);
    setReply("");
    load();
  }

  async function changeStatus(s: Complaint["status"]) {
    if (!complaint) return;
    const { error } = await supabase.from("complaints").update({ status: s }).eq("id", complaint.id);
    if (error) return toast.error(error.message);
    toast.success("Status updated");
    setComplaint({ ...complaint, status: s });
  }

  if (loading) return <DashboardLayout title="Loading…"><div className="text-muted-foreground">Loading…</div></DashboardLayout>;
  if (!complaint) return <DashboardLayout title="Not found"><Card className="p-8 text-center text-muted-foreground">Complaint not found.</Card></DashboardLayout>;

  const nameOf = (uid: string) => profiles[uid]?.full_name || profiles[uid]?.email || "User";
  const initialsOf = (uid: string) => nameOf(uid).split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  return (
    <DashboardLayout
      variant={isStaff ? "admin" : "user"}
      title={`Complaint ${complaint.ticket_no}`}
      breadcrumbs={[{ label: "Complaints", to: isStaff ? "/admin/tickets" : "/complaints" }, { label: complaint.ticket_no }]}
      actions={
        isStaff && (
          <select
            value={complaint.status}
            onChange={(e) => changeStatus(e.target.value as Complaint["status"])}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        )
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-mono text-xs text-muted-foreground">{complaint.ticket_no}</div>
                <h2 className="mt-1 text-xl font-bold">{complaint.subject}</h2>
              </div>
              <div className="flex gap-2">
                <PriorityBadge p={complaint.priority} />
                <StatusBadge status={complaint.status} />
              </div>
            </div>
            <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">{complaint.description}</p>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold">Conversation</h3>
            <div className="mt-5 space-y-5">
              {replies.length === 0 && <p className="text-sm text-muted-foreground">No replies yet.</p>}
              {replies.map((m) => {
                const mine = m.user_id === user?.id;
                return (
                  <div key={m.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className={mine ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}>
                        {initialsOf(m.user_id)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`max-w-[80%] ${mine ? "items-end text-right" : ""} flex flex-col gap-1`}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{mine ? "You" : nameOf(m.user_id)}</span>
                        · {new Date(m.created_at).toLocaleString()}
                      </div>
                      <div className={`rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        {m.message}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <Textarea rows={3} placeholder="Write a reply…" value={reply} onChange={(e) => setReply(e.target.value)} />
              <div className="mt-3 flex items-center justify-end">
                <Button className="shadow-glow" onClick={sendReply} disabled={sending || !reply.trim()}>
                  <Send className="mr-2 h-4 w-4" />{sending ? "Sending…" : "Send reply"}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold">Details</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row k="Category" v={complaint.category} />
              <Row k="Priority" v={complaint.priority} />
              <Row k="Status" v={complaint.status.replace("_", " ")} />
              <Row k="Submitted by" v={nameOf(complaint.user_id)} />
              <Row k="Created" v={new Date(complaint.created_at).toLocaleString()} />
              <Row k="Last update" v={new Date(complaint.updated_at).toLocaleString()} />
            </dl>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="font-medium capitalize text-right">{v}</dd>
    </div>
  );
}
