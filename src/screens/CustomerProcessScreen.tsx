import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/types";
import { useCustomer, useRewards, useProcessTransaction, useRedeemReward } from "../hooks/queries";
import { useAuthStore } from "../auth/authStore";
import { isSubscriptionActive } from "../api/config";
import { success as hapticSuccess, error as hapticError } from "../lib/feedback";
import ProgressBar from "../components/ProgressBar";
import SubscriptionBanner from "../components/SubscriptionBanner";
import { colors } from "../theme";
import type { PointsSystem } from "../types/api";

type R = RouteProp<RootStackParamList, "CustomerProcess">;

export default function CustomerProcessScreen() {
  const route = useRoute<R>();
  const navigation = useNavigation();
  const { idOrEmail } = route.params;

  const config = useAuthStore((s) => s.config);
  const subscription = useAuthStore((s) => s.subscription);
  const subscriptionActive = isSubscriptionActive(subscription);

  const pointsSystem: PointsSystem = config?.points_system ?? "stamps";
  const isStamps = pointsSystem === "stamps";
  const label = isStamps ? "stamps" : "points";
  const totalPoints = config?.total_points ?? 0;

  const customerQ = useCustomer(idOrEmail);
  const customer = customerQ.data;
  const customerId = customer?.id ?? null;

  const rewardsQ = useRewards(customerId);
  const rewards = rewardsQ.data ?? [];

  const processMutation = useProcessTransaction();
  const redeemMutation = useRedeemReward(customerId ?? "");

  const [amount, setAmount] = useState("");
  const [pointsToAdd, setPointsToAdd] = useState("");

  const busy = processMutation.isPending || redeemMutation.isPending;

  const addTransaction = async (points: number, txnAmount: number) => {
    if (!customerId || points <= 0) return;
    try {
      await processMutation.mutateAsync({
        customerId,
        transactionType: pointsSystem,
        transactionAmount: txnAmount,
        transactionPoints: points,
      });
      hapticSuccess();
      setAmount("");
      setPointsToAdd("");
    } catch (err) {
      hapticError();
      Alert.alert("Couldn't add", "The transaction failed. Please try again.");
    }
  };

  const onRedeem = (rewardId: string) => {
    Alert.alert("Redeem reward", "Mark this reward as redeemed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Redeem",
        style: "default",
        onPress: async () => {
          try {
            await redeemMutation.mutateAsync(rewardId);
            hapticSuccess();
          } catch {
            hapticError();
            Alert.alert("Couldn't redeem", "Please try again.");
          }
        },
      },
    ]);
  };

  const errorView = useMemo(() => {
    if (!customerQ.isError) return null;
    const status = axios.isAxiosError(customerQ.error)
      ? customerQ.error.response?.status
      : undefined;
    const message =
      status === 404
        ? "No active card found. The customer may not have added their pass to Wallet yet, or the code is invalid."
        : "Couldn't load this customer. Check your connection and try again.";
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{message}</Text>
        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryBtnText}>Back to scanner</Text>
        </TouchableOpacity>
      </View>
    );
  }, [customerQ.isError, customerQ.error, navigation]);

  if (customerQ.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (errorView) return errorView;
  if (!customer) return null;

  const balance = customer.loyalty_card?.loyalty_points ?? 0;

  return (
    <ScrollView style={styles.fill} contentContainerStyle={styles.content}>
      {!subscriptionActive && <SubscriptionBanner />}

      <View style={styles.card}>
        <Text style={styles.name}>{customer.name || "Customer"}</Text>
        {!!customer.email && <Text style={styles.email}>{customer.email}</Text>}
        <View style={styles.progressWrap}>
          <ProgressBar value={balance} total={totalPoints} label={label} />
        </View>
      </View>

      {/* Add stamps / points */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Add {isStamps ? "stamps" : "points"}
        </Text>

        {isStamps ? (
          <View style={styles.quickRow}>
            {[1, 2, 5].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.quickBtn, (!subscriptionActive || busy) && styles.disabled]}
                disabled={!subscriptionActive || busy}
                onPress={() => addTransaction(n, 0)}
              >
                <Text style={styles.quickBtnText}>+{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.pointsForm}>
            <Text style={styles.label}>Purchase amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              editable={subscriptionActive && !busy}
            />
            <Text style={styles.label}>Points to add</Text>
            <TextInput
              style={styles.input}
              value={pointsToAdd}
              onChangeText={setPointsToAdd}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              editable={subscriptionActive && !busy}
            />
            <TouchableOpacity
              style={[styles.primaryBtn, (!subscriptionActive || busy) && styles.disabled]}
              disabled={!subscriptionActive || busy}
              onPress={() =>
                addTransaction(
                  parseInt(pointsToAdd || "0", 10),
                  parseFloat(amount || "0")
                )
              }
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Add points</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Rewards */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          Available rewards{rewards.length ? ` (${rewards.length})` : ""}
        </Text>
        {rewardsQ.isLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : rewards.length === 0 ? (
          <Text style={styles.muted}>No rewards to redeem.</Text>
        ) : (
          rewards.map((r) => (
            <View key={r.id} style={styles.rewardRow}>
              <Text style={styles.rewardText}>🎁 Reward ready</Text>
              <TouchableOpacity
                style={[styles.redeemBtn, (!subscriptionActive || busy) && styles.disabled]}
                disabled={!subscriptionActive || busy}
                onPress={() => onRedeem(r.id)}
              >
                <Text style={styles.redeemBtnText}>Redeem</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.secondaryBtnText}>Done — scan next</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16, backgroundColor: "#F3F4F6" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  name: { fontSize: 22, fontWeight: "800", color: colors.text },
  email: { fontSize: 14, color: colors.textMuted },
  progressWrap: { marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 4 },
  quickRow: { flexDirection: "row", gap: 12 },
  quickBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 22,
    borderRadius: 14,
    alignItems: "center",
  },
  quickBtnText: { color: "#fff", fontSize: 24, fontWeight: "800" },
  pointsForm: { gap: 6 },
  label: { fontSize: 13, color: colors.textMuted, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
    color: colors.text,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 14,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  disabled: { opacity: 0.4 },
  muted: { color: colors.textMuted },
  errorText: { color: colors.text, fontSize: 16, textAlign: "center", lineHeight: 22 },
  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rewardText: { fontSize: 15, color: colors.text, fontWeight: "600" },
  redeemBtn: {
    backgroundColor: colors.success,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  redeemBtnText: { color: "#fff", fontWeight: "700" },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryBtnText: { color: colors.text, fontWeight: "700", fontSize: 16 },
});
