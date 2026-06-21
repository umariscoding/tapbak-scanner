import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Configuration, Subscription } from "../types/api";

export async function getConfig(): Promise<Configuration | null> {
  const res = await apiClient.get(endpoints.GET_CONFIG);
  return (res.data?.configuration ?? res.data ?? null) as Configuration | null;
}

export async function getCurrentSubscription(): Promise<Subscription | null> {
  try {
    const res = await apiClient.get(endpoints.GET_CURRENT_SUBSCRIPTION);
    return (res.data?.subscription ?? res.data ?? null) as Subscription | null;
  } catch {
    return null;
  }
}

/** Treats a subscription as active unless it's explicitly inactive/canceled. */
export function isSubscriptionActive(sub: Subscription | null): boolean {
  if (!sub) return false;
  if (typeof sub.active === "boolean") return sub.active;
  const status = (sub.status ?? "").toString().toLowerCase();
  if (!status) return true; // unknown shape — don't hard-block the counter
  return ["active", "trialing", "trial", "past_due"].includes(status);
}
