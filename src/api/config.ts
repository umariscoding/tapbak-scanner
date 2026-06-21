import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Configuration } from "../types/api";

export async function getConfig(): Promise<Configuration | null> {
  const res = await apiClient.get(endpoints.GET_CONFIG);
  return (res.data?.configuration ?? res.data ?? null) as Configuration | null;
}
