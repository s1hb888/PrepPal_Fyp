import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import axios from "axios";
import * as Linking from "expo-linking";
import API_BASE_URL from "./config";

const VerifyEmail = ({ navigation }) => {
  const [status, setStatus] = useState("Verifying...");
  const [verifying, setVerifying] = useState(true);

  const verifyEmail = async (email, token) => {
    try {
      await axios.post(`${API_BASE_URL}/api/verify-email`, { email, token });
      setStatus("✅ Email verified successfully! Redirecting to login...");
      setTimeout(() => navigation.replace("Login"), 2000);
    } catch (err) {
      console.error("Verification failed:", err.response?.data || err.message);
      setStatus("❌ Verification failed. The link may be invalid or expired.");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    const handleUrl = ({ url }) => {
      const { queryParams } = Linking.parse(url);
      const token = queryParams?.token;
      const email = queryParams?.email;
      if (token && email) verifyEmail(email, token);
      else {
        setStatus("❌ Invalid verification link.");
        setVerifying(false);
      }
    };

    const subscription = Linking.addEventListener("url", handleUrl);

    // If app opened directly via link
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
      else {
        setStatus("Open the verification link from your email to verify.");
        setVerifying(false);
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{status}</Text>
      {verifying && <ActivityIndicator size="large" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  text: { fontSize: 16, fontWeight: "bold", color: "#000", textAlign: "center" },
});

export default VerifyEmail;
