import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { PointsSystem } from "../types/api";

export interface ProcessTransactionInput {
  customerId: string;
  transactionType: PointsSystem;
  transactionAmount: number;
  transactionPoints: number;
}

/**
 * Adds stamps/points. NOT idempotent — each call creates a Transaction and may
 * mint rewards. Returns only a message; callers must refetch the customer and
 * rewards to reflect the new balance.
 */
export async function processTransaction(
  input: ProcessTransactionInput
): Promise<void> {
  await apiClient.post(endpoints.PROCESS_TRANSACTION, {
    customer_id: input.customerId,
    transaction_type: input.transactionType,
    transaction_amount: input.transactionAmount,
    transaction_points: input.transactionPoints,
  });
}
