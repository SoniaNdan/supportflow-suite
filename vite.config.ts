import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// ResolveDesk local frontend configuration.
// The optional Lovable MCP Vite plugin is intentionally disabled for local
// Windows development because it currently fails route-path validation.
// This does not affect ResolveDesk authentication, tickets, admin,
// notifications, settings, or the PHP/MySQL API integration.
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
