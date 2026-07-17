import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useState } from "react";
import {
  Button,
  Dimensions,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function SignUp() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "https://drawandguessbackend.onrender.com/users/signUp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: username,
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Account created successfully!");
      router.replace("/signIn");
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
        <Text>Creating Account...</Text>
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
          placeholder="Enter username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />

        <Text>Email</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Text>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.passwordInput}
          />

          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </Pressable>
        </View>

        <Button title="Sign Up" onPress={handleSignUp} />

        <TouchableOpacity onPress={() => router.replace("/signIn")}>
          <Text style={styles.signIn}>Already have an account? Sign In</Text>
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

  signIn: {
    textAlign: "center",
    color: "#007AFF",
    marginTop: 15,
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },

  showText: {
    color: "#007AFF",
    fontWeight: "bold",
  },
});
