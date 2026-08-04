import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "add_reply",
  title: "Reply to a complaint",
  description: "Post a reply message on a complaint ticket thread.",
  inputSchema: {
    complaint_id: z.string().describe("Complaint UUID (from list_complaints or get_complaint)."),
    message: z.string().describe("Reply body."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ complaint_id, message }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("complaint_replies")
      .insert({ complaint_id, user_id: ctx.getUserId()!, message: message.trim() })
      .select("id, complaint_id, message, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: "Reply posted." }],
      structuredContent: { reply: data },
    };
  },
});
