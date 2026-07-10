import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert } from "react-native";
import { useOffline } from "../context/OfflineContext";

const MOCK_DRIVER = {
  name: "Chidi Okafor",
  vehicle: "Lagos Express",
  plate: "LAG-123-AB",
  todayDeliveries: 8,
  completedDeliveries: 5,
  rating: 4.8,
};

const MOCK_DELIVERIES = [
  { id: "1", orderNo: "ORD-20260710-A1B2C3", receiver: "Fatima Al-Hassan", phone: "+234 801 234 5678", address: "12 Marina St, Lagos Island", status: "next", items: 3, cod: 15000 },
  { id: "2", orderNo: "ORD-20260710-D4E5F6", receiver: "Bola Tinubu Jr", phone: "+234 802 345 6789", address: "45 Broad St, Lagos Island", status: "pending", items: 1, cod: 0 },
  { id: "3", orderNo: "ORD-20260710-G7H8I9", receiver: "Emeka Nwosu", phone: "+234 803 456 7890", address: "78 Balogun St, Lagos Island", status: "pending", items: 2, cod: 25000 },
  { id: "4", orderNo: "ORD-20260710-J0K1L2", receiver: "Aisha Bello", phone: "+234 804 567 8901", address: "23 King St, Lagos Island", status: "pending", items: 1, cod: 8000 },
  { id: "5", orderNo: "ORD-20260710-M3N4O5", receiver: "Yemi Osinbajo III", phone: "+234 805 678 9012", address: "56 Nnamdi Azikiwe St", status: "pending", items: 4, cod: 45000 },
];

export function DriverHomeScreen({ navigation }: any) {
  const [refreshing, setRefreshing] = useState(false);
  const [deliveries, setDeliveries] = useState(MOCK_DELIVERIES);
  const { pendingActions, isOnline } = useOffline();

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const nextDelivery = deliveries.find((d) => d.status === "next");

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.driverName}>{MOCK_DRIVER.name}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{MOCK_DRIVER.name[0]}</Text></View>
          </TouchableOpacity>
        </View>

        {!isOnline && (
          <View style={styles.offlineBar}>
            <Text style={styles.offlineText}>Offline Mode • {pendingActions} pending sync</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{MOCK_DRIVER.completedDeliveries}/{MOCK_DRIVER.todayDeliveries}</Text>
          <Text style={styles.statLabel}>Deliveries</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{MOCK_DRIVER.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{deliveries.filter((d) => d.status === "pending").length}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      {nextDelivery && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Delivery</Text>
          <TouchableOpacity style={styles.nextDeliveryCard} onPress={() => navigation.navigate("Delivery", { delivery: nextDelivery })}>
            <View style={styles.deliveryHeader}>
              <Text style={styles.orderNo}>{nextDelivery.orderNo}</Text>
              <View style={styles.nextBadge}><Text style={styles.nextBadgeText}>NEXT</Text></View>
            </View>
            <Text style={styles.receiverName}>{nextDelivery.receiver}</Text>
            <Text style={styles.address}>{nextDelivery.address}</Text>
            <View style={styles.deliveryMeta}>
              <Text style={styles.items}>{nextDelivery.items} item(s)</Text>
              {nextDelivery.cod > 0 && <Text style={styles.cod}>COD: ₦{nextDelivery.cod.toLocaleString()}</Text>}
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.navigateBtn} onPress={() => navigation.navigate("RouteMap")}>
                <Text style={styles.navigateBtnText}>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert("Calling", `Calling ${nextDelivery.phone}`)}>
                <Text style={styles.callBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deliverBtn} onPress={() => navigation.navigate("Delivery", { delivery: nextDelivery })}>
                <Text style={styles.deliverBtnText}>Deliver</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>All Deliveries ({deliveries.length})</Text>
        {deliveries.map((d) => (
          <TouchableOpacity key={d.id} style={styles.deliveryItem}
            onPress={() => navigation.navigate("OrderDetails", { delivery: d })}>
            <View style={styles.deliveryItemLeft}>
              <View style={[styles.statusDot, d.status === "next" ? styles.statusNext : d.status === "completed" ? styles.statusDone : styles.statusPending]} />
              <View>
                <Text style={styles.deliveryItemTitle}>{d.receiver}</Text>
                <Text style={styles.deliveryItemAddr}>{d.address}</Text>
              </View>
            </View>
            <View style={styles.deliveryItemRight}>
              <Text style={styles.deliveryItemItems}>{d.items} items</Text>
              {d.cod > 0 && <Text style={styles.deliveryItemCod}>₦{d.cod.toLocaleString()}</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.warehouseBtn} onPress={() => navigation.navigate("WarehouseScan")}>
          <Text style={styles.warehouseBtnText}>Scan Warehouse Barcode</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { backgroundColor: "#059669", paddingTop: 60, paddingBottom: 24, paddingHorizontal: 20 },
  headerContent: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { color: "rgba(255,255,255,0.8)", fontSize: 14 },
  driverName: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  avatar: { width: 44, height: 44, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  offlineBar: { backgroundColor: "#FCD34D", borderRadius: 8, padding: 8, marginTop: 12, alignItems: "center" },
  offlineText: { color: "#92400E", fontSize: 12, fontWeight: "600" },
  statsRow: { flexDirection: "row", padding: 16, gap: 12, marginTop: -12 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  statNumber: { fontSize: 20, fontWeight: "bold", color: "#059669" },
  statLabel: { fontSize: 12, color: "#6B7280", marginTop: 4 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#374151", marginBottom: 12 },
  nextDeliveryCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, borderLeftWidth: 4, borderLeftColor: "#059669", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  deliveryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  orderNo: { fontSize: 12, color: "#6B7280", fontFamily: "monospace" },
  nextBadge: { backgroundColor: "#059669", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  nextBadgeText: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  receiverName: { fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 4 },
  address: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
  deliveryMeta: { flexDirection: "row", gap: 16, marginBottom: 12 },
  items: { fontSize: 13, color: "#6B7280" },
  cod: { fontSize: 13, color: "#059669", fontWeight: "600" },
  actionRow: { flexDirection: "row", gap: 8 },
  navigateBtn: { flex: 1, backgroundColor: "#EFF6FF", borderRadius: 8, padding: 12, alignItems: "center" },
  navigateBtnText: { color: "#2563EB", fontWeight: "600", fontSize: 13 },
  callBtn: { flex: 1, backgroundColor: "#F0FDF4", borderRadius: 8, padding: 12, alignItems: "center" },
  callBtnText: { color: "#059669", fontWeight: "600", fontSize: 13 },
  deliverBtn: { flex: 1, backgroundColor: "#059669", borderRadius: 8, padding: 12, alignItems: "center" },
  deliverBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  deliveryItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 8, shadowColor: "#000", shadowOpacity: 0.03, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  deliveryItemLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusNext: { backgroundColor: "#059669" },
  statusDone: { backgroundColor: "#10B981" },
  statusPending: { backgroundColor: "#D1D5DB" },
  deliveryItemTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  deliveryItemAddr: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  deliveryItemRight: { alignItems: "flex-end" },
  deliveryItemItems: { fontSize: 12, color: "#6B7280" },
  deliveryItemCod: { fontSize: 13, fontWeight: "600", color: "#059669", marginTop: 2 },
  warehouseBtn: { backgroundColor: "#7C3AED", borderRadius: 12, padding: 16, alignItems: "center" },
  warehouseBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
