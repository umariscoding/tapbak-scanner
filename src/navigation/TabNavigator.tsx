import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TabParamList } from "./types";
import ScannerScreen from "../screens/ScannerScreen";
import CustomersScreen from "../screens/CustomersScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { colors, fonts } from "../theme";

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Scan: "scan-outline",
  Customers: "people-outline",
  Activity: "receipt-outline",
  Settings: "settings-outline",
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: fonts.display, fontSize: 18, color: colors.text },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
        tabBarStyle: { borderTopColor: colors.border, backgroundColor: colors.surface },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name]} size={size - 2} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Scan" component={ScannerScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="Activity" component={TransactionsScreen} options={{ title: "Transactions" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
