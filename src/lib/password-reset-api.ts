import { apiRequest } from "@/lib/api";

type MessageResponse = { success: true; message: string };
type ValidateResponse = { valid: boolean };

export async function requestPasswordReset(email: string): Promise<string> {
  const response = await apiRequest<MessageResponse>("/api/auth/forgot-password", {
    method: "POST",
    data: { email },
  });
  return response.message;
}

export async function validateResetToken(token: string): Promise<boolean> {
  const response = await apiRequest<ValidateResponse>(
    `/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`,
  );
  return response.valid;
}

export async function resetPassword(
  token: string,
  password: string,
  confirmation: string,
): Promise<string> {
  const response = await apiRequest<MessageResponse>("/api/auth/reset-password", {
    method: "POST",
    data: {
      token,
      password,
      password_confirmation: confirmation,
    },
  });
  return response.message;
}
