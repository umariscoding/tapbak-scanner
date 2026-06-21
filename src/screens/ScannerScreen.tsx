import React, { useCallback, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { RootStackParamList } from "../navigation/types";
import { parseScannedId } from "../lib/parseQr";
import { tick } from "../lib/feedback";
import { colors, fonts, radius } from "../theme";

type Nav = NativeStackNavigationProp<RootStackParamList, "Scanner">;

export default function ScannerScreen() {
  const navigation = useNavigation<Nav>();
  const [permission, requestPermission] = useCameraPermissions();
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

  if (!permission) return <View style={styles.fill} />;

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centerWrap}>
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permBody}>tapbak uses the camera to read customer loyalty QR codes.</Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={permission.canAskAgain ? requestPermission : () => Linking.openSettings()}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>{permission.canAskAgain ? "Allow camera" : "Open Settings"}</Text>
        </TouchableOpacity>
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

      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.reticle} />
        <Text style={styles.hint}>Point at the customer's pass QR</Text>
      </View>

      <SafeAreaView style={styles.topBar} edges={["top"]}>
        <Text style={styles.title}>Scan</Text>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate("Settings")} activeOpacity={0.8}>
          <Text style={styles.iconBtnText}>Settings</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <SafeAreaView style={styles.bottomBar} edges={["bottom"]}>
        <TouchableOpacity style={styles.lookupBtn} onPress={() => navigation.navigate("ManualLookup")} activeOpacity={0.9}>
          <Text style={styles.lookupBtnText}>Enter email / ID manually</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: "#000" },
  centerWrap: { flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 },
  permTitle: { fontFamily: fonts.display, fontSize: 20, color: colors.text },
  permBody: { fontFamily: fonts.body, fontSize: 15, color: colors.textMuted, textAlign: "center" },
  primaryBtn: { backgroundColor: colors.primary, paddingHorizontal: 24, height: 48, justifyContent: "center", borderRadius: radius.md, marginTop: 8 },
  primaryBtnText: { fontFamily: fonts.bodyBold, color: "#fff", fontSize: 16 },
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  reticle: { width: 236, height: 236, borderWidth: 3, borderColor: "rgba(255,255,255,0.92)", borderRadius: 28 },
  hint: { fontFamily: fonts.bodyMedium, color: "#fff", marginTop: 20, fontSize: 15 },
  topBar: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 8 },
  title: { fontFamily: fonts.displayBold, color: "#fff", fontSize: 22 },
  iconBtn: { backgroundColor: "rgba(0,0,0,0.38)", paddingHorizontal: 14, height: 36, justifyContent: "center", borderRadius: radius.sm },
  iconBtnText: { fontFamily: fonts.bodyMedium, color: "#fff", fontSize: 14 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 },
  lookupBtn: { backgroundColor: "rgba(255,255,255,0.96)", height: 52, alignItems: "center", justifyContent: "center", borderRadius: radius.md },
  lookupBtnText: { fontFamily: fonts.bodyBold, color: colors.text, fontSize: 15 },
});
