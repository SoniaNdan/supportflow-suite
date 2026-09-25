const DEFAULT_PHP_API_BASE_URL =
  "http://localhost/dashboard/PROJECTS/supportflow-suite/backend/public";

export const PHP_API_BASE_URL = (
  import.meta.env.VITE_PHP_API_BASE_URL ?? DEFAULT_PHP_API_BASE_URL
).replace(/\/$/, "");

type FormValue = string | number | boolean | null | undefined;

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly payload?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiRequestOptions = Omit<RequestInit, "body" | "headers"> & {
  data?: Record<string, FormValue>;
  formData?: FormData;
  headers?: HeadersInit;
  csrf?: boolean;
};

let csrfToken: string | null = null;

export function clearCsrfToken(): void {
  csrfToken = null;
}

function updateCsrfToken(response: Response): void {
  const token = response.headers.get("x-csrf-token");
  if (token) csrfToken = token;
}

async function readResponse<T>(response: Response): Promise<T | null> {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json") ? ((await response.json()) as T) : null;
}

async function ensureCsrfToken(): Promise<string> {
  if (csrfToken) return csrfToken;

  await apiRequest("/api/auth/me");
  if (!csrfToken) throw new ApiError("The server did not provide a CSRF token.", 500);
  return csrfToken;
}

/** Calls the PHP backend with its session cookie. Supports normal fields and multipart uploads. */
export async function apiRequest<T = unknown>(
  path: string,
  { data, formData, csrf, headers, ...options }: ApiRequestOptions = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method);
  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (data && formData) {
    throw new ApiError("Use either data or formData, not both.", 500);
  }

  let body: BodyInit | undefined;
  if (formData) {
    if (csrf ?? isMutation) formData.set("_csrf", await ensureCsrfToken());
    body = formData;
  } else {
    const fields: Record<string, FormValue> = { ...data };
    if (csrf ?? isMutation) fields._csrf = await ensureCsrfToken();

    if (isMutation || Object.keys(fields).length > 0) {
      const params = new URLSearchParams();
      Object.entries(fields).forEach(([key, value]) => {
        if (value !== null && value !== undefined) params.set(key, String(value));
      });
      body = params;
    }
  }

  const response = await fetch(`${PHP_API_BASE_URL}${path}`, {
    ...options,
    method,
    body,
    headers: requestHeaders,
    credentials: "include",
  });

  updateCsrfToken(response);
  const payload = await readResponse<T & { error?: string; message?: string }>(response);
  if (!response.ok) {
    const message =
      payload && typeof payload === "object"
        ? (payload.error ?? payload.message ?? "The request could not be completed.")
        : "The request could not be completed.";
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}
