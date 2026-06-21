import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Constants from "expo-constants";
import { useAuthStore } from "../auth/authStore";
import { logout } from "../api/auth";
import { isSubscriptionActive } from "../api/config";
import { colors, fonts, radius } from "../theme";

function Row({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const vendor = useAuthStore((s) => s.vendor);
  const subscription = useAuthStore((s) => s.subscription);
  const signOut = useAuthStore((s) => s.signOut);

  const active = isSubscriptionActive(subscription);
  const version = Constants.expoConfig?.version ?? "—";

  const onLogout = () => {
    Alert.alert("Log out", "Log this device out of the store account?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await logout();
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={styles.fill}>
      <View style={styles.card}>
        <Row label="Business" value={vendor?.business_name || "—"} />
        <Row label="Account" value={vendor?.email || "—"} />
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Subscription</Text>
          <View style={[styles.badge, active ? styles.badgeGreen : styles.badgeRed]}>
            <Text style={[styles.badgeText, active ? styles.badgeTextGreen : styles.badgeTextRed]}>
              {active ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>
        <Row label="Version" value={String(version)} last />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <Text style={styles.note}>Card design, analytics and billing are managed on the Tapbak web dashboard.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page, padding: 16, gap: 16 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { fontFamily: fonts.body, color: colors.textMuted, fontSize: 14 },
  rowValue: { fontFamily: fonts.bodyMedium, color: colors.text, fontSize: 14, maxWidth: "62%", textAlign: "right" },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.pill },
  badgeGreen: { backgroundColor: colors.successBg },
  badgeRed: { backgroundColor: colors.dangerBg },
  badgeText: { fontFamily: fonts.bodyMedium, fontSize: 12 },
  badgeTextGreen: { color: colors.successText },
  badgeTextRed: { color: colors.danger },
  logoutBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.danger, borderRadius: radius.md, height: 50, alignItems: "center", justifyContent: "center" },
  logoutText: { fontFamily: fonts.bodyBold, color: colors.danger, fontSize: 15 },
  note: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 12.5, textAlign: "center", lineHeight: 18 },
});
