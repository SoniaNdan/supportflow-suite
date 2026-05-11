import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import {
  LayoutDashboard, Inbox, FilePlus2, Bell, Settings, Users, ShieldCheck,
  Search, Menu, X, Sun, Moon, ChevronDown, LogOut, MessageSquareWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

const userNav = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/complaints/new", icon: FilePlus2, label: "New Complaint" },
  { to: "/complaints", icon: Inbox, label: "My Complaints" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings", icon: Settings, label: "Settings" },
];
const adminNav = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview" },
  { to: "/admin/tickets", icon: Inbox, label: "Tickets" },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

interface Props {
  children: React.ReactNode;
  variant?: "user" | "admin";
  title?: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: React.ReactNode;
}

export function DashboardLayout({ children, variant = "user", title, breadcrumbs, actions }: Props) {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { user, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  const nav = variant === "admin" ? adminNav : userNav;
  const displayName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "User";
  const initials = displayName.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-info text-primary-foreground">
              <MessageSquareWarning className="h-4 w-4" />
            </span>
            ResolveDesk
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <nav className="space-y-1 p-3">
          <div className="px-3 pb-2 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {variant === "admin" ? "Admin" : "Workspace"}
          </div>
          {nav.map((item) => {
            const active = path === item.to || (item.to !== "/" && path.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          <div className="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Switch</div>
          {isStaff && (
            <Link to={variant === "admin" ? "/dashboard" : "/admin"} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/60">
              <ShieldCheck className="h-4 w-4" />
              {variant === "admin" ? "User View" : "Admin View"}
            </Link>
          )}
        </nav>
        <div className="absolute bottom-4 left-3 right-3 rounded-xl border border-sidebar-border bg-card p-3">
          <div className="text-xs font-semibold">Need help?</div>
          <p className="mt-1 text-xs text-muted-foreground">Check our docs or contact support.</p>
          <Button size="sm" variant="outline" className="mt-2 w-full">View docs</Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search tickets, users…" className="pl-9" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications <Badge variant="secondary">3 new</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {[
                  { t: "Ticket #2041 was resolved", s: "2m ago" },
                  { t: "New reply from Admin on #2039", s: "1h ago" },
                  { t: "Your password was changed", s: "Yesterday" },
                ].map((n) => (
                  <DropdownMenuItem key={n.t} className="flex flex-col items-start gap-1 py-3">
                    <span className="text-sm">{n.t}</span>
                    <span className="text-xs text-muted-foreground">{n.s}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/notifications" className="w-full text-center text-sm">View all</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary text-primary-foreground">{initials}</AvatarFallback></Avatar>
                  <span className="hidden text-sm sm:inline">{displayName}</span>
                  <ChevronDown className="hidden h-4 w-4 sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.email ?? "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild><Link to="/settings">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex flex-col gap-1 px-4 pb-2 pt-6 sm:px-8">
          {breadcrumbs && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-2">
                  {b.to ? <Link to={b.to} className="hover:text-foreground">{b.label}</Link> : <span>{b.label}</span>}
                  {i < breadcrumbs.length - 1 && <span>/</span>}
                </span>
              ))}
            </div>
          )}
          {(title || actions) && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              {title && <h1 className="text-2xl font-bold tracking-tight">{title}</h1>}
              {actions}
            </div>
          )}
        </div>

        <main className="flex-1 px-4 pb-10 pt-4 sm:px-8">{children}</main>
      </div>

      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  );
}
