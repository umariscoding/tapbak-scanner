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
