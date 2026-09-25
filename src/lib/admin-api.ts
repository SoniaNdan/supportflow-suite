import { apiRequest } from "@/lib/api";
import {
  type TicketDetail,
  type TicketPriority,
} from "@/lib/tickets-api";

export type AdminStats = {
  total: number;
  unassigned: number;
  open: number;
  in_progress: number;
  pending: number;
  resolved: number;
  closed: number;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  admin_level: "system_admin" | "support_admin" | null;
  status: "active" | "suspended";
  created_at: string;
};

export type SupportAdmin = {
  id: number;
  name: string;
  email: string;
  admin_level: "support_admin";
};

type StatsResponse = { stats: AdminStats };
type UsersResponse = { users: AdminUser[] };
type SupportAdminsResponse = { admins: SupportAdmin[] };
type PhpTicket = Omit<TicketDetail, "subject"> & { title: string };
type TicketResponse = { success: true; ticket: PhpTicket };
type UserStatusResponse = { success: true; user: AdminUser };

function fromPhpTicket({ title, ...ticket }: PhpTicket): TicketDetail {
  return { ...ticket, subject: title };
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const response = await apiRequest<StatsResponse>("/api/dashboard/stats");
  return response.stats;
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const response = await apiRequest<UsersResponse>("/api/admin/users");
  return response.users;
}

export async function fetchSupportAdmins(): Promise<SupportAdmin[]> {
  const response = await apiRequest<SupportAdminsResponse>("/api/admin/support-admins");
  return response.admins;
}

export async function updateTicketPriority(
  ticketNo: string,
  priority: TicketPriority,
): Promise<TicketDetail> {
  const response = await apiRequest<TicketResponse>(
    `/api/admin/tickets/${encodeURIComponent(ticketNo)}/priority`,
    { method: "POST", data: { priority } },
  );
  return fromPhpTicket(response.ticket);
}

export async function assignTicket(
  ticketNo: string,
  assignedTo: number | null,
): Promise<TicketDetail> {
  const response = await apiRequest<TicketResponse>(
    `/api/admin/tickets/${encodeURIComponent(ticketNo)}/assign`,
    { method: "POST", data: { assigned_to: assignedTo ?? 0 } },
  );
  return fromPhpTicket(response.ticket);
}

export async function revokeTicketAssignment(ticketNo: string): Promise<TicketDetail> {
  const response = await apiRequest<TicketResponse>(
    `/api/admin/tickets/${encodeURIComponent(ticketNo)}/revoke`,
    { method: "POST" },
  );
  return fromPhpTicket(response.ticket);
}

export async function updateUserStatus(
  userId: number,
  status: "active" | "suspended",
): Promise<AdminUser> {
  const response = await apiRequest<UserStatusResponse>(`/api/admin/users/${userId}/status`, {
    method: "POST",
    data: { status },
  });
  return response.user;
}
