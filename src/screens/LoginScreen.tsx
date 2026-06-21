import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { login } from "../api/auth";
import { getConfig, getCurrentSubscription } from "../api/config";
import { useAuthStore } from "../auth/authStore";
import { colors } from "../theme";

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const setConfig = useAuthStore((s) => s.setConfig);
  const setSubscription = useAuthStore((s) => s.setSubscription);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Missing details", "Enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const vendor = await login(email.trim(), password);
      await signIn(vendor);
      // Load config + subscription in the background; don't block entry.
      void getConfig().then(setConfig).catch(() => {});
      void getCurrentSubscription().then(setSubscription).catch(() => {});
    } catch (err) {
      let message = "Something went wrong. Please try again.";
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 202) {
          message =
            "Your email isn't verified yet. Please verify it on the Tapbak web app, then log in here.";
        } else if (status === 401) {
          message = "Incorrect password.";
        } else if (status === 404) {
          message = "No account found with that email.";
        } else if (!err.response) {
          message = "Can't reach the server. Check your connection.";
        }
      }
      Alert.alert("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.container}>
          <Text style={styles.brand}>Tapbak</Text>
          <Text style={styles.subtitle}>Scanner</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@business.com"
              placeholderTextColor={colors.textMuted}
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              editable={!loading}
              onSubmitEditing={onSubmit}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log in</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Use your Tapbak business account. Card design and settings stay on the
            web dashboard.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  container: { flex: 1, padding: 24, justifyContent: "center" },
  brand: {
    fontSize: 40,
    fontWeight: "800",
    color: colors.primary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 36,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  form: { gap: 6 },
  label: { fontSize: 13, color: colors.textMuted, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  hint: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 28,
    lineHeight: 18,
  },
});
