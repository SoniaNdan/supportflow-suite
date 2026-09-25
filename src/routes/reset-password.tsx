import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword, validateResetToken } from "@/lib/password-reset-api";

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : "",
  }),
  head: () => ({ meta: [{ title: "Set new password — ResolveDesk" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const { token } = Route.useSearch();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [validating, setValidating] = useState(true);
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!token) {
      setValid(false);
      setValidating(false);
      return;
    }
    void validateResetToken(token)
      .then((result) => {
        if (!cancelled) setValid(result);
      })
      .catch(() => {
        if (!cancelled) setValid(false);
      })
      .finally(() => {
        if (!cancelled) setValidating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const message = await resetPassword(token, password, confirmation);
      toast.success(message);
      navigate({ to: "/login" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return <AuthShell title="Checking reset link" subtitle="Please wait…"><div className="text-sm text-muted-foreground">Validating…</div></AuthShell>;
  }

  if (!valid) {
    return (
      <AuthShell title="Reset link unavailable" subtitle="This password reset link is invalid, expired, or has already been used.">
        <Button asChild className="w-full">
          <Link to="/forgot-password">Request a new reset link</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a password of at least eight characters.">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="reset-password">New password</Label>
          <Input id="reset-password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reset-confirmation">Confirm new password</Label>
          <Input id="reset-confirmation" type="password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </div>
        <Button type="submit" className="w-full shadow-glow" disabled={loading}>
          {loading ? "Saving…" : "Update password"}
        </Button>
      </form>
    </AuthShell>
  );
}
