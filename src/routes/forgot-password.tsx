import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — ResolveDesk" }] }),
  component: () => (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send a reset link."
      footer={<><Link to="/login" className="font-semibold text-primary hover:underline">Back to sign in</Link></>}
    >
      <form className="space-y-4">
        <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@company.com" /></div>
        <Button className="w-full shadow-glow" asChild><Link to="/reset-password">Send reset link</Link></Button>
      </form>
    </AuthShell>
  ),
});
