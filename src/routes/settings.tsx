import { createFileRoute } from "@tanstack/react-router";
import { Bell, Lock, Moon, Palette, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/dashboard-layout";
import { RequireAuth } from "@/components/require-auth";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { changePassword, fetchSettings, updateProfile } from "@/lib/settings-api";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — ResolveDesk" }] }),
  component: () => (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  ),
});

const tabs = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
] as const;

type TabId = (typeof tabs)[number]["id"];

function SettingsPage() {
  const [tab, setTab] = useState<TabId>("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, refreshSession } = useAuth();

  useEffect(() => {
    let cancelled = false;
    void fetchSettings()
      .then((settingsUser) => {
        if (cancelled) return;
        setName(settingsUser.name);
        setEmail(settingsUser.email);
      })
      .catch((error) => {
        if (!cancelled) toast.error(error instanceof Error ? error.message : "Unable to load settings.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = name || user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({ name, email });
      await refreshSession();
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation password do not match.");
      return;
    }

    setSavingPassword(true);
    try {
      const message = await changePassword({ currentPassword, newPassword, confirmPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success(message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to change password.");
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <DashboardLayout
      title="Settings"
      breadcrumbs={[{ label: "Dashboard", to: "/dashboard" }, { label: "Settings" }]}
    >
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit p-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                tab === item.id ? "bg-accent font-medium text-accent-foreground" : "hover:bg-muted"
              }`}
            >
              <item.icon className="h-4 w-4" /> {item.label}
            </button>
          ))}
        </Card>

        <div className="space-y-6">
          {tab === "profile" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Profile</h2>
              <p className="text-sm text-muted-foreground">Update the account details stored in ResolveDesk.</p>
              <div className="mt-6 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-lg text-primary-foreground">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{displayName}</div>
                  <div className="text-sm text-muted-foreground">{email || user?.email}</div>
                </div>
              </div>
              <form className="mt-6 space-y-4" onSubmit={saveProfile}>
                <div className="space-y-2">
                  <Label htmlFor="settings-name">Full name</Label>
                  <Input id="settings-name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">Email</Label>
                  <Input id="settings-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="shadow-glow" disabled={savingProfile}>
                    {savingProfile ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {tab === "password" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Change password</h2>
              <p className="text-sm text-muted-foreground">Your current password is required before a new one is stored.</p>
              <form className="mt-6 space-y-4" onSubmit={savePassword}>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input id="current-password" type="password" required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input id="new-password" type="password" required minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input id="confirm-password" type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="shadow-glow" disabled={savingPassword}>
                    {savingPassword ? "Updating…" : "Update password"}
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {tab === "notifications" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <p className="text-sm text-muted-foreground">
                ResolveDesk automatically notifies you about ticket replies, status changes and assignment events that apply to your account.
              </p>
              <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4 text-sm">
                Notification delivery rules are managed by the ticket workflow in this MVP. There are no per-user delivery preferences to save yet.
              </div>
            </Card>
          )}

          {tab === "appearance" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold">Appearance</h2>
              <p className="text-sm text-muted-foreground">Choose the interface theme for this browser.</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { id: "light", label: "Light", icon: Sun, active: theme === "light" },
                  { id: "dark", label: "Dark", icon: Moon, active: theme === "dark" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      if ((mode.id === "light" && theme === "dark") || (mode.id === "dark" && theme === "light")) toggle();
                    }}
                    className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-colors ${
                      mode.active ? "border-primary bg-accent" : "border-border hover:bg-muted"
                    }`}
                  >
                    <mode.icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{mode.label}</span>
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
