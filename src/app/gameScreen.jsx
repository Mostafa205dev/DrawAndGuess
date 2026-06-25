import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { PanResponder, Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { io } from "socket.io-client";
import { useUser } from "../contexts/UserContext";

export default function GameScreen() {
  const { user } = useUser();

  const params = useLocalSearchParams();
  const [room, setRoom] = useState(
    params.room ? JSON.parse(params.room) : null,
  );
  const [paths, setPaths] = useState([]);
  const currentPath = useRef("");
  const selectedColorRef = useRef("black");
  const [selectedColor, setSelectedColor] = useState("black");
  const COLORS = [
    "black",
    "red",
    "blue",
    "green",
    "yellow",
    "purple",
    "orange",
    "white",
  ];

  if (!room) return <Text>No room data</Text>;

  const isDrawer = room.currentDrawer === user._id;
  const socketRef = useRef(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderGrant: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      currentPath.current = `M${locationX},${locationY}`;
      setPaths((prev) => [
        ...prev,
        { d: currentPath.current, color: selectedColorRef.current },
      ]);
      socketRef.current?.emit("startPath", {
        roomCode: room.code,
        color: selectedColorRef.current,
      });
    },

    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;
      currentPath.current += ` L${locationX},${locationY}`;
      setPaths((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          d: currentPath.current,
          color: selectedColorRef.current,
        };
        return updated;
      });
      socketRef.current?.emit("draw", {
        roomCode: room.code,
        path: currentPath.current,
        color: selectedColorRef.current,
      });
    },
  });

  useEffect(() => {
    const socket = io("https://drawandguessbackend.onrender.com");
    socketRef.current = socket;

    socket.emit("joinRoom", {
      roomCode: room.code,
      user: { _id: user._id, name: user.name },
    });

    socket.on("roomUpdated", (updatedRoom) => setRoom(updatedRoom));
    socket.on("startPath", ({ color }) => {
      setPaths((prev) => [...prev, { d: "", color }]);
    });

    socket.on("drawing", ({ path, color }) => {
      setPaths((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { d: path, color };
        return updated;
      });
    });

    return () => socket.disconnect();
  }, []);

  return (
    <View
      style={{ flex: 1, backgroundColor: "white" }}
      {...(isDrawer ? panResponder.panHandlers : {})}
    >
      <Text>{isDrawer ? "You are drawing" : "Guess the word"}</Text>

      {isDrawer && (
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            padding: 10,
            backgroundColor: "#eee",
          }}
        >
          {COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => {
                setSelectedColor(color);
                selectedColorRef.current = color;
              }}
              style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 1,
                borderColor: "gray",
              }}
            />
          ))}
        </View>
      )}

      <Svg style={{ flex: 1 }}>
        {paths.map((path, index) => (
          <Path
            key={index}
            d={path.d}
            stroke={path.color}
            strokeWidth="5"
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}
