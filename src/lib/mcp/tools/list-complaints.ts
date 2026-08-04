import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser, unauthenticated } from "../supabase";

export default defineTool({
  name: "list_complaints",
  title: "List complaints",
  description:
    "List complaint tickets visible to the signed-in user, optionally filtered by status or priority.",
  inputSchema: {
    status: z
      .enum(["open", "in_progress", "pending", "resolved", "closed"])
      .optional()
      .describe("Only return tickets with this status."),
    priority: z
      .enum(["low", "medium", "high", "urgent"])
      .optional()
      .describe("Only return tickets with this priority."),
    search: z.string().optional().describe("Case-insensitive match on subject."),
    limit: z.number().int().optional().describe("Max rows to return (default 20, max 100)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, priority, search, limit }, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();
    const take = Math.min(Math.max(limit ?? 20, 1), 100);
    const supabase = supabaseForUser(ctx);
    let query = supabase
      .from("complaints")
      .select("id, ticket_no, subject, category, status, priority, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(take);
    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (search) query = query.ilike("subject", `%${search}%`);
    const { data, error } = await query;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? [], null, 2) }],
      structuredContent: { complaints: data ?? [] },
    };
  },
});
