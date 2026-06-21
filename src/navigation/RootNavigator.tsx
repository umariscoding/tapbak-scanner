import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../auth/authStore";
import { RootStackParamList } from "./types";
import LoginScreen from "../screens/LoginScreen";
import ScannerScreen from "../screens/ScannerScreen";
import CustomerProcessScreen from "../screens/CustomerProcessScreen";
import ManualLookupScreen from "../screens/ManualLookupScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { colors } from "../theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const accessToken = useAuthStore((s) => s.accessToken);

  if (!hydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      {accessToken ? (
        <>
          <Stack.Screen
            name="Scanner"
            component={ScannerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="CustomerProcess"
            component={CustomerProcessScreen}
            options={{ title: "Customer" }}
          />
          <Stack.Screen
            name="ManualLookup"
            component={ManualLookupScreen}
            options={{ title: "Find Customer" }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Settings" }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
});
