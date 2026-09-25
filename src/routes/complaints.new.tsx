import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilePlus2, Paperclip } from "lucide-react";
import { useState } from "react";
import { RequireAuth } from "@/components/require-auth";
import { createTicket, type TicketPriority } from "@/lib/tickets-api";
import { toast } from "sonner";

export const Route = createFileRoute("/complaints/new")({
  head: () => ({ meta: [{ title: "New complaint — ResolveDesk" }] }),
  component: () => (
    <RequireAuth>
      <NewComplaint />
    </RequireAuth>
  ),
});

const CATEGORIES = ["Billing", "Account", "Technical", "Feature Request", "Other"];

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "The complaint could not be submitted.";
}

function NewComplaint() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("medium");
  const [desc, setDesc] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const max = 5000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !category || !desc.trim()) {
      toast.error("Please fill in subject, category, and description");
      return;
    }

    setSubmitting(true);
    try {
      const ticket = await createTicket({
        subject: subject.trim(),
        category,
        priority,
        description: desc.trim(),
        attachment,
      });
      toast.success(`Complaint ${ticket.ticket_no} submitted`);
      navigate({ to: "/complaints/$id", params: { id: ticket.ticket_no } });
    } catch (error) {
      toast.error(messageOf(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardLayout
      title="Submit a complaint"
      breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "New complaint" }]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value.slice(0, 200))}
                placeholder="Brief summary of your issue"
                maxLength={200}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <div className="flex gap-2">
                  {(["low", "medium", "high", "urgent"] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold capitalize transition-colors ${
                        priority === p
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <span
                  className={`text-xs ${desc.length > max * 0.9 ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {desc.length} / {max}
                </span>
              </div>
              <Textarea
                rows={7}
                placeholder="Provide detailed information so we can help quickly…"
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, max))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaint-attachment">Attachment (optional)</Label>
              <Input
                id="complaint-attachment"
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp,application/pdf,text/plain,.doc,.docx"
                onChange={(e) => setAttachment(e.target.files?.[0] ?? null)}
              />
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" /> Up to 5 MB. Images, PDF, text, DOC or DOCX.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: "/complaints" })}
              >
                Cancel
              </Button>
              <Button type="submit" className="shadow-glow" disabled={submitting}>
                <FilePlus2 className="mr-2 h-4 w-4" />{" "}
                {submitting ? "Submitting…" : "Submit complaint"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit p-6">
          <h3 className="font-semibold">Tips for faster resolution</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>• Be specific about what happened</li>
            <li>• Include error messages or steps</li>
            <li>• Mention what you expected vs. what occurred</li>
            <li>• Attach a screenshot or document when useful</li>
            <li>• Choose the right priority for your case</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
