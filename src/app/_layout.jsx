import { Stack, usePathname } from "expo-router";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Header from "../components/Header";
import { UserProvider } from "../contexts/UserContext";

export default function RootLayout() {
  const pathname = usePathname();
  const hideHeader = pathname === "/signIn";
  return (
    <UserProvider>
      <SafeAreaView style={styles.root}>
        {!hideHeader && <Header />}
        <Stack
          initialRouteName="signIn"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="about" />
          <Stack.Screen name="signIn" />
        </Stack>
      </SafeAreaView>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});