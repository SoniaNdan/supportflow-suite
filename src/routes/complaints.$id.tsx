import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge, PriorityBadge } from "@/components/status-badge";
import { ExternalLink, Paperclip, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";
import {
  backendFileUrl,
  fetchTicket,
  replyToTicket,
  updateTicketStatus,
  type TicketDetail,
  type TicketReply,
  type TicketStatus,
} from "@/lib/tickets-api";
import { toast } from "sonner";

export const Route = createFileRoute("/complaints/$id")({
  head: () => ({ meta: [{ title: "Complaint details — ResolveDesk" }] }),
  component: () => (
    <RequireAuth>
      <Details />
    </RequireAuth>
  ),
});

const STATUSES: TicketStatus[] = ["open", "in_progress", "pending", "resolved", "closed"];

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

function Details() {
  const { id } = Route.useParams();
  const { user, isStaff } = useAuth();
  const [complaint, setComplaint] = useState<TicketDetail | null>(null);
  const [replies, setReplies] = useState<TicketReply[]>([]);
  const [reply, setReply] = useState("");
  const [replyAttachment, setReplyAttachment] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchTicket(id);
      setComplaint(data.ticket);
      setReplies(data.replies);
    } catch (error) {
      setComplaint(null);
      setReplies([]);
      setLoadError(messageOf(error));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function sendReply() {
    if (!complaint || !reply.trim()) return;
    setSending(true);
    try {
      await replyToTicket(complaint.ticket_no, {
        message: reply.trim(),
        attachment: replyAttachment,
      });
      setReply("");
      setReplyAttachment(null);
      setFileInputKey((value) => value + 1);
      await load();
      toast.success("Reply posted");
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setSending(false);
    }
  }

  async function changeStatus(status: TicketStatus) {
    if (!complaint || status === complaint.status) return;
    setChangingStatus(true);
    try {
      const updated = await updateTicketStatus(complaint.ticket_no, status);
      setComplaint(updated);
      toast.success("Status updated");
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setChangingStatus(false);
    }
  }

  if (loading) {
    return (
      <DashboardLayout title="Loading…">
        <div className="text-muted-foreground">Loading complaint…</div>
      </DashboardLayout>
    );
  }

  if (!complaint) {
    return (
      <DashboardLayout title="Complaint unavailable">
        <Card className="p-8 text-center text-muted-foreground">
          {loadError ?? "Complaint not found."}
        </Card>
      </DashboardLayout>
    );
  }

  const ticketAttachment = backendFileUrl(complaint.attachment_path);
  const replyName = (item: TicketReply) =>
    item.user_name || (item.user_role === "admin" ? "Support team" : "User");
  const initials = (name: string) =>
    name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <DashboardLayout
      variant={isStaff ? "admin" : "user"}
      title={`Complaint ${complaint.ticket_no}`}
      breadcrumbs={[
        { label: "Complaints", to: isStaff ? "/admin/tickets" : "/complaints" },
        { label: complaint.ticket_no },
      ]}
      actions={
        isStaff && (
          <select
            value={complaint.status}
            disabled={changingStatus}
            onChange={(e) => void changeStatus(e.target.value as TicketStatus)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm disabled:opacity-60"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
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
            <p className="mt-4 whitespace-pre-wrap text-sm text-muted-foreground">
              {complaint.description}
            </p>
            {ticketAttachment && (
              <a
                href={ticketAttachment}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Paperclip className="h-4 w-4" /> View submitted attachment{" "}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold">Conversation</h3>
            <div className="mt-5 space-y-5">
              {replies.length === 0 && (
                <p className="text-sm text-muted-foreground">No replies yet.</p>
              )}
              {replies.map((item) => {
                const mine = item.user_id === user?.id;
                const displayName = replyName(item);
                const replyAttachmentUrl = backendFileUrl(item.attachment_path);
                return (
                  <div key={item.id} className={`flex gap-3 ${mine ? "flex-row-reverse" : ""}`}>
                    <Avatar className="h-9 w-9">
                      <AvatarFallback
                        className={
                          mine
                            ? "bg-primary text-primary-foreground"
                            : "bg-accent text-accent-foreground"
                        }
                      >
                        {initials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex max-w-[80%] flex-col gap-1 ${mine ? "items-end text-right" : ""}`}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">
                          {mine ? "You" : displayName}
                        </span>
                        · {new Date(item.created_at).toLocaleString()}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm ${mine ? "bg-primary text-primary-foreground" : "bg-muted"}`}
                      >
                        <div className="whitespace-pre-wrap">{item.message}</div>
                        {replyAttachmentUrl && (
                          <a
                            href={replyAttachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className={`mt-2 inline-flex items-center gap-1 text-xs font-medium underline ${mine ? "text-primary-foreground" : "text-primary"}`}
                          >
                            <Paperclip className="h-3.5 w-3.5" /> Attachment
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <Textarea
                rows={3}
                placeholder="Write a reply…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <div>
                  <Input
                    key={fileInputKey}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain,.doc,.docx"
                    onChange={(e) => setReplyAttachment(e.target.files?.[0] ?? null)}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Optional attachment, up to 5 MB.
                  </p>
                </div>
                <Button
                  className="shadow-glow"
                  onClick={() => void sendReply()}
                  disabled={sending || !reply.trim()}
                >
                  <Send className="mr-2 h-4 w-4" /> {sending ? "Sending…" : "Send reply"}
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
              <Row k="Submitted by" v={complaint.user_name || complaint.user_email} />
              <Row k="Assigned to" v={complaint.assigned_name || "Unassigned"} />
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
      <dd className="text-right font-medium capitalize">{v}</dd>
    </div>
  );
}
