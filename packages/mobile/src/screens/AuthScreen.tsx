import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from "react-native";

export function AuthScreen({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendOtp = () => {
    if (!phone || phone.length < 10) {
      Alert.alert("Invalid Phone", "Please enter a valid phone number");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      Alert.alert("OTP Sent", `Verification code sent to ${phone}`);
    }, 1500);
  };

  const verifyOtp = () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Invalid OTP", "Please enter the verification code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>AL</Text>
          </View>
          <Text style={styles.title}>AfriLogistics</Text>
          <Text style={styles.subtitle}>Driver Delivery App</Text>
        </View>

        <View style={styles.form}>
          {!otpSent ? (
            <>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} placeholder="+234 801 234 5678" placeholderTextColor="#9CA3AF" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={sendOtp} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? "Sending..." : "Send Verification Code"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter Code</Text>
              <Text style={styles.hint}>Code sent to {phone}</Text>
              <TextInput style={[styles.input, styles.otpInput]} placeholder="0000" placeholderTextColor="#9CA3AF" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
              <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={verifyOtp} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? "Verifying..." : "Verify & Sign In"}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(""); }}>
                <Text style={styles.linkText}>Change Phone Number</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.countries}>
            <Text style={styles.countryLabel}>Supported Countries</Text>
            <Text style={styles.countryList}>Nigeria • Kenya • Ghana • South Africa • Tanzania • Uganda • Ethiopia • Senegal • Rwanda</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#059669" },
  content: { flex: 1, justifyContent: "center", padding: 24 },
  logoContainer: { alignItems: "center", marginBottom: 48 },
  logo: { width: 80, height: 80, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  logoText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  title: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  subtitle: { color: "rgba(255,255,255,0.8)", fontSize: 16, marginTop: 4 },
  form: { backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  label: { fontSize: 14, fontWeight: "600", color: "#374151", marginBottom: 8 },
  hint: { fontSize: 13, color: "#6B7280", marginBottom: 12 },
  input: { backgroundColor: "#F3F4F6", borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: "#E5E7EB" },
  otpInput: { fontSize: 24, textAlign: "center", letterSpacing: 8 },
  button: { backgroundColor: "#059669", borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 12 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  linkText: { color: "#059669", textAlign: "center", fontSize: 14, marginTop: 8 },
  countries: { marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E5E7EB" },
  countryLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 4 },
  countryList: { fontSize: 11, color: "#6B7280", lineHeight: 16 },
});
