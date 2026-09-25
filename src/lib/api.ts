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
let csrfRefresh: Promise<string> | null = null;

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

  return contentType.includes("application/json")
    ? ((await response.json()) as T)
    : null;
}

async function ensureCsrfToken(forceRefresh = false): Promise<string> {
  if (forceRefresh) csrfToken = null;

  if (csrfToken) return csrfToken;

  if (!csrfRefresh) {
    csrfRefresh = (async () => {
      const response = await fetch(
        `${PHP_API_BASE_URL}/api/auth/me`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          credentials: "include",
        },
      );

      updateCsrfToken(response);

      if (!response.ok) {
        const payload =
          await readResponse<{
            message?: string;
            error?: string;
          }>(response);

        throw new ApiError(
          payload?.message ??
            payload?.error ??
            "Unable to initialize the secure session.",
          response.status,
          payload,
        );
      }

      if (!csrfToken) {
        throw new ApiError(
          "The server did not provide a CSRF token.",
          500,
        );
      }

      return csrfToken;
    })().finally(() => {
      csrfRefresh = null;
    });
  }

  return csrfRefresh;
}

async function executeRequest<T>(
  path: string,
  requestOptions: ApiRequestOptions,
  allowCsrfRetry: boolean,
): Promise<T> {
  const {
    data,
    formData,
    csrf,
    headers,
    ...options
  } = requestOptions;

  const method = (options.method ?? "GET").toUpperCase();
  const isMutation =
    !["GET", "HEAD", "OPTIONS"].includes(method);

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (data && formData) {
    throw new ApiError(
      "Use either data or formData, not both.",
      500,
    );
  }

  let body: BodyInit | undefined;

  if (formData) {
    if (csrf ?? isMutation) {
      formData.set(
        "_csrf",
        await ensureCsrfToken(),
      );
    }

    body = formData;
  } else {
    const fields: Record<string, FormValue> = {
      ...data,
    };

    if (csrf ?? isMutation) {
      fields._csrf =
        await ensureCsrfToken();
    }

    if (
      isMutation ||
      Object.keys(fields).length > 0
    ) {
      const params =
        new URLSearchParams();

      Object.entries(fields).forEach(
        ([key, value]) => {
          if (
            value !== null &&
            value !== undefined
          ) {
            params.set(
              key,
              String(value),
            );
          }
        },
      );

      body = params;
    }
  }

  const response = await fetch(
    `${PHP_API_BASE_URL}${path}`,
    {
      ...options,
      method,
      body,
      headers: requestHeaders,
      credentials: "include",
    },
  );

  updateCsrfToken(response);

  const payload =
    await readResponse<
      T & {
        error?: string;
        message?: string;
      }
    >(response);

  const serverMessage =
    payload &&
    typeof payload === "object"
      ? payload.error ??
        payload.message ??
        "The request could not be completed."
      : "The request could not be completed.";

  if (
    !response.ok &&
    allowCsrfRetry &&
    isMutation &&
    response.status === 403 &&
    serverMessage ===
      "CSRF token mismatch."
  ) {
    await ensureCsrfToken(true);

    return executeRequest<T>(
      path,
      requestOptions,
      false,
    );
  }

  if (!response.ok) {
    throw new ApiError(
      serverMessage,
      response.status,
      payload,
    );
  }

  return payload as T;
}

/**
 * Calls the PHP backend with its session cookie.
 * Supports normal form fields and multipart uploads.
 * A stale CSRF token is refreshed and retried once.
 */
export async function apiRequest<T = unknown>(
  path: string,
  requestOptions: ApiRequestOptions = {},
): Promise<T> {
  return executeRequest<T>(
    path,
    requestOptions,
    true,
  );
}
