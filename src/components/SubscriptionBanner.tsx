import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme";

export default function SubscriptionBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Subscription inactive — transactions are disabled. Manage your plan on
        the Tapbak web dashboard.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FEF3C7",
    borderColor: "#FCD34D",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  text: { color: colors.warning, fontSize: 13, fontWeight: "600", lineHeight: 18 },
});
