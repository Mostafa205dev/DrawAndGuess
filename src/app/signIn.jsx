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
  View,
} from "react-native";
import { useUser } from "../contexts/UserContext";

const { width, height } = Dimensions.get("window");

export default function SignIn() {
  const [name, setname] = useState("");
  const [phone, setPhone] = useState("");
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, phone }),
        },
      );

      const data = await response.json();
      await SecureStore.setItemAsync("token", data.data.token);
      await fetchUser();
      router.push("/");
    } catch (err) {
      console.error("fail to fetch", err);
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
        <Text>Username</Text>
        <TextInput
          placeholder="enter username"
          value={name}
          onChangeText={setname}
          style={styles.input}
        />
        <Text>phone</Text>
        <TextInput
          placeholder="enter phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <Button title="Continue" onPress={handleSignIn} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: width,
    height: height,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 20,
    backgroundColor: "white",
    borderWidth: 1,
    borderRadius: 20,
    width: width * (7 / 10),
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
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
