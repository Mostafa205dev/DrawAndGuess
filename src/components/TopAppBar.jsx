import { Text, View ,StyleSheet } from "react-native";

export default function TopAppBar() {
  return (
    <View style={styles.header}>
      <Text>helo test</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 5,
  },
});
