// Mirrors Tapbak/src/states/constants.js. All paths are relative to API_BASE_URL.
export const endpoints = {
  LOGIN: "/pass/login",
  LOGOUT: "/pass/logout",
  GET_CONFIG: "/pass/config",
  GET_CURRENT_SUBSCRIPTION: "/pass/current-subscription",
  FETCH_CUSTOMER: (idOrEmail: string) =>
    `/pass/customers/${encodeURIComponent(idOrEmail)}`,
  PROCESS_TRANSACTION: "/pass/process-transaction",
  GET_REWARDS: (customerId: string) =>
    `/pass/rewards/${encodeURIComponent(customerId)}`,
  REDEEM_REWARD: (rewardId: string) =>
    `/pass/redeem-reward/${encodeURIComponent(rewardId)}`,
} as const;
