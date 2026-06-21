import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Customer } from "../types/api";

/**
 * Fetch a customer by UUID or email. The backend returns 404 if the customer
 * never added their pass to a wallet (added_to_wallet=false) — callers should
 * distinguish that case from a genuine "not found".
 */
export async function fetchCustomer(idOrEmail: string): Promise<Customer> {
  const res = await apiClient.get(endpoints.FETCH_CUSTOMER(idOrEmail));
  const customer = (res.data?.customer ?? res.data) as Customer;
  return customer;
}

export interface CustomerList {
  customers: Customer[];
  total_count: number;
}

/** GET /pass/customers — paginated, wallet-added customers (newest first). */
export async function getCustomers(
  params: { search?: string; limit?: number; offset?: number } = {}
): Promise<CustomerList> {
  const res = await apiClient.get(endpoints.GET_CUSTOMERS, {
    params: { search: params.search || "", limit: params.limit ?? 20, offset: params.offset ?? 0 },
  });
  return {
    customers: (res.data?.customers ?? []) as Customer[],
    total_count: res.data?.total_count ?? 0,
  };
}
