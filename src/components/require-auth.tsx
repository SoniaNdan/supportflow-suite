import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export function RequireAuth({ children, staff = false, admin = false }: { children: React.ReactNode; staff?: boolean; admin?: boolean }) {
  const { loading, session, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) {
      navigate({ to: "/login" });
      return;
    }
    if (admin && !isAdmin) navigate({ to: "/access-denied" });
    else if (staff && !isStaff) navigate({ to: "/access-denied" });
  }, [loading, session, isAdmin, isStaff, admin, staff, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (admin && !isAdmin) return null;
  if (staff && !isStaff) return null;
  return <>{children}</>;
}
