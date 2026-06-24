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
const { width } = Dimensions.get("window");

export default function RoomScreen() {
  const router = useRouter();
  const { user, token } = useUser();
  const params = useLocalSearchParams();
  const [room, setRoom] = useState(
    params.room ? JSON.parse(params.room) : null,
  );
  if (!room) return null;
  const socketRef = useRef(null);

  const isHost = room.host === user._id;

  const roomRef = useRef(room);

  useEffect(() => {
    roomRef.current = room;
  }, [room]);

  useEffect(() => {
    const socket = io("https://drawandguessbackend.onrender.com");
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

    socket.on("playerJoined", (newPlayer) => {
      setRoom((prev) => ({
        ...prev,
        players: [...prev.players, newPlayer],
      }));
    });

    socket.on("playerLeft", ({ leftPlayer,room }) => {
      if (!room) return;
      setRoom(room);
    });

    socket.on("gameStarted", () => {
      router.push({
        pathname: "/game",
        params: { room: JSON.stringify(roomRef.current) },
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
    socketRef.current?.emit("startGame", { roomCode: room.code });
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
});
