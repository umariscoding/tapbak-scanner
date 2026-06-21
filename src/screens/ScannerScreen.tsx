import React, { useCallback, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { RootStackParamList } from "../navigation/types";
import { parseScannedId } from "../lib/parseQr";
import { tick } from "../lib/feedback";
import { colors } from "../theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "Scanner">;

export default function ScannerScreen() {
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();

  // Pause scanning while away from this screen, and debounce so a single QR in
  // view doesn't fire dozens of navigations.
  const [active, setActive] = useState(true);
  const lockRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      setActive(true);
      lockRef.current = false;
      return () => setActive(false);
    }, [])
  );

  const onBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      if (lockRef.current) return;
      const id = parseScannedId(result.data);
      if (!id) return;
      lockRef.current = true;
      setActive(false);
      tick();
      navigation.navigate("CustomerProcess", { idOrEmail: id });
    },
    [navigation]
  );

  if (!permission) {
    // Permissions still loading.
    return <View style={styles.fill} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerWrap}>
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permBody}>
          Tapbak Scanner uses the camera to read customer loyalty QR codes.
        </Text>
        {permission.canAskAgain ? (
          <TouchableOpacity style={styles.primaryBtn} onPress={requestPermission}>
            <Text style={styles.primaryBtnText}>Allow camera</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.primaryBtn} onPress={() => Linking.openSettings()}>
            <Text style={styles.primaryBtnText}>Open Settings</Text>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.fill}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        active={active}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={active ? onBarcodeScanned : undefined}
      />

      {/* Scan reticle */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.reticle} />
        <Text style={styles.hint}>Point at the customer's pass QR</Text>
      </View>

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <Text style={styles.title}>Scan</Text>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.navigate("Settings")}
        >
          <Text style={styles.iconBtnText}>Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>

      {/* Bottom bar */}
      <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
        <TouchableOpacity
          style={styles.lookupBtn}
          onPress={() => navigation.navigate("ManualLookup")}
        >
          <Text style={styles.lookupBtnText}>Enter email / ID manually</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#000" },
  centerWrap: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  permTitle: { fontSize: 20, fontWeight: "700", color: colors.text },
  permBody: { fontSize: 15, color: colors.textMuted, textAlign: "center" },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  reticle: {
    width: 240,
    height: 240,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.9)",
    borderRadius: 24,
  },
  hint: { color: "#fff", marginTop: 20, fontSize: 15, fontWeight: "600" },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "800" },
  iconBtn: {
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  iconBtnText: { color: "#fff", fontWeight: "600" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  lookupBtn: {
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  lookupBtnText: { color: colors.text, fontWeight: "700", fontSize: 16 },
});
