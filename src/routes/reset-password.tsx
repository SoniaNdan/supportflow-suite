import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — ResolveDesk" }] }),
  component: () => (
    <AuthShell title="Set a new password" subtitle="Choose a strong password you haven't used before.">
      <form className="space-y-4">
        <div className="space-y-2"><Label>New password</Label><Input type="password" placeholder="••••••••" /></div>
        <div className="space-y-2"><Label>Confirm password</Label><Input type="password" placeholder="••••••••" /></div>
        <Button className="w-full shadow-glow" asChild><Link to="/login">Update password</Link></Button>
      </form>
    </AuthShell>
  ),
});
