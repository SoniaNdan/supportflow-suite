import { Link } from "@tanstack/react-router";
import { MessageSquareWarning } from "lucide-react";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <Link to="/" className="mb-10 flex items-center gap-2 font-display font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-info text-primary-foreground shadow-glow">
            <MessageSquareWarning className="h-5 w-5" />
          </span>
          ResolveDesk
        </Link>
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
        </div>
      </div>
      <div className="relative hidden overflow-hidden bg-hero-gradient lg:block">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12">
          <blockquote className="max-w-md rounded-2xl border border-border bg-card/70 p-6 shadow-elegant backdrop-blur">
            <p className="text-base font-medium">"ResolveDesk cut our average resolution time in half. The team adopted it in a week."</p>
            <footer className="mt-4 text-sm text-muted-foreground">— Priya S., Head of Operations</footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
