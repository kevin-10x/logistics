import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch } from "react-native";

export function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}><Text style={styles.avatarText}>CO</Text></View>
        <Text style={styles.name}>Chidi Okafor</Text>
        <Text style={styles.role}>Delivery Driver</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Performance</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}><Text style={styles.statValue}>1,247</Text><Text style={styles.statLabel}>Total Deliveries</Text></View>
          <View style={styles.statItem}><Text style={styles.statValue}>4.8</Text><Text style={styles.statLabel}>Rating</Text></View>
          <View style={styles.statItem}><Text style={styles.statValue}>98.2%</Text><Text style={styles.statLabel}>Success Rate</Text></View>
          <View style={styles.statItem}><Text style={styles.statValue}>32 min</Text><Text style={styles.statLabel}>Avg Time</Text></View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>SMS Notifications</Text>
          <Switch value={true} trackColor={{ true: "#059669" }} />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch value={true} trackColor={{ true: "#059669" }} />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>GPS Tracking</Text>
          <Switch value={true} trackColor={{ true: "#059669" }} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Language</Text>
        <View style={styles.langGrid}>
          {["English", "Fran\u00E7ais", "Kiswahili", "Hausa", "Yoruba"].map((lang) => (
            <TouchableOpacity key={lang} style={[styles.langBtn, lang === "English" && styles.langBtnActive]}>
              <Text style={[styles.langText, lang === "English" && styles.langTextActive]}>{lang}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Vehicle</Text>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Vehicle</Text><Text style={styles.detailValue}>Lagos Express</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Plate</Text><Text style={styles.detailValue}>LAG-123-AB</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Type</Text><Text style={styles.detailValue}>Truck</Text></View>
        <View style={styles.detailRow}><Text style={styles.detailLabel}>Fuel</Text><Text style={styles.detailValue}>72%</Text></View>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert("Logged Out")}>
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: { backgroundColor: "#059669", padding: 24, alignItems: "center" },
  avatar: { width: 72, height: 72, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "bold" },
  name: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  role: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 2 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, margin: 16, marginBottom: 0, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 12, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statItem: { width: "47%", backgroundColor: "#F9FAFB", borderRadius: 8, padding: 12, alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "bold", color: "#059669" },
  statLabel: { fontSize: 11, color: "#6B7280", marginTop: 4 },
  settingItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  settingLabel: { fontSize: 14, color: "#374151" },
  langGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  langBtn: { backgroundColor: "#F3F4F6", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  langBtnActive: { backgroundColor: "#059669" },
  langText: { fontSize: 14, color: "#374151" },
  langTextActive: { color: "#fff", fontWeight: "600" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  detailLabel: { fontSize: 14, color: "#6B7280" },
  detailValue: { fontSize: 14, fontWeight: "500" },
  logoutBtn: { margin: 16, backgroundColor: "#FEE2E2", borderRadius: 12, padding: 16, alignItems: "center" },
  logoutBtnText: { color: "#DC2626", fontSize: 16, fontWeight: "600" },
});
