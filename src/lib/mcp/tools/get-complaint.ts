import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "get_complaint",
  title: "Get complaint",
  description: "Fetch one complaint ticket with its full reply thread, by ticket number or id.",
  inputSchema: {
    ticket_no: z.string().optional().describe("Ticket number, e.g. TCK-0007."),
    id: z.string().optional().describe("Complaint UUID."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ ticket_no, id }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    if (!ticket_no && !id)
      return { content: [{ type: "text", text: "Provide ticket_no or id." }], isError: true };
    const supabase = supabaseForUser(ctx);
    let query = supabase.from("complaints").select("*").limit(1);
    query = id ? query.eq("id", id) : query.eq("ticket_no", ticket_no!);
    const { data: rows, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const complaint = rows?.[0];
    if (!complaint)
      return { content: [{ type: "text", text: "Complaint not found or not visible to you." }], isError: true };
    const { data: replies, error: replyError } = await supabase
      .from("complaint_replies")
      .select("id, message, user_id, created_at")
      .eq("complaint_id", complaint.id)
      .order("created_at", { ascending: true });
    if (replyError)
      return { content: [{ type: "text", text: replyError.message }], isError: true };
    const payload = { complaint, replies: replies ?? [] };
    return {
      content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
      structuredContent: payload,
    };
  },
});
