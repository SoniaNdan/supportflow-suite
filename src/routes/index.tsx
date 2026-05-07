import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNavbar } from "@/components/site-navbar";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight, Inbox, BarChart3, Users, ShieldCheck, Zap, Bell,
  CheckCircle2, MessageSquare, Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResolveDesk — Modern Complaint & Ticket Management" },
      { name: "description", content: "Track, triage, and resolve customer complaints in one beautifully simple workspace." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: Inbox, title: "Unified Inbox", desc: "Every complaint, ticket, and reply in one organized place." },
  { icon: BarChart3, title: "Real-time Analytics", desc: "Track SLAs, resolution time, and team performance live." },
  { icon: Users, title: "Team Collaboration", desc: "Assign, comment, and resolve tickets together effortlessly." },
  { icon: Bell, title: "Smart Notifications", desc: "Stay on top of priorities with intelligent alerts." },
  { icon: ShieldCheck, title: "Role-based Access", desc: "Granular permissions for users, agents, and admins." },
  { icon: Zap, title: "Fast Workflows", desc: "Bulk actions, filters, and shortcuts that save hours." },
];

function Landing() {
  return (
    <div className="min-h-screen">
      <SiteNavbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-hero-gradient">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> New: AI-assisted ticket triage
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Resolve complaints, <span className="text-gradient">delight customers.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
              ResolveDesk is the modern complaint and ticket management workspace built for teams who care about response time and customer experience.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild className="shadow-glow">
                <Link to="/register">Start free <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/dashboard">View live demo</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Free 14-day trial</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> No credit card required</span>
            </div>
          </div>

          {/* Hero preview card */}
          <div className="relative mx-auto mt-16 max-w-5xl">
            <div className="rounded-2xl border border-border bg-card/80 p-2 shadow-elegant backdrop-blur">
              <div className="rounded-xl border border-border bg-background">
                <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                  <span className="ml-3 text-xs text-muted-foreground">resolvedesk.app/dashboard</span>
                </div>
                <div className="grid gap-4 p-6 md:grid-cols-4">
                  {[
                    { l: "Open", v: "128", c: "text-info" },
                    { l: "In Progress", v: "47", c: "text-warning" },
                    { l: "Resolved", v: "1,204", c: "text-success" },
                    { l: "Avg Resp", v: "1.8h", c: "text-primary" },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl border border-border p-4">
                      <div className="text-xs text-muted-foreground">{s.l}</div>
                      <div className={`mt-1 text-2xl font-bold ${s.c}`}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl font-bold tracking-tight">Everything you need to ship great support</h2>
          <p className="mt-3 text-muted-foreground">A complete toolkit, thoughtfully designed.</p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="group p-6 transition-all hover:-translate-y-0.5 hover:shadow-elegant">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="border-y border-border bg-card/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-4xl font-bold tracking-tight">Built for teams that move fast</h2>
            <p className="mt-4 text-muted-foreground">
              We obsessed over the details so your team can focus on customers, not on tooling. From keyboard shortcuts to intelligent filters, every interaction is crafted.
            </p>
            <ul className="mt-6 space-y-3">
              {["SLA tracking with breach alerts", "Customizable workflows & automations", "Mobile-first responsive design", "Audit trail & compliance ready"].map((i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" /> {i}
                </li>
              ))}
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { v: "98%", l: "Customer satisfaction" },
              { v: "1.8h", l: "Avg response time" },
              { v: "12k+", l: "Tickets resolved daily" },
              { v: "240+", l: "Teams trust us" },
            ].map((s) => (
              <Card key={s.l} className="p-6">
                <div className="text-3xl font-bold text-gradient">{s.v}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.l}</div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <MessageSquare className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-4xl font-bold tracking-tight">Get in touch</h2>
        <p className="mt-3 text-muted-foreground">Questions? We typically reply within an hour during business hours.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild><Link to="/register">Start free trial</Link></Button>
          <Button size="lg" variant="outline">Talk to sales</Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
