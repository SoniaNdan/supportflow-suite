import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  FilePlus2,
  Bell,
  Settings,
  Users,
  ShieldCheck,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  MessageSquareWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "./theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  emitNotificationsChanged,
  fetchNotifications,
  markNotificationRead,
  ticketNumberFromNotification,
  type NotificationItem,
} from "@/lib/notifications-api";

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
  { to: "/admin/users", icon: Users, label: "Users", systemOnly: true },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

interface Props {
  children: React.ReactNode;
  variant?: "user" | "admin";
  title?: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: React.ReactNode;
}

function shortTime(iso: string): string {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function DashboardLayout({
  children,
  variant = "user",
  title,
  breadcrumbs,
  actions,
}: Props) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { theme, toggle } = useTheme();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const { user, isStaff, isSystemAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const nav =
    variant === "admin" ? adminNav.filter((item) => !item.systemOnly || isSystemAdmin) : userNav;
  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const refreshNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const data = await fetchNotifications();
      setNotifications(data.items.slice(0, 5));
      setUnreadCount(data.unread);
    } catch {
      // Header notification failure should not block the rest of the application.
    }
  }, [user]);

  useEffect(() => {
    void refreshNotifications();
    const onChanged = () => void refreshNotifications();
    window.addEventListener("resolvedesk:notifications-changed", onChanged);
    const timer = window.setInterval(() => void refreshNotifications(), 30000);
    return () => {
      window.removeEventListener("resolvedesk:notifications-changed", onChanged);
      window.clearInterval(timer);
    };
  }, [refreshNotifications]);

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/login" });
  }

  async function openNotification(item: NotificationItem) {
    if (!item.is_read) {
      try {
        await markNotificationRead(item.id);
        emitNotificationsChanged();
      } catch {
        // Navigation can still continue if marking the notification fails.
      }
    }

    const ticketNo = ticketNumberFromNotification(item);
    if (ticketNo) {
      navigate({ to: "/complaints/$id", params: { id: ticketNo } });
    } else {
      navigate({ to: "/notifications" });
    }
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform border-r border-sidebar-border bg-sidebar transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-info text-primary-foreground">
              <MessageSquareWarning className="h-4 w-4" />
            </span>
            ResolveDesk
          </Link>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-5 w-5" />
          </button>
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
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.to === "/notifications" && unreadCount > 0 && (
                  <span className="ml-auto rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-semibold text-destructive-foreground">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}

          <div className="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Switch
          </div>
          {isStaff && (
            <Link
              to={variant === "admin" ? "/dashboard" : "/admin"}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent/60"
            >
              <ShieldCheck className="h-4 w-4" />
              {variant === "admin" ? "User View" : "Admin View"}
            </Link>
          )}
        </nav>

        <div className="absolute bottom-4 left-3 right-3 rounded-xl border border-sidebar-border bg-card p-3">
          <div className="text-xs font-semibold">Need help?</div>
          <p className="mt-1 text-xs text-muted-foreground">Check our docs or contact support.</p>
          <Button size="sm" variant="outline" className="mt-2 w-full">
            View docs
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur sm:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
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
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-destructive px-1 text-center text-[10px] font-bold leading-4 text-destructive-foreground">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {unreadCount > 0 && <Badge variant="secondary">{unreadCount} new</Badge>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onSelect={() => void openNotification(item)}
                      className="flex cursor-pointer flex-col items-start gap-1 py-3"
                    >
                      <span className="flex w-full items-center gap-2 text-sm">
                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                        {!item.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
                      </span>
                      <span className="line-clamp-1 text-xs text-muted-foreground">
                        {item.message || shortTime(item.created_at)}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/notifications" className="w-full justify-center text-sm">
                    View all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm sm:inline">{displayName}</span>
                  <ChevronDown className="hidden h-4 w-4 sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.email ?? "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => void handleSignOut()} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <div className="flex flex-col gap-1 px-4 pb-2 pt-6 sm:px-8">
          {breadcrumbs && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {breadcrumbs.map((breadcrumb, index) => (
                <span key={index} className="flex items-center gap-2">
                  {breadcrumb.to ? (
                    <Link to={breadcrumb.to} className="hover:text-foreground">
                      {breadcrumb.label}
                    </Link>
                  ) : (
                    <span>{breadcrumb.label}</span>
                  )}
                  {index < breadcrumbs.length - 1 && <span>/</span>}
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

      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
