import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, X, FilePlus2 } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/complaints/new")({
  head: () => ({ meta: [{ title: "New complaint — ResolveDesk" }] }),
  component: NewComplaint,
});

function NewComplaint() {
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("medium");
  const max = 1000;

  return (
    <DashboardLayout
      title="Submit a complaint"
      breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "New complaint" }]}
    >
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <form className="space-y-5">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input placeholder="Brief summary of your issue" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {["Billing", "Account", "Technical", "Feature Request", "Other"].map((c) => (
                      <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>
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
              />
            </div>
            <div className="space-y-2">
              <Label>Attachments</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:border-primary hover:bg-accent/30">
                <UploadCloud className="h-7 w-7 text-muted-foreground" />
                <span className="mt-2 text-sm font-medium">Click to upload or drag & drop</span>
                <span className="text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</span>
                <input type="file" multiple className="hidden" />
              </label>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm">
                <span className="truncate">screenshot-error.png · 248 KB</span>
                <button type="button" className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button">Save draft</Button>
              <Button className="shadow-glow"><FilePlus2 className="mr-2 h-4 w-4" /> Submit complaint</Button>
            </div>
          </form>
        </Card>

        <Card className="h-fit p-6">
          <h3 className="font-semibold">Tips for faster resolution</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li>• Be specific about what happened</li>
            <li>• Include error messages or screenshots</li>
            <li>• Mention steps to reproduce the issue</li>
            <li>• Choose the right priority for your case</li>
          </ul>
          <div className="mt-6 rounded-lg border border-border bg-accent/30 p-4 text-xs text-muted-foreground">
            Average response time for new complaints is <span className="font-semibold text-foreground">under 2 hours</span>.
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
