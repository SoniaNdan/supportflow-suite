import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "mark_notification_read",
  title: "Mark notification read/unread",
  description:
    "Mark one notification as read or unread, or mark every notification as read at once.",
  inputSchema: {
    notification_id: z.string().optional().describe("Notification UUID. Omit with all=true."),
    all: z.boolean().optional().describe("Mark all of the user's notifications as read."),
    is_read: z.boolean().optional().describe("Target read state (defaults to true)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ notification_id, all, is_read }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const target = is_read ?? true;
    if (all) {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: target })
        .eq("user_id", ctx.getUserId()!);
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
      return { content: [{ type: "text", text: `All notifications marked ${target ? "read" : "unread"}.` }] };
    }
    if (!notification_id)
      return { content: [{ type: "text", text: "Provide notification_id or all=true." }], isError: true };
    const { data, error } = await supabase
      .from("notifications")
      .update({ is_read: target })
      .eq("id", notification_id)
      .select("id, is_read");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data?.length)
      return { content: [{ type: "text", text: "Notification not found." }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data[0]) }],
      structuredContent: { notification: data[0] },
    };
  },
});
