import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "update_complaint_status",
  title: "Update complaint status",
  description:
    "Change the status and/or priority of a complaint ticket. Requires staff permissions in the app.",
  inputSchema: {
    complaint_id: z.string().describe("Complaint UUID."),
    status: z
      .enum(["open", "in_progress", "pending", "resolved", "closed"])
      .optional()
      .describe("New status."),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional().describe("New priority."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ complaint_id, status, priority }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    if (!status && !priority)
      return { content: [{ type: "text", text: "Provide status or priority." }], isError: true };
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("complaints")
      .update({ ...(status ? { status } : {}), ...(priority ? { priority } : {}) })
      .eq("id", complaint_id)
      .select("id, ticket_no, status, priority, updated_at");
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data?.length)
      return {
        content: [
          { type: "text", text: "No ticket updated — it does not exist or you lack permission." },
        ],
        isError: true,
      };
    return {
      content: [{ type: "text", text: JSON.stringify(data[0], null, 2) }],
      structuredContent: { complaint: data[0] },
    };
  },
});
