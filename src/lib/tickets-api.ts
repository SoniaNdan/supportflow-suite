import { apiRequest, PHP_API_BASE_URL } from "@/lib/api";

export type TicketStatus = "open" | "in_progress" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type TicketSummary = {
  id: number;
  ticket_no: string;
  subject: string;
  category: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at?: string;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  assigned_to?: number | null;
  assigned_name?: string | null;
  is_unread?: number | boolean;
};

export type TicketDetail = TicketSummary & {
  description: string;
  user_id: number;
  user_name: string;
  user_email: string;
  attachment_path?: string | null;
  updated_at: string;
};

export type TicketReply = {
  id: number;
  ticket_id: number;
  user_id: number;
  user_name: string;
  user_role: "user" | "admin";
  message: string;
  attachment_path?: string | null;
  is_internal_note?: number | boolean;
  created_at: string;
};

type PhpTicket = Omit<TicketDetail, "subject"> & { title: string };
type TicketSearchResponse = { tickets: PhpTicket[] };
type TicketDetailResponse = { ticket: PhpTicket; replies: TicketReply[] };
type TicketMutationResponse = { success: true; ticket: PhpTicket };
type ReplyMutationResponse = { success: true; reply: TicketReply | null };

export type TicketFilters = {
  status?: TicketStatus | "";
  priority?: TicketPriority | "";
  q?: string;
  assignedTo?: number | "";
};

function fromPhpTicket({ title, ...ticket }: PhpTicket): TicketDetail {
  return { ...ticket, subject: title };
}

export function backendFileUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${PHP_API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function fetchTickets(filters: TicketFilters = {}): Promise<TicketSummary[]> {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.assignedTo !== undefined && filters.assignedTo !== "") {
    params.set("assigned_to", String(filters.assignedTo));
  }

  const query = params.toString();
  const response = await apiRequest<TicketSearchResponse>(
    `/api/tickets/search${query ? `?${query}` : ""}`,
  );
  return response.tickets.map(fromPhpTicket);
}

export async function fetchTicket(
  ticketNo: string,
): Promise<{ ticket: TicketDetail; replies: TicketReply[] }> {
  const response = await apiRequest<TicketDetailResponse>(
    `/api/tickets/${encodeURIComponent(ticketNo)}`,
  );
  return { ticket: fromPhpTicket(response.ticket), replies: response.replies };
}

export async function createTicket(input: {
  subject: string;
  category: string;
  priority: TicketPriority;
  description: string;
  attachment?: File | null;
}): Promise<TicketDetail> {
  const formData = new FormData();
  formData.set("title", input.subject);
  formData.set("category", input.category);
  formData.set("priority", input.priority);
  formData.set("description", input.description);
  if (input.attachment) formData.set("attachment", input.attachment);

  const response = await apiRequest<TicketMutationResponse>("/api/tickets", {
    method: "POST",
    formData,
  });
  return fromPhpTicket(response.ticket);
}

export async function replyToTicket(
  ticketNo: string,
  input: { message: string; attachment?: File | null },
): Promise<TicketReply | null> {
  const formData = new FormData();
  formData.set("message", input.message);
  if (input.attachment) formData.set("attachment", input.attachment);

  const response = await apiRequest<ReplyMutationResponse>(
    `/api/tickets/${encodeURIComponent(ticketNo)}/reply`,
    { method: "POST", formData },
  );
  return response.reply;
}

export async function updateTicketStatus(
  ticketNo: string,
  status: TicketStatus,
): Promise<TicketDetail> {
  const response = await apiRequest<TicketMutationResponse>(
    `/api/tickets/${encodeURIComponent(ticketNo)}/status`,
    { method: "POST", data: { status } },
  );
  return fromPhpTicket(response.ticket);
}
