import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sun, Moon, Monitor, User, Lock, Bell, Palette } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/components/theme-provider";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — ResolveDesk" }] }),
  component: SettingsPage,
});

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
];

function SettingsPage() {
  const [tab, setTab] = useState("profile");
  const { theme, toggle } = useTheme();

  return (
    <DashboardLayout title="Settings" breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Settings" }]}>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit p-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                tab === t.id ? "bg-accent text-accent-foreground font-medium" : "hover:bg-muted"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </Card>

        <div className="space-y-6">
          {tab === "profile" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">Update your personal information.</p>
              <div className="mt-6 flex items-center gap-4">
                <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary text-primary-foreground text-lg">JD</AvatarFallback></Avatar>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Change photo</Button>
                  <Button variant="ghost" size="sm" className="text-destructive">Remove</Button>
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>First name</Label><Input defaultValue="Jane" /></div>
                <div className="space-y-2"><Label>Last name</Label><Input defaultValue="Doe" /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Email</Label><Input defaultValue="jane@acme.com" /></div>
                <div className="space-y-2 sm:col-span-2"><Label>Bio</Label><Input defaultValue="Product manager at Acme" /></div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="outline">Cancel</Button>
                <Button className="shadow-glow">Save changes</Button>
              </div>
            </Card>
          )}

          {tab === "password" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Change password</h2>
              <p className="text-sm text-muted-foreground">Use a strong password you don't reuse.</p>
              <div className="mt-6 space-y-4">
                <div className="space-y-2"><Label>Current password</Label><Input type="password" /></div>
                <div className="space-y-2"><Label>New password</Label><Input type="password" /></div>
                <div className="space-y-2"><Label>Confirm new password</Label><Input type="password" /></div>
              </div>
              <div className="mt-6 flex justify-end"><Button className="shadow-glow">Update password</Button></div>
            </Card>
          )}

          {tab === "notifications" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">Choose what to be notified about.</p>
              <div className="mt-6 space-y-4">
                {[
                  ["New replies on my tickets", true],
                  ["Status changes", true],
                  ["Weekly summary email", false],
                  ["Marketing emails", false],
                ].map(([l, v]) => (
                  <div key={l as string} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <span className="text-sm font-medium">{l}</span>
                    <Switch defaultChecked={v as boolean} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === "appearance" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">Customize how ResolveDesk looks for you.</p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Light", icon: Sun, active: theme === "light" },
                  { id: "dark", label: "Dark", icon: Moon, active: theme === "dark" },
                  { id: "system", label: "System", icon: Monitor, active: false },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { if ((m.id === "light" && theme === "dark") || (m.id === "dark" && theme === "light")) toggle(); }}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-colors ${
                      m.active ? "border-primary bg-accent" : "border-border hover:bg-muted"
                    }`}
                  >
                    <m.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
