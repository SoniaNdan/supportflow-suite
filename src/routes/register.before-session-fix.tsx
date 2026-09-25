import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthShell } from "@/components/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/register/before-session-fix")({
  head: () => ({
    meta: [{ title: "Create account — ResolveDesk" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent,
  ) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error(
        "Password must be at least 8 characters",
      );
      return;
    }

    setLoading(true);

    try {
      await apiRequest(
        "/api/auth/register",
        {
          method: "POST",
          data: {
            name: fullName,
            email,
            password,
          },
        },
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create the account.",
      );
      return;
    } finally {
      setLoading(false);
    }

    toast.success(
      "Account created! You can now sign in.",
    );

    navigate({
      to: "/login",
    });
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking and resolving complaints in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-primary hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        <div className="space-y-2">
          <Label>Full name</Label>

          <Input
            required
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            placeholder="Jane Doe"
          />
        </div>

        <div className="space-y-2">
          <Label>Email</Label>

          <Input
            type="email"
            required
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="you@company.com"
          />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>

          <Input
            type="password"
            required
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="At least 8 characters"
          />
        </div>

        <Button
          type="submit"
          className="w-full shadow-glow"
          disabled={loading}
        >
          {loading
            ? "Creating…"
            : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}
