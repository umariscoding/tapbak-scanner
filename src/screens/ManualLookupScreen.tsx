import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { parseScannedId } from "../lib/parseQr";
import { colors, fonts, radius } from "../theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "ManualLookup">;

export default function ManualLookupScreen() {
  const navigation = useNavigation<Nav>();
  const [value, setValue] = useState("");

  const onFind = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const idOrEmail = trimmed.includes("@") ? trimmed : parseScannedId(trimmed) ?? trimmed;
    navigation.replace("CustomerProcess", { idOrEmail });
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.fill}>
      <View style={styles.container}>
        <Text style={styles.label}>Customer email or card ID</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={setValue}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={colors.textFaint}
          autoFocus
          onSubmitEditing={onFind}
        />
        <Text style={styles.hint}>Use this when a QR won't scan.</Text>
        <TouchableOpacity style={styles.button} onPress={onFind} activeOpacity={0.9}>
          <Text style={styles.buttonText}>Find customer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  container: { padding: 16, gap: 8 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    height: 50,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  hint: { fontFamily: fonts.body, fontSize: 12.5, color: colors.textFaint },
  button: { backgroundColor: colors.primary, borderRadius: radius.md, height: 50, alignItems: "center", justifyContent: "center", marginTop: 14 },
  buttonText: { fontFamily: fonts.bodyBold, color: "#fff", fontSize: 16 },
});
