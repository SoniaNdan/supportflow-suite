import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — ResolveDesk" }] }),
  component: () => (
    <AuthShell
      title="Create your account"
      subtitle="Start resolving tickets in under a minute."
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link></>}
    >
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2"><Label>First name</Label><Input placeholder="Jane" /></div>
          <div className="space-y-2"><Label>Last name</Label><Input placeholder="Doe" /></div>
        </div>
        <div className="space-y-2"><Label>Work email</Label><Input type="email" placeholder="jane@company.com" /></div>
        <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="At least 8 characters" /></div>
        <p className="text-xs text-muted-foreground">By creating an account you agree to our Terms and Privacy Policy.</p>
        <Button className="w-full shadow-glow" asChild><Link to="/dashboard">Create account</Link></Button>
      </form>
    </AuthShell>
  ),
});
