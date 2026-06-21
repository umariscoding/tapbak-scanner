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
import { success as hapticSuccess, error as hapticError } from "../lib/feedback";
import { colors, fonts, radius } from "../theme";
import type { PointsSystem, Reward } from "../types/api";

type R = RouteProp<RootStackParamList, "CustomerProcess">;

function relativeDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return d.toLocaleDateString();
}

export default function CustomerProcessScreen() {
  const route = useRoute<R>();
  const navigation = useNavigation();
  const { idOrEmail } = route.params;

  const config = useAuthStore((s) => s.config);
  const pointsSystem: PointsSystem = config?.points_system ?? "stamps";
  const unit = pointsSystem === "points" ? "points" : "stamps";
  const unitLabel = pointsSystem === "points" ? "Points" : "Stamps";

  const customerQ = useCustomer(idOrEmail);
  const customer = customerQ.data;
  const customerId = customer?.id ?? null;
  const isInactiveCustomer = customer?.status === "inactive";

  const rewardsQ = useRewards(customerId);
  const rewards = rewardsQ.data ?? [];

  const processMutation = useProcessTransaction();
  const redeemMutation = useRedeemReward(customerId ?? "");

  const [amount, setAmount] = useState("");
  const [points, setPoints] = useState("");

  const busy = processMutation.isPending || redeemMutation.isPending;
  const balance = customer?.loyalty_card?.loyalty_points ?? 0;
  const canProcess = !!amount && !!points && !isInactiveCustomer && !busy;

  const onProcess = async () => {
    if (!customerId || !amount || !points) return;
    if (isInactiveCustomer) {
      Alert.alert("Customer inactive", "This customer's account is inactive.");
      return;
    }
    try {
      await processMutation.mutateAsync({
        customerId,
        transactionAmount: amount,
        transactionPoints: points,
      });
      hapticSuccess();
      setAmount("");
      setPoints("");
    } catch {
      hapticError();
      Alert.alert("Couldn't process", "The transaction failed. Please try again.");
    }
  };

  const onRedeem = (reward: Reward) => {
    Alert.alert("Redeem reward", "Mark this reward as redeemed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Redeem",
        onPress: async () => {
          try {
            await redeemMutation.mutateAsync(reward.id);
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
    const status = axios.isAxiosError(customerQ.error) ? customerQ.error.response?.status : undefined;
    const message =
      status === 404
        ? "No active card found. The customer may not have added their pass to Wallet yet, or the code is invalid."
        : "Couldn't load this customer. Check your connection and try again.";
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{message}</Text>
        <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.ghostBtnText}>Back to scanner</Text>
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

  const initial = (customer.name || customer.email || "?").charAt(0).toUpperCase();

  return (
    <ScrollView style={styles.fill} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.subtitle}>Process payments and manage loyalty {unit} for your customers</Text>

      {/* Inputs */}
      <View style={styles.card}>
        <View style={styles.inputRow}>
          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>Payment amount</Text>
            <View style={styles.inputWrap}>
              <Text style={styles.inputPrefix}>£</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={colors.textFaint}
                editable={!busy}
              />
            </View>
            <Text style={styles.help}>Enter the total payment amount</Text>
          </View>

          <View style={styles.inputCol}>
            <Text style={styles.inputLabel}>{unitLabel}</Text>
            <View style={styles.inputWrap}>
              <TextInput
                style={[styles.input, { paddingLeft: 14 }]}
                value={points}
                onChangeText={setPoints}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textFaint}
                editable={!busy}
              />
            </View>
            <Text style={styles.help}>Customer has {balance} {unit} available</Text>
          </View>
        </View>
      </View>

      {/* Customer */}
      <View style={styles.card}>
        <View style={styles.customerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.flex}>
            <Text style={styles.name} numberOfLines={1}>{customer.name || "Customer"}</Text>
            {!!customer.email && <Text style={styles.email} numberOfLines={1}>{customer.email}</Text>}
            <View style={[styles.badge, isInactiveCustomer ? styles.badgeRed : styles.badgeGreen]}>
              <Text style={[styles.badgeText, isInactiveCustomer ? styles.badgeTextRed : styles.badgeTextGreen]}>
                {isInactiveCustomer ? "Inactive" : "Active"}
              </Text>
            </View>
          </View>
          <View style={styles.balanceBox}>
            <Text style={styles.balanceLabel}>{unitLabel}</Text>
            <Text style={styles.balanceValue}>{balance}</Text>
          </View>
        </View>
      </View>

      {/* Rewards */}
      <View style={styles.card}>
        <View style={styles.rewardHeader}>
          <Text style={styles.sectionTitle}>Available rewards</Text>
          {rewards.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{rewards.length}</Text>
            </View>
          )}
        </View>
        {rewardsQ.isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
        ) : rewards.length === 0 ? (
          <Text style={styles.empty}>No rewards available at the moment</Text>
        ) : (
          <View style={{ gap: 10, marginTop: 4 }}>
            {rewards.map((r) => (
              <View key={r.id} style={styles.rewardItem}>
                <View style={styles.flex}>
                  <Text style={styles.rewardTitle}>Reward #{r.id.slice(-8)}</Text>
                  <Text style={styles.rewardMeta}>Ready to redeem · {relativeDate(r.created_at)}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.redeemBtn, busy && styles.disabled]}
                  disabled={busy}
                  onPress={() => onRedeem(r)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.redeemBtnText}>Redeem</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Process */}
      <TouchableOpacity style={[styles.primaryBtn, !canProcess && styles.disabled]} disabled={!canProcess} onPress={onProcess} activeOpacity={0.9}>
        {processMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryBtnText}>Process payment</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.ghostBtnText}>Scan next customer</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  content: { padding: 16, gap: 14, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16, backgroundColor: colors.page },
  flex: { flex: 1 },
  subtitle: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 2 },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },

  inputRow: { flexDirection: "row", gap: 12 },
  inputCol: { flex: 1, gap: 6 },
  inputLabel: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text },
  inputWrap: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  inputPrefix: { fontFamily: fonts.bodyMedium, fontSize: 16, color: colors.textMuted, paddingLeft: 12 },
  input: { flex: 1, height: 48, paddingHorizontal: 8, fontFamily: fonts.body, fontSize: 17, color: colors.text },
  help: { fontFamily: fonts.body, fontSize: 11.5, color: colors.textFaint },

  customerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.displayBold, fontSize: 20, color: colors.primary },
  name: { fontFamily: fonts.display, fontSize: 17, color: colors.text },
  email: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 1 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 2, borderRadius: radius.pill, marginTop: 6 },
  badgeGreen: { backgroundColor: colors.successBg },
  badgeRed: { backgroundColor: colors.dangerBg },
  badgeText: { fontFamily: fonts.bodyMedium, fontSize: 11 },
  badgeTextGreen: { color: colors.successText },
  badgeTextRed: { color: colors.danger },
  balanceBox: { backgroundColor: colors.infoBg, borderRadius: radius.md, paddingVertical: 10, paddingHorizontal: 16, alignItems: "center", minWidth: 76 },
  balanceLabel: { fontFamily: fonts.bodyMedium, fontSize: 12, color: colors.primary },
  balanceValue: { fontFamily: fonts.displayBold, fontSize: 24, color: colors.primary },

  rewardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 15, color: colors.text },
  countPill: { backgroundColor: colors.info, borderRadius: radius.pill, minWidth: 20, height: 20, paddingHorizontal: 6, alignItems: "center", justifyContent: "center" },
  countPillText: { fontFamily: fonts.bodyBold, fontSize: 11, color: "#fff" },
  empty: { fontFamily: fonts.body, fontSize: 13, color: colors.textFaint, marginTop: 8 },
  rewardItem: { flexDirection: "row", alignItems: "center", backgroundColor: colors.infoBg, borderRadius: radius.md, padding: 12, gap: 10 },
  rewardTitle: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.text },
  rewardMeta: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 1 },
  redeemBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 9, borderRadius: radius.sm },
  redeemBtnText: { fontFamily: fonts.bodyBold, fontSize: 13, color: "#fff" },

  primaryBtn: { backgroundColor: colors.primary, borderRadius: radius.md, height: 52, alignItems: "center", justifyContent: "center", marginTop: 2 },
  primaryBtnText: { fontFamily: fonts.bodyBold, fontSize: 16, color: "#fff" },
  disabled: { opacity: 0.4 },

  ghostBtn: { alignItems: "center", justifyContent: "center", height: 44 },
  ghostBtnText: { fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.textMuted },

  errorText: { fontFamily: fonts.body, fontSize: 15, color: colors.text, textAlign: "center", lineHeight: 22 },
});
