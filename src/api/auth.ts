import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Vendor } from "../types/api";

export interface LoginResult {
  vendor: Vendor;
}

/**
 * Logs in a vendor. Throws on bad credentials (401) / not found (404).
 * The backend returns 202 when the email isn't verified yet.
 */
export async function login(email: string, password: string): Promise<Vendor> {
  const res = await apiClient.post(endpoints.LOGIN, { email, password });
  const vendor = res.data?.vendor as Vendor | undefined;
  if (!vendor?.access_token) {
    throw new Error("Login response missing tokens");
  }
  return vendor;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post(endpoints.LOGOUT);
  } catch {
    // Logout is best-effort; local tokens are cleared regardless.
  }
}
