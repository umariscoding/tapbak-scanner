import React from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useTransactionList } from "../hooks/queries";
import { colors, fonts, radius } from "../theme";
import type { Transaction } from "../types/api";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) + " · " +
    d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function amountText(a: Transaction["transaction_amount"]): string {
  const n = typeof a === "string" ? parseFloat(a) : a ?? 0;
  return `£${(n || 0).toFixed(2)}`;
}

export default function TransactionsScreen() {
  const q = useTransactionList();
  const transactions = q.data?.transactions ?? [];

  const renderItem = ({ item }: { item: Transaction }) => {
    const pts = item.transaction_points ?? 0;
    const positive = pts > 0;
    return (
      <View style={styles.row}>
        <View style={[styles.iconWrap, positive ? styles.iconPos : styles.iconNeg]}>
          <Text style={[styles.iconText, positive ? styles.iconTextPos : styles.iconTextNeg]}>
            {positive ? "+" : "−"}
          </Text>
        </View>
        <View style={styles.flex}>
          <Text style={styles.name} numberOfLines={1}>{item.customer?.name || "Customer"}</Text>
          <Text style={styles.when}>{formatWhen(item.created_at)}</Text>
        </View>
        <View style={styles.metaRight}>
          <Text style={[styles.points, positive ? styles.pointsPos : styles.pointsNeg]}>
            {positive ? "+" : "−"}{Math.abs(pts)}
          </Text>
          <Text style={styles.amount}>{amountText(item.transaction_amount)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.fill}>
      {q.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(t) => t.id}
          renderItem={renderItem}
          contentContainerStyle={transactions.length === 0 ? styles.emptyWrap : { paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          refreshControl={<RefreshControl refreshing={q.isFetching && !q.isLoading} onRefresh={() => q.refetch()} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No transactions yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  flex: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 13 },
  iconWrap: { width: 38, height: 38, borderRadius: radius.pill, alignItems: "center", justifyContent: "center" },
  iconPos: { backgroundColor: colors.successBg },
  iconNeg: { backgroundColor: colors.dangerBg },
  iconText: { fontFamily: fonts.displayBold, fontSize: 20 },
  iconTextPos: { color: colors.successText },
  iconTextNeg: { color: colors.danger },
  name: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  when: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  metaRight: { alignItems: "flex-end" },
  points: { fontFamily: fonts.displayBold, fontSize: 16 },
  pointsPos: { color: colors.successText },
  pointsNeg: { color: colors.danger },
  amount: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textMuted, marginTop: 1 },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: 66 },
  emptyWrap: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.textFaint },
});
