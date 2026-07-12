import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";

export default function QuickPlayIcon() {
  return (
    <View style={styles.iconWrapper}>
      <Ionicons name="flash" size={22} color="#3B82F6" />
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
});