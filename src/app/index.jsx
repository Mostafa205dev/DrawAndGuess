import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Button,
  Dimensions,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import CreateRoomIcon from "../components/CreateRoomIcon";
import Logo from "../components/Logo";
import QuickPlayIcon from "../components/QuickPlayIcon";
import { useUser } from "../contexts/UserContext";
const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const router = useRouter();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [searchText, setSearchText] = useState("");
  const { user, token, socketRef, onlineFriends } = useUser();
  const [results, setResults] = useState([]);
  const [roomCode, setRoomCode] = useState("");
  const [showFriendOptions, setShowFriendOptions] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const searchUsers = async (text) => {
    setSearchText(text);
    if (text.length === 0) return setResults([]);

    const response = await fetch(
      "https://drawandguessbackend.onrender.com/users",
    );
    const data = await response.json();

    const filtered = data.data.filter(
      (u) =>
        u.name.toLowerCase().includes(text.toLowerCase()) &&
        u._id !== user._id &&
        !user.friends.some((f) => f._id === u._id),
    );
    setResults(filtered);
  };

  const SentFriendReq = async (id) => {
    try {
      const response = await fetch(
        `https://drawandguessbackend.onrender.com/users/friendRequest/${id}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!response.ok) throw new Error("Failed");
      setResults((prev) => prev.filter((u) => u._id !== id));
      socketRef.current?.emit("sendFriendRequest", {
        id,
      });
    } catch (err) {
      console.log("cant add friend");
    }
  };

  const handleCreateRoom = async () => {
    try {
      const response = await fetch(
        "https://drawandguessbackend.onrender.com/rooms/createRoom",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );
      const data = await response.json();

      router.push({
        pathname: "/room",
        params: { room: JSON.stringify(data.data) },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleJoinRoom = async () => {
    try {
      const response = await fetch(
        "https://drawandguessbackend.onrender.com/rooms/joinRoom",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: roomCode }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      router.push({
        pathname: "/room",
        params: { room: JSON.stringify(data.data) },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleQuickplay = async () => {
    try {
      const response = await fetch(
        "https://drawandguessbackend.onrender.com/rooms/quickPlay",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        },
      );
      if (!response.ok) {
        console.log(await response.text());
        return;
      }

      const data = await response.json();

      router.push({
        pathname: "/room",
        params: {
          room: JSON.stringify(data.data),
        },
      });
    } catch (err) {
      console.log(err);
    }
  };

  const sentPrivateRoomInvite = async (friendId) => {
    const response = await fetch(
      "https://drawandguessbackend.onrender.com/rooms/createRoom",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "private" }),
      },
    );
    const data = await response.json();

    socketRef.current?.emit("roomInvite", {
      friendId,
      roomCode: data.data.code,
      from: { _id: user._id, name: user.name, avatar: user.avatar },
    });

    router.push({
      pathname: "/room",
      params: { room: JSON.stringify(data.data) },
    });
  };

  const sentPublicRoomInvite = async (friendId) => {
    const response = await fetch(
      "https://drawandguessbackend.onrender.com/rooms/createRoom",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: "public" }),
      },
    );
    const data = await response.json();

    socketRef.current?.emit("roomInvite", {
      friendId,
      roomCode: data.data.code,
      from: { _id: user._id, name: user.name, avatar: user.avatar },
    });

    router.push({
      pathname: "/room",
      params: { room: JSON.stringify(data.data) },
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={styles.body}
      resizeMode="cover"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.talk}>
          <Logo />
          <Text style={styles.title}>Draw & Guess</Text>
          <Text style={styles.description}>
            Sketch it. Guess it. Laugh about it.
          </Text>
        </View>

        <View style={styles.play}>
          <Pressable onPress={() => handleQuickplay()}>
            <View style={styles.titleplay}>
              <QuickPlayIcon />
              <Text style={styles.title}>Quick play</Text>
              <Text style={styles.description}>Public match</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => handleCreateRoom()}>
            <View style={styles.titleplay}>
              <CreateRoomIcon />
              <Text style={styles.title}>Create room</Text>
              <Text style={styles.description}>with friends</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.joinroom}>
          <Text style={styles.joinroomTitle}>Join Room</Text>

          <TextInput
            placeholder="Enter room code"
            placeholderTextColor="#999"
            value={roomCode}
            onChangeText={setRoomCode}
            style={styles.codeInput}
            autoCapitalize="characters"
          />

          <Pressable style={styles.joinButton} onPress={handleJoinRoom}>
            <Text style={styles.joinButtonText}>Join</Text>
          </Pressable>
        </View>

        <View style={styles.friendsHeader}>
          <View style={styles.friendsHeaderRow}>
            <Text style={styles.joinroomText}>Friends </Text>
            <Text style={styles.joinroomText}>
              {onlineFriends.length} online{" "}
            </Text>
          </View>
          <View>
            <Button title="Add" onPress={() => setShowAddFriend(true)} />
          </View>
        </View>

        <View style={styles.friendsList}>
          {user?.friends?.map((friend) => (
            <Pressable
              onPress={() => {
                setSelectedFriend(friend);
                setShowFriendOptions(true);
              }}
            >
              <View style={styles.friend} key={friend._id}>
                <Image
                  source={{
                    uri: `https://api.dicebear.com/7.x/${friend.avatar}/png?seed=${friend.name}`,
                  }}
                  style={styles.Avatar}
                />
                <View>
                  <Text style={styles.joinroomText}>{friend.name}</Text>
                  <Text style={styles.joinroomText}>
                    {onlineFriends.includes(friend._id.toString())
                      ? "Online"
                      : "Offline"}
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <Button title="Go to About" onPress={() => router.push("/about")} />
      </ScrollView>
      {/* add friend modal */}
      <Modal
        visible={showAddFriend}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddFriend(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Friend</Text>
              <Pressable onPress={() => setShowAddFriend(false)}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search by username"
              placeholderTextColor="#888"
              value={searchText}
              onChangeText={searchUsers}
            />

            <View style={styles.resultsList}>
              {searchText.length === 0 ? (
                <Text style={styles.emptyText}>
                  Start typing a username to search
                </Text>
              ) : results.length === 0 ? (
                <Text style={styles.emptyText}>No users found</Text>
              ) : (
                results.map((u) => (
                  <View key={u._id} style={styles.friend}>
                    <Image
                      source={{
                        uri: `https://api.dicebear.com/7.x/${u.avatar}/png?seed=${u.name}`,
                      }}
                      style={styles.Avatar}
                    />
                    <Text style={styles.joinroomText}>{u.name}</Text>
                    <Button title="Add" onPress={() => SentFriendReq(u._id)} />
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* friend options modal */}
      <Modal
        visible={showFriendOptions}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFriendOptions(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Friend Options</Text>
              <Pressable onPress={() => setShowFriendOptions(false)}>
                <Text style={styles.closeText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.friendOptionsList}>
              <Button
                title="Send Private Room Invite "
                onPress={() => {
                  setShowFriendOptions(false);
                  sentPrivateRoomInvite(selectedFriend._id);
                }}
              />
              <Button
                title="Send Public Room Invite "
                onPress={() => {
                  setShowFriendOptions(false);
                  sentPublicRoomInvite(selectedFriend._id);
                }}
              />
              <Button
                title="Join room"
                onPress={() => {
                  setShowFriendOptions(false);
                  joinRoom(selectedFriend._id);
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: width,
    height: height,
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
  talk: {
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#951ba5",
    padding: 10,
    width: width * (10 / 11),
  },
  titleplay: {
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "column",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#951ba5",
    padding: 10,
    width: width * (5 / 11),
  },
  description: {
    color: "white",
    fontSize: 10,
  },
  play: {
    flexDirection: "row",
    gap: 5,
  },
  joinroom: {
    width: "100%",
    backgroundColor: "#3c3344",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    alignItems: "center",
  },
  joinroomTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  codeInput: {
    width: "100%",
    backgroundColor: "#51465c",
    color: "white",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    textAlign: "center",
    letterSpacing: 2,
  },
  joinButton: {
    width: "100%",
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  joinButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  joinroomText: {
    color: "white",
  },
  friendsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    width: "100%",
  },
  friendsHeaderRow: {
    flexDirection: "row",
  },
  friendsList: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  friend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    width: "100%",
  },
  Avatar: {
    width: 70,
    height: 70,
    borderRadius: 30,
    padding: 5,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#1A1A2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 320,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  closeText: {
    color: "white",
    fontSize: 18,
  },
  searchInput: {
    backgroundColor: "#2A2A3E",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  resultsList: {
    gap: 10,
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    marginTop: 20,
  },
});
