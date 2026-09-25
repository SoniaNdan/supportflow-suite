import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiRequest, clearCsrfToken } from "@/lib/api";

export type BackendRole = "user" | "admin";
export type AdminLevel = "system_admin" | "support_admin" | null;

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  role: BackendRole;
  admin_level: AdminLevel;
}

type SessionResponse = { authenticated: boolean; user: BackendUser | null };
type LoginResponse = { success: true; user: BackendUser };

interface AuthCtx {
  user: BackendUser | null;
  loading: boolean;
  isAdmin: boolean;
  isSystemAdmin: boolean;
  isSupportAdmin: boolean;
  isStaff: boolean;
  signIn: (email: string, password: string) => Promise<BackendUser>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<BackendUser | null>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<BackendUser | null> => {
    const session = await apiRequest<SessionResponse>("/api/auth/me");
    setUser(session.user);
    return session.user;
  }, []);

  useEffect(() => {
    refreshSession()
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [refreshSession]);

  async function signIn(email: string, password: string): Promise<BackendUser> {
    const response = await apiRequest<LoginResponse>("/api/auth/login", {
      method: "POST",
      data: { email, password },
    });
    setUser(response.user);
    return response.user;
  }

  async function signOut(): Promise<void> {
    await apiRequest("/api/auth/logout", { method: "POST" });
    clearCsrfToken();
    setUser(null);
  }

  const isAdmin = user?.role === "admin";
  const isSystemAdmin = isAdmin && user?.admin_level === "system_admin";
  const isSupportAdmin = isAdmin && user?.admin_level === "support_admin";

  const value: AuthCtx = {
    user,
    loading,
    isAdmin,
    isSystemAdmin,
    isSupportAdmin,
    isStaff: isSystemAdmin || isSupportAdmin,
    signIn,
    signOut,
    refreshSession,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
