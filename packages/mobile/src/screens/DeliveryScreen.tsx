import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Image } from "react-native";

export function DeliveryScreen({ route, navigation }: any) {
  const { delivery } = route.params || {};
  const [step, setStep] = useState<"arrived" | "proof" | "cod" | "done">("arrived");
  const [notes, setNotes] = useState("");
  const [codCollected, setCodCollected] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);

  const completeDelivery = () => {
    Alert.alert("Delivery Completed", "Proof of delivery has been saved. SMS notification sent to customer.", [
      { text: "OK", onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.statusBar}>
        <View style={[styles.step, step === "arrived" && styles.activeStep]}><Text style={styles.stepText}>1. Arrived</Text></View>
        <View style={[styles.step, step === "proof" && styles.activeStep]}><Text style={styles.stepText}>2. Proof</Text></View>
        <View style={[styles.step, step === "cod" && styles.activeStep]}><Text style={styles.stepText}>3. Payment</Text></View>
        <View style={[styles.step, step === "done" && styles.activeStep]}><Text style={styles.stepText}>4. Done</Text></View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Order Details</Text>
        <Text style={styles.orderNo}>{delivery?.orderNo || "ORD-20260710-A1B2C3"}</Text>
        <Text style={styles.receiver}>{delivery?.receiver || "Fatima Al-Hassan"}</Text>
        <Text style={styles.address}>{delivery?.address || "12 Marina St, Lagos Island"}</Text>
        <Text style={styles.phone}>{delivery?.phone || "+234 801 234 5678"}</Text>
      </View>

      {step === "arrived" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Confirm Arrival</Text>
          <Text style={styles.hint}>Tap the button below when you arrive at the delivery location</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep("proof")}>
            <Text style={styles.primaryBtnText}>I've Arrived at Location</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "proof" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Proof of Delivery</Text>
          <TouchableOpacity style={styles.photoBtn} onPress={() => { setPhotoTaken(true); Alert.alert("Photo Captured"); }}>
            <Text style={styles.photoBtnText}>{photoTaken ? "Photo Captured ✓" : "Take Photo"}</Text>
          </TouchableOpacity>
          <Text style={styles.label}>Customer Signature</Text>
          <View style={styles.signatureBox}>
            <Text style={styles.signaturePlaceholder}>Ask customer to sign here</Text>
          </View>
          <Text style={styles.label}>Delivery Notes</Text>
          <TextInput style={styles.textArea} multiline placeholder="Add any notes..." value={notes} onChangeText={setNotes} />
          <TouchableOpacity style={[styles.primaryBtn, !(photoTaken) && styles.disabledBtn]}
            onPress={() => setStep("cod")} disabled={!photoTaken}>
            <Text style={styles.primaryBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === "cod" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Cash on Delivery</Text>
          {delivery?.cod > 0 ? (
            <>
              <Text style={styles.codAmount}>₦{delivery.cod.toLocaleString()}</Text>
              <TouchableOpacity style={[styles.primaryBtn, styles.codBtn]} onPress={() => { setCodCollected(true); setStep("done"); }}>
                <Text style={styles.primaryBtnText}>Cash Collected</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => { setStep("done"); }}>
                <Text style={styles.secondaryBtnText}>Skip (No COD)</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.noCod}>No Cash on Delivery for this order</Text>
              <TouchableOpacity style={styles.primaryBtn} onPress={() => setStep("done")}>
                <Text style={styles.primaryBtnText}>Continue</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {step === "done" && (
        <View style={styles.card}>
          <View style={styles.doneIcon}><Text style={styles.doneIconText}>✓</Text></View>
          <Text style={styles.doneTitle}>Ready to Complete</Text>
          <Text style={styles.doneSubtitle}>All steps completed. Tap below to finalize delivery.</Text>
          {codCollected && <Text style={styles.codCollected}>COD of ₦{(delivery?.cod || 0).toLocaleString()} collected</Text>}
          <TouchableOpacity style={styles.completeBtn} onPress={completeDelivery}>
            <Text style={styles.completeBtnText}>Complete Delivery</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  statusBar: { flexDirection: "row", padding: 16, gap: 8 },
  step: { flex: 1, padding: 8, borderRadius: 8, backgroundColor: "#E5E7EB", alignItems: "center" },
  activeStep: { backgroundColor: "#059669" },
  stepText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 20, margin: 16, marginTop: 0, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: "#111827", marginBottom: 12 },
  orderNo: { fontFamily: "monospace", color: "#6B7280", fontSize: 13, marginBottom: 4 },
  receiver: { fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 4 },
  address: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  phone: { fontSize: 14, color: "#059669", fontWeight: "500" },
  hint: { fontSize: 14, color: "#6B7280", marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginTop: 16, marginBottom: 8 },
  primaryBtn: { backgroundColor: "#059669", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 12 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  disabledBtn: { opacity: 0.5 },
  photoBtn: { backgroundColor: "#EFF6FF", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 2, borderColor: "#2563EB", borderStyle: "dashed" },
  photoBtnText: { color: "#2563EB", fontSize: 16, fontWeight: "600" },
  signatureBox: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 40, alignItems: "center", backgroundColor: "#F9FAFB" },
  signaturePlaceholder: { color: "#9CA3AF", fontSize: 14 },
  textArea: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 12, minHeight: 80, textAlignVertical: "top", fontSize: 14 },
  codAmount: { fontSize: 32, fontWeight: "bold", color: "#059669", textAlign: "center", marginVertical: 16 },
  codBtn: { backgroundColor: "#059669" },
  secondaryBtn: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 8 },
  secondaryBtnText: { color: "#6B7280", fontSize: 16, fontWeight: "500" },
  noCod: { fontSize: 14, color: "#6B7280", textAlign: "center", marginVertical: 16 },
  doneIcon: { width: 64, height: 64, backgroundColor: "#D1FAE5", borderRadius: 32, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 16 },
  doneIconText: { fontSize: 32, color: "#059669", fontWeight: "bold" },
  doneTitle: { fontSize: 20, fontWeight: "bold", color: "#111827", textAlign: "center" },
  doneSubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center", marginTop: 4 },
  codCollected: { fontSize: 14, color: "#059669", fontWeight: "600", textAlign: "center", marginTop: 12, backgroundColor: "#D1FAE5", padding: 8, borderRadius: 8 },
  completeBtn: { backgroundColor: "#059669", borderRadius: 12, padding: 18, alignItems: "center", marginTop: 20 },
  completeBtnText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
