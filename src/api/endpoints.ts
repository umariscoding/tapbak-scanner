// Mirrors Tapbak/src/states/constants.js exactly. Path params are substituted
// verbatim (the web uses String.replace with no encoding), and values here are
// UUIDs or emails which are URL-safe.
export const endpoints = {
  LOGIN: "/pass/login",
  LOGOUT: "/pass/logout",
  GET_CONFIG: "/pass/config",
  GET_CURRENT_SUBSCRIPTION: "/pass/current-subscription",
  GET_CUSTOMERS: "/pass/customers",
  GET_TRANSACTIONS: "/pass/transactions",
  FETCH_CUSTOMER: (idOrEmail: string) => `/pass/customers/${idOrEmail}`,
  PROCESS_TRANSACTION: "/pass/process-transaction",
  GET_REWARDS: (customerId: string) => `/pass/rewards/${customerId}`,
  REDEEM_REWARD: (rewardId: string) => `/pass/redeem-reward/${rewardId}`,
} as const;
