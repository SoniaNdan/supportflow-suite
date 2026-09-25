import { apiRequest } from "@/lib/api";
import type { BackendUser } from "@/hooks/use-auth";

export type SettingsUser = BackendUser & { status: "active" | "suspended" };

type SettingsResponse = { user: SettingsUser };
type ProfileResponse = { success: true; user: BackendUser };
type MessageResponse = { success: true; message: string };

export async function fetchSettings(): Promise<SettingsUser> {
  const response = await apiRequest<SettingsResponse>("/api/settings");
  return response.user;
}

export async function updateProfile(input: { name: string; email: string }): Promise<BackendUser> {
  const response = await apiRequest<ProfileResponse>("/api/settings/profile", {
    method: "POST",
    data: input,
  });
  return response.user;
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<string> {
  const response = await apiRequest<MessageResponse>("/api/settings/password", {
    method: "POST",
    data: {
      current_password: input.currentPassword,
      new_password: input.newPassword,
      confirm_password: input.confirmPassword,
    },
  });
  return response.message;
}
