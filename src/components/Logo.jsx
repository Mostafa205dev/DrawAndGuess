import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

export default function Logo() {
  return (
    <View style={styles.container}>
      <Ionicons name="pencil" size={32} color="white" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#c00db7",
    alignItems: "center",
    justifyContent: "center",
  },
});