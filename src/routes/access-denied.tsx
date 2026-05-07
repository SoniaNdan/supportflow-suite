import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

export const Route = createFileRoute("/access-denied")({
  head: () => ({ meta: [{ title: "Access denied — ResolveDesk" }] }),
  component: () => (
    <div className="grid min-h-screen place-items-center bg-hero-gradient px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-destructive/10 text-destructive">
          <ShieldOff className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">You don't have permission to view this page. Contact your administrator if you believe this is a mistake.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="outline" asChild><Link to="/dashboard">Back to dashboard</Link></Button>
          <Button asChild><Link to="/">Go home</Link></Button>
        </div>
      </div>
    </div>
  ),
});
