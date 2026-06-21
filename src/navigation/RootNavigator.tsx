import React from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../auth/authStore";
import { RootStackParamList } from "./types";
import TabNavigator from "./TabNavigator";
import LoginScreen from "../screens/LoginScreen";
import CustomerProcessScreen from "../screens/CustomerProcessScreen";
import ManualLookupScreen from "../screens/ManualLookupScreen";
import { colors, fonts } from "../theme";

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
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
        contentStyle: { backgroundColor: colors.page },
      }}
    >
      {accessToken ? (
        <>
          <Stack.Screen name="Main" component={TabNavigator} options={{ headerShown: false }} />
          <Stack.Screen
            name="CustomerProcess"
            component={CustomerProcessScreen}
            options={{ title: "Process Transaction", headerBackTitle: "Back" }}
          />
          <Stack.Screen name="ManualLookup" component={ManualLookupScreen} options={{ title: "Find Customer" }} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
});
