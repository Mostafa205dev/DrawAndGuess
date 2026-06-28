import { Redirect,Stack, usePathname } from "expo-router";
import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { UserProvider, useUser } from "../contexts/UserContext";
function RootLayoutNav() {
  const { user, isLoading } = useUser();
  const pathname = usePathname();
  const hideHeader = pathname === "/signIn";

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

  if (!user) return <Redirect href="/signIn" />;

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
      <RootLayoutNav />
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
