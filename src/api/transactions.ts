import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import type { Transaction } from "../types/api";

export interface TransactionList {
  transactions: Transaction[];
  total_count: number;
}

/** GET /pass/transactions — paginated transaction ledger (newest first). */
export async function getTransactions(
  params: { search?: string; limit?: number; offset?: number } = {}
): Promise<TransactionList> {
  const res = await apiClient.get(endpoints.GET_TRANSACTIONS, {
    params: { search_query: params.search || "", limit: params.limit ?? 20, offset: params.offset ?? 0 },
  });
  return {
    transactions: (res.data?.transactions ?? []) as Transaction[],
    total_count: res.data?.total_count ?? 0,
  };
}

export interface ProcessTransactionInput {
  customerId: string;
  /** Raw string from the "Payment amount" input — sent verbatim, like the web. */
  transactionAmount: string;
  /** Raw string from the points/stamps input — sent verbatim, like the web. */
  transactionPoints: string;
}

/**
 * POST /pass/process-transaction.
 * Byte-for-byte identical to the web (Tapbak/src/states/app.js processTransaction +
 * ProcessTransaction/index.jsx): transaction_type is the literal "points" (the web
 * hardcodes it), and amount/points are the raw input strings (not parsed).
 * NOT idempotent — callers must refetch the customer + rewards afterwards.
 */
export async function processTransaction(input: ProcessTransactionInput): Promise<void> {
  await apiClient.post(endpoints.PROCESS_TRANSACTION, {
    customer_id: input.customerId,
    transaction_type: "points",
    transaction_amount: input.transactionAmount,
    transaction_points: input.transactionPoints,
  });
}
