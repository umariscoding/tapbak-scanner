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
import { colors } from "../theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "ManualLookup">;

export default function ManualLookupScreen() {
  const navigation = useNavigation<Nav>();
  const [value, setValue] = useState("");

  const onFind = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    // Accept an email as-is, or parse a pasted URL/QR payload into an id.
    const idOrEmail = trimmed.includes("@") ? trimmed : parseScannedId(trimmed) ?? trimmed;
    navigation.replace("CustomerProcess", { idOrEmail });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.fill}
    >
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
          placeholderTextColor={colors.textMuted}
          autoFocus
          onSubmitEditing={onFind}
        />
        <Text style={styles.hint}>
          Use this when a QR won't scan. Phone-number lookup isn't supported.
        </Text>
        <TouchableOpacity style={styles.button} onPress={onFind}>
          <Text style={styles.buttonText}>Find customer</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#fff" },
  container: { padding: 20, gap: 8 },
  label: { fontSize: 13, color: colors.textMuted, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  hint: { fontSize: 13, color: colors.textMuted },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
