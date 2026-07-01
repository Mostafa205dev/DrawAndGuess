import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { io } from "socket.io-client";
import { useUser } from "../contexts/UserContext";
const { height, width } = Dimensions.get("window");

export default function RoomScreen() {
  const router = useRouter();
  const { user, token, fetchUser } = useUser();
  const params = useLocalSearchParams();
  const [room, setRoom] = useState(
    params.room ? JSON.parse(params.room) : null,
  );
  const MODES = ["normal", "firstGuessWin"];
  const [mode, setMode] = useState(
    params.room ? JSON.parse(params.room).mode || "normal" : "normal",
  );
  if (!room) return null;
  const socketRef = useRef(null);

  const isHost = room.host === user._id;

  const roomRef = useRef(room);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    const socket = io("https://drawandguessbackend.onrender.com", {
      auth: {
        userId: user._id,
      },
    });
    socketRef.current = socket;

    socket.emit("joinRoom", {
      roomCode: room.code,
      user: {
        _id: user._id,
        name: user.name,
        avatar: user.avatar,
        level: user.level,
      },
    });

    socket.on("roomUpdated", (updatedRoom) => {
      setRoom(updatedRoom);
    });

    socket.on("playerJoined", (newPlayer) => {
      setRoom((prev) => {
        if (prev.players.find((p) => p._id === newPlayer._id)) return prev;
        return { ...prev, players: [...prev.players, newPlayer] };
      });
    });

    socket.on("playerLeft", ({ leftPlayer, room }) => {
      if (!room) return;
      setRoom(room);
    });

    socket.on("gameStarted", (roomData) => {
      router.push({
        pathname: "/gameScreen",
        params: {
          room: JSON.stringify(roomData),
        },
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLeave = async () => {
    try {
      const response = await fetch(
        "https://drawandguessbackend.onrender.com/rooms/leaveRoom",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();

      socketRef.current?.emit("leaveRoom", {
        roomCode: room.code,
        leftPlayer: { _id: user._id },
        room: data.data,
      });

      router.push("/");
    } catch (err) {
      console.log("cant leave");
    }
  };

  const handleStart = async () => {
    if (room.players.length < 2) {
      alert("At least 2 players are required to start the game.");
      return;
    }
    socketRef.current?.emit("startGame", { roomCode: room.code, mode });
  };

  const changeRoomType = (type) => {
    if (room.type === type) return;
    setRoom((prev) => ({
      ...prev,
      type,
    }));

    socketRef.current?.emit("changeRoomType", {
      roomCode: room.code,
      type,
    });
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={styles.body}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Room Code</Text>
          <Text style={styles.code}>{room.code}</Text>
        </View>

        {isHost && (
          <Picker
            selectedValue={mode}
            onValueChange={(value) => setMode(value)}
            style={{ color: "white", width: 150 }}
            dropdownIconColor="white"
          >
            <Picker.Item label="Normal" value="normal" />
            <Picker.Item label="First Guess Win" value="firstGuessWin" />
          </Picker>
        )}

        <Text style={styles.playersCount}>
          {room.players.length}/{room.maxPlayers}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.playersList}>
        {room.players.map((player) => (
          <View key={player._id} style={styles.playerRow}>
            <Image
              source={{
                uri: `https://api.dicebear.com/7.x/${player.avatar}/png?seed=${player.name}`,
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.playerName}>{player.name}</Text>
              <Text style={styles.playerLevel}>Level {player.level}</Text>
            </View>
            {room.host === player._id && (
              <Text style={styles.hostBadge}>👑</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.buttons}>
        {isHost && (
          <View style={styles.roomTypeContainer}>
            <Pressable
              onPress={() => changeRoomType("private")}
              style={[
                styles.roomTypeButton,
                room.type === "private" && styles.activeButton,
              ]}
            >
              <Text
                style={[
                  styles.roomTypeText,
                  room.type === "private" && styles.activeText,
                ]}
              >
                🔒 Private
              </Text>
            </Pressable>

            <Pressable
              onPress={() => changeRoomType("public")}
              style={[
                styles.roomTypeButton,
                room.type === "public" && styles.activeButton,
              ]}
            >
              <Text
                style={[
                  styles.roomTypeText,
                  room.type === "public" && styles.activeText,
                ]}
              >
                🌍 Public
              </Text>
            </Pressable>
          </View>
        )}
        {isHost && (
          <Pressable style={styles.startBtn} onPress={handleStart}>
            <Text style={styles.startText}>Start Game</Text>
          </Pressable>
        )}
        <Pressable style={styles.leaveBtn} onPress={handleLeave}>
          <Text style={styles.leaveText}>Leave</Text>
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    width: width,
    height: height,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  codeBox: {
    alignItems: "center",
  },
  codeLabel: {
    color: "#aaa",
    fontSize: 12,
  },
  code: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 4,
  },
  playersCount: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  playersList: {
    padding: 20,
    gap: 12,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  playerName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  playerLevel: {
    color: "#aaa",
    fontSize: 12,
  },
  hostBadge: {
    marginLeft: "auto",
    fontSize: 20,
  },
  buttons: {
    padding: 20,
    gap: 10,
  },
  startBtn: {
    backgroundColor: "#22c55e",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  startText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  leaveBtn: {
    backgroundColor: "#ef4444",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  leaveText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  // private / public buttons
  roomTypeContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff22",
    borderRadius: 12,
    overflow: "hidden",
  },

  roomTypeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  activeButton: {
    backgroundColor: "#fff",
  },

  roomTypeText: {
    color: "white",
    fontWeight: "600",
  },

  activeText: {
    color: "#5B3CC4",
    fontWeight: "bold",
  },
});
