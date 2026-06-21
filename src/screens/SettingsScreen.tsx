import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import Constants from "expo-constants";
import { useAuthStore } from "../auth/authStore";
import { logout } from "../api/auth";
import { isSubscriptionActive } from "../api/config";
import { colors } from "../theme";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function SettingsScreen() {
  const vendor = useAuthStore((s) => s.vendor);
  const subscription = useAuthStore((s) => s.subscription);
  const signOut = useAuthStore((s) => s.signOut);

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

  const version =
    Constants.expoConfig?.version ?? Constants.nativeAppVersion ?? "—";

  return (
    <View style={styles.fill}>
      <View style={styles.card}>
        <Row label="Business" value={vendor?.business_name || "—"} />
        <Row label="Account" value={vendor?.email || "—"} />
        <Row
          label="Subscription"
          value={isSubscriptionActive(subscription) ? "Active" : "Inactive"}
        />
        <Row label="App version" value={version} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Card design, analytics and billing are managed on the Tapbak web
        dashboard.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#F3F4F6", padding: 16, gap: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLabel: { color: colors.textMuted, fontSize: 15 },
  rowValue: { color: colors.text, fontSize: 15, fontWeight: "600", maxWidth: "60%", textAlign: "right" },
  logoutBtn: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  logoutText: { color: colors.danger, fontWeight: "700", fontSize: 16 },
  note: { color: colors.textMuted, fontSize: 13, textAlign: "center", lineHeight: 18 },
});
