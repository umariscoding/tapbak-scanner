import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Configuration, Subscription, PointsSystem } from "../types/api";

export async function getConfig(): Promise<Configuration | null> {
  const res = await apiClient.get(endpoints.GET_CONFIG);
  return (res.data?.configuration ?? res.data ?? null) as Configuration | null;
}

export interface SubscriptionResult {
  pointsSystem: PointsSystem | null;
  subscription: Subscription | null;
}

/**
 * GET /pass/current-subscription returns a wrapper:
 *   { points_system: "points"|"stamps", subscription: { status, ... } }
 * The web reads points_system from the top level and the *inner* subscription
 * object for status. We mirror that exactly.
 */
export async function getCurrentSubscription(): Promise<SubscriptionResult> {
  try {
    const res = await apiClient.get(endpoints.GET_CURRENT_SUBSCRIPTION);
    const data = res.data ?? {};
    return {
      pointsSystem: (data.points_system ?? null) as PointsSystem | null,
      subscription: (data.subscription ?? null) as Subscription | null,
    };
  } catch {
    return { pointsSystem: null, subscription: null };
  }
}

/** Matches the web SubscriptionGuard: active only when status is active/trialing. */
export function isSubscriptionActive(sub: Subscription | null): boolean {
  const status = (sub?.status ?? "").toString().toLowerCase();
  return status === "active" || status === "trialing";
}
