import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import LottieView from "lottie-react-native";
import { useState } from "react";
import {
  Button,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../contexts/UserContext";

const { width, height } = Dimensions.get("window");

export default function VerifyOTP() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const { fetchUser } = useUser();
  const handleVerify = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://drawandguessbackend.onrender.com/users/verifyOtp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            otp,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      await SecureStore.setItemAsync("token", data.data.token);

      await fetchUser();

      router.replace("/");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    // Resend OTP API
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/images/loading.json")}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text>Verifying...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={styles.body}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Text style={styles.title}>Verification Code</Text>

        <Text style={styles.description}>
          Enter the 6-digit code sent to your email.
        </Text>

        <TextInput
          placeholder="123456"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
          style={styles.input}
        />

        <Button title="Verify" onPress={handleVerify} />

        <TouchableOpacity onPress={handleResend}>
          <Text style={styles.resend}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  container: {
    width: width * 0.75,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },

  description: {
    textAlign: "center",
    color: "gray",
    marginBottom: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
  },

  resend: {
    textAlign: "center",
    color: "#007AFF",
    marginTop: 10,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },

  loadingAnimation: {
    width: 200,
    height: 200,
  },
});
