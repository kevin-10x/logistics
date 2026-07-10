import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Dimensions } from "react-native";

const MOCK_ROUTE = {
  stops: [
    { id: 1, address: "12 Marina St, Lagos Island", lat: 6.4541, lng: 3.3947, status: "completed", label: "Stop 1 - Delivered" },
    { id: 2, address: "45 Broad St, Lagos Island", lat: 6.4532, lng: 3.3928, status: "current", label: "Stop 2 - Current" },
    { id: 3, address: "78 Balogun St, Lagos Island", lat: 6.4555, lng: 3.3961, status: "pending", label: "Stop 3" },
    { id: 4, address: "23 King St, Lagos Island", lat: 6.4520, lng: 3.3910, status: "pending", label: "Stop 4" },
    { id: 5, address: "56 Nnamdi Azikiwe St", lat: 6.4568, lng: 3.3975, status: "pending", label: "Stop 5" },
  ],
  totalDistance: "12.5 km",
  estimatedTime: "1h 45m",
};

export function RouteMapScreen({ navigation }: any) {
  const [activeStop, setActiveStop] = useState(1);

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>Map View</Text>
        <Text style={styles.mapSubtext}>Route optimization active</Text>
        <Text style={styles.mapInfo}>5 stops • {MOCK_ROUTE.totalDistance} • {MOCK_ROUTE.estimatedTime}</Text>
      </View>

      <View style={styles.bottomSheet}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>Optimized Route</Text>

        {MOCK_ROUTE.stops.map((stop, index) => (
          <TouchableOpacity key={stop.id}
            style={[styles.stopItem, stop.status === "current" && styles.currentStop]}
            onPress={() => setActiveStop(index)}>
            <View style={styles.stopLeft}>
              <View style={[styles.stopNumber,
                stop.status === "completed" && styles.stopCompleted,
                stop.status === "current" && styles.stopCurrent,
              ]}>
                <Text style={styles.stopNumberText}>{stop.status === "completed" ? "✓" : index + 1}</Text>
              </View>
              {index < MOCK_ROUTE.stops.length - 1 && <View style={styles.stopLine} />}
            </View>
            <View style={styles.stopInfo}>
              <Text style={styles.stopLabel}>{stop.label}</Text>
              <Text style={styles.stopAddress}>{stop.address}</Text>
            </View>
            {stop.status === "current" && (
              <TouchableOpacity style={styles.navigateBtn} onPress={() => Alert.alert("Opening GPS")}>
                <Text style={styles.navigateBtnText}>Go</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E5E7EB" },
  mapPlaceholder: { flex: 1, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center" },
  mapText: { fontSize: 24, fontWeight: "bold", color: "#059669" },
  mapSubtext: { fontSize: 14, color: "#047857", marginTop: 4 },
  mapInfo: { fontSize: 13, color: "#065F46", marginTop: 8, backgroundColor: "rgba(255,255,255,0.8)", padding: 8, borderRadius: 8 },
  bottomSheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: "50%" },
  handle: { width: 40, height: 4, backgroundColor: "#D1D5DB", borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 16 },
  stopItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  currentStop: { backgroundColor: "#F0FDF4", borderRadius: 8, padding: 8, marginHorizontal: -8 },
  stopLeft: { alignItems: "center", marginRight: 12 },
  stopNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#E5E7EB", alignItems: "center", justifyContent: "center" },
  stopCompleted: { backgroundColor: "#059669" },
  stopCurrent: { backgroundColor: "#2563EB" },
  stopNumberText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  stopLine: { width: 2, height: 24, backgroundColor: "#D1D5DB", marginTop: 4 },
  stopInfo: { flex: 1 },
  stopLabel: { fontSize: 14, fontWeight: "600", color: "#111827" },
  stopAddress: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  navigateBtn: { backgroundColor: "#059669", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  navigateBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },
});
