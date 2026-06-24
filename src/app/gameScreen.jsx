import { useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { PanResponder, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { io } from "socket.io-client";
import { useUser } from "../contexts/UserContext";

export default function GameScreen() {
  const { user } = useUser();

  const params = useLocalSearchParams();
  const [room, setRoom] = useState(
    params.room ? JSON.parse(params.room) : null,
  );
  const [points, setPoints] = useState([]);

  if (!room) {
    return <Text>No room data</Text>;
  }

  const isDrawer = room.currentDrawer === user._id;

  const socketRef = useRef(null);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,

    onPanResponderMove: (event) => {
      const { locationX, locationY } = event.nativeEvent;

      setPoints((prev) => [...prev, { x: locationX, y: locationY }]);
      socketRef.current?.emit("draw", {
        roomCode: room.code,
        x: locationX,
        y: locationY,
      });
    },
  });

  useEffect(() => {
    const socket = io("https://drawandguessbackend.onrender.com");

    socketRef.current = socket;

    socket.emit("joinRoom", {
      roomCode: room.code,
      user: {
        _id: user._id,
        name: user.name,
      },
    });

    socket.on("roomUpdated", (updatedRoom) => {
      setRoom(updatedRoom);
    });
    socket.on("drawing", ({ x, y }) => {
      setPoints((prev) => [...prev, { x, y }]);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
      }}
      {...(isDrawer ? panResponder.panHandlers : {})}
    >
      <Text>{isDrawer ? "You are drawing" : "Guess the word"}</Text>

      <Svg width="100%" height="100%">
        {points.map((point, index) => (
          <Circle key={index} cx={point.x} cy={point.y} r="5" fill="black" />
        ))}
      </Svg>
    </View>
  );
}
