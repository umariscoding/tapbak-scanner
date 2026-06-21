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
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { login } from "../api/auth";
import { getConfig, getCurrentSubscription } from "../api/config";
import { useAuthStore } from "../auth/authStore";
import { colors, fonts } from "../theme";

export default function LoginScreen() {
  const signIn = useAuthStore((s) => s.signIn);
  const setConfig = useAuthStore((s) => s.setConfig);
  const setSubscription = useAuthStore((s) => s.setSubscription);
  const setPointsSystem = useAuthStore((s) => s.setPointsSystem);

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
      // Load config + subscription (subscription carries points_system, like the web).
      void getConfig().then(setConfig).catch(() => {});
      void getCurrentSubscription()
        .then(({ pointsSystem, subscription }) => {
          setSubscription(subscription);
          setPointsSystem(pointsSystem);
        })
        .catch(() => {});
    } catch (err) {
      let message = "Something went wrong. Please try again.";
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 202) message = "Your email isn't verified. Verify it on the web dashboard, then log in.";
        else if (status === 401) message = "Incorrect password.";
        else if (status === 404) message = "No account found with that email.";
        else if (!err.response) message = "Can't reach the server. Check your connection.";
      }
      Alert.alert("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.container}>
          <View style={styles.brandRow}>
            <Image source={require("../../assets/splash-icon.png")} style={styles.logo} resizeMode="contain" />
            <Text style={styles.brand}>tapbak</Text>
          </View>
          <Text style={styles.tagline}>Sign in to start scanning</Text>

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
              placeholderTextColor={colors.textFaint}
              editable={!loading}
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor={colors.textFaint}
              editable={!loading}
              onSubmitEditing={onSubmit}
            />

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onSubmit} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log in</Text>}
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>Use your Tapbak business account.</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  logo: { width: 40, height: 40 },
  brand: { fontFamily: fonts.displayBold, fontSize: 38, color: colors.text, letterSpacing: -0.5 },
  tagline: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, textAlign: "center", marginTop: 6, marginBottom: 40 },
  form: { gap: 4 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.text, marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 26,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: fonts.bodyBold, color: "#fff", fontSize: 16 },
  hint: { fontFamily: fonts.body, color: colors.textFaint, fontSize: 13, textAlign: "center", marginTop: 26 },
});
