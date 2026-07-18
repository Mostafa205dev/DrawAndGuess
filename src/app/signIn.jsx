import { useRouter } from "expo-router";
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
import GoogleAuthButton from "../components/GoogleAuthButton";

const { width, height } = Dimensions.get("window");

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const { fetchUser } = useUser();
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://drawandguessbackend.onrender.com/users/signIn",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/images/loading.json")}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <Text>Signing in...</Text>
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
        <Text>Email</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <Text>Password</Text>
        <TextInput
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity onPress={() => router.push("/verifyOtp")}>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button title="Sign In" onPress={handleSignIn} />

        <TouchableOpacity onPress={() => router.push("/signUp")}>
          <Text>Don't have an account? </Text>
          <Text style={styles.signUp}>
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>
      <GoogleAuthButton />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width,
    height,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 20,
    width: width * 0.75,
    gap: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
  },

  forgotPassword: {
    alignSelf: "flex-end",
    color: "#007AFF",
    marginBottom: 10,
  },

  signUp: {
    marginTop: 15,
    textAlign: "center",
    color: "#007AFF",
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