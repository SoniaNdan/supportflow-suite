import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// React routes stay on the frontend origin. PHP is addressed only through api.ts.
const frontendBasePath = (import.meta.env.VITE_FRONTEND_BASE_PATH ?? "/").replace(/\/$/, "") || "/";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    basepath: frontendBasePath,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });

  return router;
};
