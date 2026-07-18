import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { Stack, usePathname, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { SocketProvider } from "../contexts/SocketContext";
import { UserProvider, useUser } from "../contexts/UserContext";
function RootLayoutNav() {
  const { user, isLoading, token } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const hideHeader =
    pathname === "/signIn" ||
    pathname === "/gameScreen" ||
    pathname === "/results" ||
    pathname === "/room" ||
    pathname === "/about" ||
    pathname === "/signUp" ||
    pathname === "/verifyOtp";
  const checkCurrentRoom = async () => {
    try {
      const response = await fetch(
        "https://drawandguessbackend.onrender.com/rooms/myRoom",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!data.data) return;

      if (data.data.status === "waiting") {
        router.replace({
          pathname: "/room",
          params: {
            room: JSON.stringify(data.data),
          },
        });
      }

      if (data.data.status === "playing") {
        router.replace({
          pathname: "/gameScreen",
          params: {
            room: JSON.stringify(data.data),
          },
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/signIn");
      return;
    }

    checkCurrentRoom();
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <LottieView
          source={require("../../assets/images/loading.json")}
          autoPlay
          loop
          style={{ width: 200, height: 200 }}
        />
      </View>
    );
  }

  GoogleSignin.configure({
    webClientId:
      "1057462092840-iipv03f9fi8mh3hr7uvrchfe9mhb3bmd.apps.googleusercontent.com",
    offlineAccess: false,
  });

  return (
    <SafeAreaView style={styles.root}>
      {!hideHeader && <Header />}
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="about" />
        <Stack.Screen name="signIn" />
        <Stack.Screen name="room" />
        <Stack.Screen name="gameScreen" />
        <Stack.Screen name="results" />
      </Stack>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <UserProvider>
      <SocketProvider>
        <RootLayoutNav />
      </SocketProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
