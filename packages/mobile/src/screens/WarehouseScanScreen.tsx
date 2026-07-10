import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from "react-native";

export function WarehouseScanScreen({ navigation }: any) {
  const [scanResult, setScanResult] = useState("");
  const [manualCode, setManualCode] = useState("");

  const handleScan = () => {
    setScanResult("ST-A11-2");
    Alert.alert("Bin Scanned", "Storage Bin A11-2 assigned for item ORD-20260710-D4E5F6");
  };

  return (
    <View style={styles.container}>
      <View style={styles.scannerArea}>
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <Text style={styles.scannerText}>Point camera at barcode</Text>
        </View>
        <TouchableOpacity style={styles.scanBtn} onPress={handleScan}>
          <Text style={styles.scanBtnText}>Scan Barcode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Or enter code manually</Text>
        <TextInput style={styles.input} placeholder="Enter bin/SKU code" value={manualCode} onChangeText={setManualCode} />
        <TouchableOpacity style={styles.primaryBtn} onPress={() => Alert.alert(`Looking up: ${manualCode || "ST-A11-2"}`)}>
          <Text style={styles.primaryBtnText}>Look Up</Text>
        </TouchableOpacity>
      </View>

      {scanResult ? (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Last Scan</Text>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Bin:</Text><Text style={styles.resultValue}>{scanResult}</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Zone:</Text><Text style={styles.resultValue}>Storage</Text>
          </View>
          <View style={styles.resultItem}>
            <Text style={styles.resultLabel}>Capacity:</Text><Text style={styles.resultValue}>45/100</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scannerArea: { alignItems: "center", padding: 20 },
  scannerFrame: { width: 280, height: 280, borderWidth: 2, borderColor: "transparent", position: "relative", alignItems: "center", justifyContent: "center", backgroundColor: "#F3F4F6", borderRadius: 16 },
  corner: { position: "absolute", width: 30, height: 30, borderColor: "#059669" },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 8 },
  scannerText: { color: "#9CA3AF", fontSize: 14 },
  scanBtn: { backgroundColor: "#059669", borderRadius: 12, padding: 16, width: 280, alignItems: "center", marginTop: 16 },
  scanBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 12 },
  primaryBtn: { backgroundColor: "#059669", borderRadius: 12, padding: 16, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  result: { backgroundColor: "#fff", borderRadius: 12, padding: 16, margin: 20, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  resultTitle: { fontSize: 16, fontWeight: "600", marginBottom: 12 },
  resultItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  resultLabel: { color: "#6B7280", fontSize: 14 },
  resultValue: { fontWeight: "600", fontSize: 14 },
});
