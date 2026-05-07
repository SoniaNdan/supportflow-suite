import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — ResolveDesk" }] }),
  component: () => (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your ResolveDesk workspace."
      footer={<>Don't have an account? <Link to="/register" className="font-semibold text-primary hover:underline">Create one</Link></>}
    >
      <form className="space-y-4">
        <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@company.com" /></div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Password</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link>
          </div>
          <Input type="password" placeholder="••••••••" />
        </div>
        <label className="flex items-center gap-2 text-sm"><Checkbox /> Remember me for 30 days</label>
        <Button className="w-full shadow-glow" asChild><Link to="/dashboard">Sign in</Link></Button>
        <Button variant="outline" className="w-full" type="button">Continue with Google</Button>
      </form>
    </AuthShell>
  ),
});
