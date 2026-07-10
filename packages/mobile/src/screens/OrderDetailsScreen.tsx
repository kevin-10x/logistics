import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from "react-native";

export function OrderDetailsScreen({ route }: any) {
  const { delivery } = route.params || {};
  const d = delivery || { orderNo: "ORD-20260710-A1B2C3", receiver: "Fatima Al-Hassan", phone: "+234 801 234 5678", address: "12 Marina St, Lagos Island", items: 3, cod: 15000 };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.orderNo}>{d.orderNo}</Text>
        <Text style={styles.status}>Status: In Transit</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sender</Text>
        <Text style={styles.name}>Lagos Distribution Hub</Text>
        <Text style={styles.address}>Plot 7, Apapa-Oshodi Expressway, Lagos</Text>
        <TouchableOpacity onPress={() => Alert.alert("Calling sender...")}>
          <Text style={styles.phone}>+234 800 100 2000</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Receiver</Text>
        <Text style={styles.name}>{d.receiver}</Text>
        <Text style={styles.address}>{d.address}</Text>
        <TouchableOpacity onPress={() => Alert.alert("Calling receiver...")}>
          <Text style={styles.phone}>{d.phone}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Package Details</Text>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Items</Text><Text style={styles.detailValue}>{d.items}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Weight</Text><Text style={styles.detailValue}>5.2 kg</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Declared Value</Text><Text style={styles.detailValue}>₦50,000</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Payment</Text><Text style={styles.detailValue}>{d.cod > 0 ? `COD: ₦${d.cod.toLocaleString()}` : "Prepaid"}</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Vehicle</Text><Text style={styles.detailValue}>Motorbike</Text></View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delivery Notes</Text>
        <Text style={styles.notes}>Call before arriving. Gate code is 4523. Ask for Fatima on 2nd floor.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>SMS Updates</Text>
        <View style={styles.smsItem}><Text style={styles.smsStatus}>✓</Text><Text style={styles.smsText}>Order confirmed - SMS sent</Text></View>
        <View style={styles.smsItem}><Text style={styles.smsStatus}>✓</Text><Text style={styles.smsText}>Out for delivery - SMS sent</Text></View>
        <View style={styles.smsItem}><Text style={styles.smsPending}>○</Text><Text style={styles.smsTextPending}>Delivery completed</Text></View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, margin: 16, marginBottom: 0, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  orderNo: { fontFamily: "monospace", fontSize: 14, color: "#6B7280" },
  status: { fontSize: 14, color: "#059669", fontWeight: "600", marginTop: 4 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  name: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4 },
  address: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  phone: { fontSize: 14, color: "#059669", fontWeight: "500", marginTop: 4 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  detailLabel: { fontSize: 14, color: "#6B7280" },
  detailValue: { fontSize: 14, fontWeight: "500", color: "#111827" },
  notes: { fontSize: 14, color: "#374151", lineHeight: 20 },
  smsItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  smsStatus: { color: "#059669", fontSize: 16, fontWeight: "bold" },
  smsText: { fontSize: 13, color: "#374151" },
  smsPending: { color: "#D1D5DB", fontSize: 16 },
  smsTextPending: { fontSize: 13, color: "#9CA3AF" },
});
