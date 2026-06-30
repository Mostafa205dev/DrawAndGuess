import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import {
  Button,
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

export default function Header() {
  const { user, token, setUser, fetchUser, logout ,socketRef } = useUser();
  const [notifVisible, setNotifVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const getAvatarUrl = (style) => {
    return `https://api.dicebear.com/7.x/${style}/png?seed=${user?.name || ""}`;
  };

  const setAvatar = async (style) => {
    try {
      setUser((prev) => ({
        ...prev,
        avatar: style,
      }));

      const res = await fetch(
        "https://drawandguessbackend.onrender.com/users/avatar",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ avatar: style }),
        },
      );
      if (!res.ok) throw new Error("Failed");
    } catch (err) {
      console.log(err);
    }
  };

  const HandleAccept = async (id) => {
    try {
      const response = await fetch(
        `https://drawandguessbackend.onrender.com/users/AcceptFriendRequest/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed");

      socketRef.current?.emit("acceptFriendRequest", {
        id,
      });

      fetchUser();
    } catch (err) {
      console.log("cant Accept friend");
    }
  };

  

  const HandleReject = async (id) => {
    try {
      setUser((prev) => ({
        ...prev,
        friendRequests: prev.friendRequests.filter((req) => req._id !== id),
      }));
      const response = await fetch(
        `https://drawandguessbackend.onrender.com/users/DeleteFriendRequest/${id}`,
        {
          method: "Delete",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (err) {
      console.log("cant reject friend");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.container2}>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image
            key={user?.avatar}
            source={{
              uri: getAvatarUrl(user?.avatar || "avataaars"),
            }}
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
      <Button title="Logout" onPress={logout} />
      <View style={styles.container2}>
        <Text style={styles.score}>
          <Ionicons name="star" size={20} color="#FBBF24" />
          <Text>{user?.coins}</Text>
        </Text>

        <Pressable onPress={() => setNotifVisible(true)}>
          <Ionicons
            style={styles.notifications}
            name="notifications-outline"
            size={24}
            color="white"
          />
        </Pressable>
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
                    user?.avatar === item && styles.selected,
                  ]}
                  onPress={async () => {
                    await setAvatar(item);
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

      <Modal visible={notifVisible} transparent animationType="slide">
        <Pressable
          style={styles.overlay}
          onPress={() => setNotifVisible(false)}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Friend Requests</Text>
            {user?.friendRequests?.length === 0 ? (
              <Text
                style={{ textAlign: "center", color: "#888", marginTop: 20 }}
              >
                No friend requests
              </Text>
            ) : (
              user?.friendRequests?.map((req) => (
                <View key={req._id} style={styles.reqRow}>
                  <Image
                    source={{
                      uri: `https://api.dicebear.com/7.x/${req.avatar}/png?seed=${req.name}`,
                    }}
                    style={styles.reqAvatar}
                  />
                  <Text style={styles.reqName}>{req.name}</Text>
                  <View style={styles.reqButtons}>
                    <Pressable
                      style={[styles.reqBtn, { backgroundColor: "#22c55e" }]}
                      onPress={() => HandleAccept(req._id)}
                    >
                      <Text style={styles.reqBtnText}>✓</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.reqBtn, { backgroundColor: "#ef4444" }]}
                      onPress={() => HandleReject(req._id)}
                    >
                      <Text style={styles.reqBtnText}>✕</Text>
                    </Pressable>
                  </View>
                </View>
              ))
            )}
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
  reqRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  reqAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  reqName: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  reqButtons: {
    flexDirection: "row",
    gap: 8,
  },
  reqBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  reqBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});
