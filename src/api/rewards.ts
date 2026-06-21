import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Reward } from "../types/api";

/** Lists a customer's available (unredeemed) rewards. */
export async function getRewards(customerId: string): Promise<Reward[]> {
  const res = await apiClient.get(endpoints.GET_REWARDS(customerId));
  return (Array.isArray(res.data) ? res.data : res.data?.rewards ?? []) as Reward[];
}

/** Marks a reward as redeemed (availed) and refreshes the customer's wallet pass. */
export async function redeemReward(rewardId: string): Promise<void> {
  await apiClient.put(endpoints.REDEEM_REWARD(rewardId));
}
