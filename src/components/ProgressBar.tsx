import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";

interface Props {
  value: number;
  total: number;
  label: string; // "stamps" | "points"
}

export default function ProgressBar({ value, total, label }: Props) {
  const safeTotal = total > 0 ? total : 0;
  const pct =
    safeTotal > 0 ? Math.min(100, Math.round((value / safeTotal) * 100)) : 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.total}>
          {safeTotal > 0 ? `/ ${safeTotal} ${label}` : label}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  row: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  value: { fontSize: 40, fontWeight: "800", color: colors.text },
  total: { fontSize: 16, color: colors.textMuted },
  track: {
    height: 12,
    backgroundColor: colors.border,
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: { height: 12, backgroundColor: colors.primary, borderRadius: 999 },
});
