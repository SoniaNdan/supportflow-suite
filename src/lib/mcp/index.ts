import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listComplaints from "./tools/list-complaints";
import getComplaint from "./tools/get-complaint";
import createComplaint from "./tools/create-complaint";
import addReply from "./tools/add-reply";
import updateComplaintStatus from "./tools/update-complaint-status";
import listNotifications from "./tools/list-notifications";
import markNotificationRead from "./tools/mark-notification-read";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "supportflow-suite",
  title: "SupportFlow Suite",
  version: "0.1.0",
  instructions:
    "Tools for the ResolveDesk complaint & ticket management app. Use list_complaints/get_complaint to read tickets, create_complaint to file one, add_reply to respond, update_complaint_status for staff triage, and the notification tools to read or clear the signed-in user's notifications.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listComplaints,
    getComplaint,
    createComplaint,
    addReply,
    updateComplaintStatus,
    listNotifications,
    markNotificationRead,
  ],
});
