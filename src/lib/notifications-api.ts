import { apiRequest } from "@/lib/api";

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

type PhpNotification = Omit<NotificationItem, "is_read"> & {
  is_read: boolean | number | string;
};

type NotificationsResponse = {
  items: PhpNotification[];
  unread: number;
};

type NotificationMutationResponse = {
  success: true;
  unread: number;
};

function normalize(item: PhpNotification): NotificationItem {
  return {
    ...item,
    id: Number(item.id),
    message: item.message ?? "",
    is_read: item.is_read === true || item.is_read === 1 || item.is_read === "1",
  };
}

export async function fetchNotifications(): Promise<{
  items: NotificationItem[];
  unread: number;
}> {
  const response = await apiRequest<NotificationsResponse>("/api/notifications");
  return {
    items: response.items.map(normalize),
    unread: Number(response.unread),
  };
}

export async function markNotificationRead(id: number): Promise<number> {
  const response = await apiRequest<NotificationMutationResponse>(`/api/notifications/${id}/read`, {
    method: "POST",
  });
  return response.unread;
}

export async function markAllNotificationsRead(): Promise<number> {
  const response = await apiRequest<NotificationMutationResponse>("/api/notifications/read-all", {
    method: "POST",
  });
  return response.unread;
}

export function ticketNumberFromNotification(item: NotificationItem): string | null {
  const match = `${item.title} ${item.message}`.match(/TKT-[A-Z0-9-]+/i);
  return match?.[0]?.toUpperCase() ?? null;
}

export function emitNotificationsChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("resolvedesk:notifications-changed"));
  }
}
