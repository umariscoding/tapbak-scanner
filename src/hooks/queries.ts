import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCustomer, getCustomers } from "../api/customers";
import { getRewards, redeemReward } from "../api/rewards";
import {
  processTransaction,
  getTransactions,
  ProcessTransactionInput,
} from "../api/transactions";

export const qk = {
  customer: (id: string) => ["customer", id] as const,
  rewards: (id: string) => ["rewards", id] as const,
};

export function useCustomer(idOrEmail: string | null) {
  return useQuery({
    queryKey: qk.customer(idOrEmail ?? ""),
    queryFn: () => fetchCustomer(idOrEmail as string),
    enabled: !!idOrEmail,
    retry: false,
  });
}

export function useCustomerList(search: string) {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () => getCustomers({ search, limit: 30 }),
  });
}

export function useTransactionList() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: () => getTransactions({ limit: 30 }),
  });
}

export function useRewards(customerId: string | null) {
  return useQuery({
    queryKey: qk.rewards(customerId ?? ""),
    queryFn: () => getRewards(customerId as string),
    enabled: !!customerId,
  });
}

function useInvalidateCustomer() {
  const qc = useQueryClient();
  return (customerId: string) => {
    void qc.invalidateQueries({ queryKey: qk.customer(customerId) });
    void qc.invalidateQueries({ queryKey: qk.rewards(customerId) });
  };
}

export function useProcessTransaction() {
  const invalidate = useInvalidateCustomer();
  return useMutation({
    mutationFn: (input: ProcessTransactionInput) => processTransaction(input),
    onSuccess: (_data, input) => invalidate(input.customerId),
  });
}

export function useRedeemReward(customerId: string) {
  const invalidate = useInvalidateCustomer();
  return useMutation({
    mutationFn: (rewardId: string) => redeemReward(rewardId),
    onSuccess: () => invalidate(customerId),
  });
}
