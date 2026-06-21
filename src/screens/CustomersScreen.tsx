import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/types";
import { useCustomerList } from "../hooks/queries";
import { colors, fonts, radius } from "../theme";
import type { Customer } from "../types/api";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function CustomersScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState("");
  const q = useCustomerList(search);
  const customers = q.data?.customers ?? [];

  const renderItem = ({ item }: { item: Customer }) => {
    const initial = (item.name || item.email || "?").charAt(0).toUpperCase();
    const points = item.loyalty_card?.loyalty_points ?? 0;
    const rewards = item.total_rewards ?? 0;
    const inactive = item.status === "inactive";
    return (
      <TouchableOpacity
        style={styles.row}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("CustomerProcess", { idOrEmail: item.id })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.flex}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{item.name || "Customer"}</Text>
            {inactive && <View style={styles.dot} />}
          </View>
          <Text style={styles.email} numberOfLines={1}>{item.email || "—"}</Text>
        </View>
        <View style={styles.metaRight}>
          <Text style={styles.points}>{points}</Text>
          {rewards > 0 && (
            <View style={styles.rewardPill}>
              <Ionicons name="gift" size={11} color={colors.primary} />
              <Text style={styles.rewardPillText}>{rewards}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.fill}>
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textFaint} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search name, email or phone"
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {q.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={customers}
          keyExtractor={(c) => c.id}
          renderItem={renderItem}
          contentContainerStyle={customers.length === 0 ? styles.emptyWrap : { paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          refreshControl={<RefreshControl refreshing={q.isFetching && !q.isLoading} onRefresh={() => q.refetch()} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>{search ? "No customers match your search." : "No customers yet."}</Text>}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.page },
  flex: { flex: 1 },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, paddingHorizontal: 16, height: 50 },
  searchInput: { flex: 1, fontFamily: fonts.body, fontSize: 15, color: colors.text },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 12 },
  avatar: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.displayBold, fontSize: 17, color: colors.primary },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  name: { fontFamily: fonts.bodyMedium, fontSize: 15, color: colors.text },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.danger },
  email: { fontFamily: fonts.body, fontSize: 13, color: colors.textMuted, marginTop: 1 },
  metaRight: { alignItems: "flex-end", gap: 3 },
  points: { fontFamily: fonts.displayBold, fontSize: 17, color: colors.text },
  rewardPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: colors.primarySoft, paddingHorizontal: 7, paddingVertical: 2, borderRadius: radius.pill },
  rewardPillText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.primary },
  sep: { height: 1, backgroundColor: colors.border, marginLeft: 68 },
  emptyWrap: { flexGrow: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  empty: { fontFamily: fonts.body, fontSize: 14, color: colors.textFaint, textAlign: "center" },
});
