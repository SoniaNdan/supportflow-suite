import { cn } from "@/lib/utils";

type Status = "open" | "in_progress" | "resolved" | "closed" | "pending";
const map: Record<Status, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-info/15 text-info border-info/30" },
  in_progress: { label: "In Progress", cls: "bg-warning/15 text-warning border-warning/30" },
  resolved: { label: "Resolved", cls: "bg-success/15 text-success border-success/30" },
  closed: { label: "Closed", cls: "bg-muted text-muted-foreground border-border" },
  pending: { label: "Pending", cls: "bg-accent text-accent-foreground border-accent" },
};

export function StatusBadge({ status }: { status: Status }) {
  const m = map[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", m.cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  );
}

export function PriorityBadge({ p }: { p: "low" | "medium" | "high" | "urgent" }) {
  const cls = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-info/15 text-info",
    high: "bg-warning/15 text-warning",
    urgent: "bg-destructive/15 text-destructive",
  }[p];
  return <span className={cn("rounded-md px-2 py-0.5 text-xs font-semibold capitalize", cls)}>{p}</span>;
}
