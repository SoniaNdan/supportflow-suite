import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "create_complaint",
  title: "Create complaint",
  description: "Submit a new complaint ticket on behalf of the signed-in user.",
  inputSchema: {
    subject: z.string().describe("Short summary of the issue."),
    description: z.string().describe("Full details of the issue."),
    category: z.string().describe("Category, e.g. Billing, Technical, Account, Service."),
    priority: z
      .enum(["low", "medium", "high", "urgent"])
      .optional()
      .describe("Priority (defaults to medium)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ subject, description, category, priority }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("complaints")
      .insert({
        user_id: ctx.getUserId()!,
        subject: subject.trim(),
        description: description.trim(),
        category: category.trim(),
        ...(priority ? { priority } : {}),
      })
      .select("id, ticket_no, subject, status, priority, created_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Created ${data.ticket_no}: ${data.subject}` }],
      structuredContent: { complaint: data },
    };
  },
});
