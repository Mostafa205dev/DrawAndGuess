import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useUser } from "../contexts/UserContext";
const { width } = Dimensions.get("window");

const AVATAR_STYLES = [
  "avataaars",
  "bottts",
  "fun-emoji",
  "pixel-art",
  "lorelei",
  "thumbs",
];

export default function Header({ name = "Mostafa" }) {
  const [selectedStyle, setSelectedStyle] = useState("avataaars");
  const [modalVisible, setModalVisible] = useState(false);
  const { user } = useUser();
  const getAvatarUrl = (style) => {
    return `https://api.dicebear.com/7.x/${style}/png?seed=${name}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            source={{ uri: getAvatarUrl(selectedStyle) }}
            style={styles.Avatar}
          />
          <View style={styles.plusBadge}>
            <Ionicons name="add" size={14} color="white" />
          </View>
        </TouchableOpacity>
        <View>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
      </View>

      <View style={styles.container2}>
        <Text style={styles.score}>
          <Ionicons name="star" size={20} color="#FBBF24" />
          <Text>{user.coins}</Text>
        </Text>
        <Ionicons
          style={styles.notifications}
          name="notifications-outline"
          size={24}
          color="white"
        />
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable
          style={styles.overlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>choose Avatar</Text>
            <FlatList
              data={AVATAR_STYLES}
              numColumns={3}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.avatarOption,
                    selectedStyle === item && styles.selected,
                  ]}
                  onPress={() => {
                    setSelectedStyle(item);
                    setModalVisible(false);
                  }}
                >
                  <Image
                    source={{ uri: getAvatarUrl(item) }}
                    style={styles.optionImage}
                  />
                  <Text style={styles.optionLabel}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#1e3a67",
    width: width,
    padding: 5,
  },
  container2: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  Avatar: {
    width: 70,
    height: 70,
    borderRadius: 30,
  },
  plusBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  name: {
    borderBottomWidth: 5,
    borderBottomColor: "#e1dbe7",
    color: "white",
  },
  notifications: {
    backgroundColor: "#3c3344",
    borderRadius: 30,
    padding: 6,
  },
  score: {
    borderRadius: 20,
    borderColor: "#3c3344",
    backgroundColor: "#3c3344",
    color: "white",
    padding: 5,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modal: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  avatarOption: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    margin: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selected: {
    borderColor: "#3b82f6",
    backgroundColor: "#eff6ff",
  },
  optionImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  optionLabel: {
    fontSize: 10,
    marginTop: 4,
    color: "#555",
  },
});
