import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";

export default function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const { phone } = useLocalSearchParams();
  const router = useRouter();

  const handleVerify = async () => {
    try {
      const response = await fetch(
        "https://drawandguessbackend.onrender.com/users/verifyOtp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone, otp }),
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        await SecureStore.setItemAsync("token", data.data.token);
        router.push("/");
      } else {
        console.error(data.msg);
      }
    } catch (err) {
      console.error("fail to fetch", err);
    }
  };

  return (
    <View style={styles.container}>
      <Text>Enter OTP sent to {phone}</Text>
      <TextInput
        placeholder="OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        style={styles.input}
      />
      <Button title="Verify" onPress={handleVerify} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, gap: 8 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8 },
});