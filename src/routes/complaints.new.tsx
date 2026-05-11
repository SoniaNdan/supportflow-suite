import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilePlus2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { RequireAuth } from "@/components/require-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/complaints/new")({
  head: () => ({ meta: [{ title: "New complaint — ResolveDesk" }] }),
  component: () => <RequireAuth><NewComplaint /></RequireAuth>,
});

const CATEGORIES = ["Billing", "Account", "Technical", "Feature Request", "Other"];
type Priority = "low" | "medium" | "high" | "urgent";

function NewComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const max = 1000;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!subject.trim() || !category || !desc.trim()) {
      toast.error("Please fill in subject, category, and description");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase
      .from("complaints")
      .insert({ user_id: user.id, subject, category, priority, description: desc })
      .select("ticket_no")
      .single();
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success(`Complaint ${data.ticket_no} submitted`);
    navigate({ to: "/complaints/$id", params: { id: data.ticket_no } });
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
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue" required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                        priority === p ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-muted"
                      }`}
                    >{p}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Description</Label>
                <span className={`text-xs ${desc.length > max * 0.9 ? "text-destructive" : "text-muted-foreground"}`}>{desc.length} / {max}</span>
              </div>
              <Textarea
                rows={6}
                placeholder="Provide detailed information so we can help quickly…"
                value={desc}
                onChange={(e) => setDesc(e.target.value.slice(0, max))}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => navigate({ to: "/complaints" })}>Cancel</Button>
              <Button type="submit" className="shadow-glow" disabled={submitting}>
                <FilePlus2 className="mr-2 h-4 w-4" /> {submitting ? "Submitting…" : "Submit complaint"}
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
            <li>• Choose the right priority for your case</li>
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
}
