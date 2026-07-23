import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { useUser } from "../contexts/UserContext";

export default function GoogleAuthButton() {
  const router = useRouter();
  const { fetchUser } = useUser();
  const [loading, setLoading] = useState(false);

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        Alert.alert("Something went wrong", "No ID token received");
        return;
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/googleAuth`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.message);
        return;
      }

      await SecureStore.setItemAsync("token", data.data.token);
      await fetchUser();
      router.replace("/");
    } catch (err) {
      console.error("Google Sign-In error:", err);
      Alert.alert("Something went wrong", "Please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleGoogleAuth} disabled={loading}>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <Text style={styles.text}>Continue with Google</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});