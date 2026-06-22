import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

export default function CreateRoomIcon() {
  return (
    <View style={styles.iconWrapper}>
      <Ionicons name="person-add" size={22} color="#22C55E" />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1A2E22",
    alignItems: "center",
    justifyContent: "center",
  },
});