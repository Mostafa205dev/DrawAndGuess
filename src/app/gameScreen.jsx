import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { io } from "socket.io-client";
import { useUser } from "../contexts/UserContext";

export default function GameScreen() {
  const { user } = useUser();

  const params = useLocalSearchParams();
  const router = useRouter();
  const [room, setRoom] = useState(
    params.room ? JSON.parse(params.room) : null,
  );
  const [wordChoices, setWordChoices] = useState(
    params.words ? JSON.parse(params.words) : [],
  );
  const [selectedWord, setSelectedWord] = useState(null);
  const [paths, setPaths] = useState([]);
  const currentPath = useRef("");
  const [guess, setGuess] = useState("");
  const selectedColorRef = useRef("black");
  const [message, setMessage] = useState("");
  const [selectedColor, setSelectedColor] = useState("black");
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
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

    socket.emit("joinGame", { roomCode: room.code });

    socket.on("roomUpdated", (updatedRoom) => {
      setRoom(updatedRoom);
      setSelectedWord(updatedRoom.currentWord);
    });

    socket.on("startTimer", ({ seconds }) => {
      setTimeLeft(seconds);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

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

    socket.on("correctGuess", ({ user }) => {
      setMessage(`${user.name} guessed correctly!`);
      setTimeLeft(null);
      clearInterval(timerRef.current);
    });

    socket.on("newRound", ({ room, words }) => {
      setRoom(room);
      setWordChoices(words);
      setPaths([]);
      setSelectedWord(null);
      setMessage("");
      setTimeLeft(null);
      clearInterval(timerRef.current);
    });

    socket.on("gameEnded", ({ room }) => {
      router.push({
        pathname: "/results",
        params: { room: JSON.stringify(room) },
      });
    });

    return () => socket.disconnect();
  }, []);

  const handleGuess = () => {
    socketRef.current?.emit("checkWord", {
      roomCode: room.code,
      guess: guess.trim(),
      user: {
        _id: user._id,
        name: user.name,
      },
    });

    setGuess("");
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "white" }}
      {...(isDrawer && selectedWord ? panResponder.panHandlers : {})}
    >
      <Text>{isDrawer ? "You are drawing" : "Guess the word"}</Text>
      {message !== "" && <Text style={styles.userCorrectGuess}>{message}</Text>}
      {timeLeft !== null && (
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: timeLeft <= 5 ? "red" : "black",
          }}
        >
          {timeLeft}s
        </Text>
      )}

      {/* Words choice */}
      {isDrawer && !selectedWord && (
        <View style={styles.wordsContainer}>
          <Text style={styles.wordsTitle}>Choose a word</Text>

          {wordChoices.map((word) => (
            <Pressable
              key={word}
              style={styles.wordButton}
              onPress={() => {
                socketRef.current?.emit("chooseWord", {
                  roomCode: room.code,
                  word,
                });
              }}
            >
              <Text style={styles.wordButtonText}>{word}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* colors button */}
      {isDrawer && selectedWord && (
        <View style={styles.colorsButtons}>
          {COLORS.map((color) => (
            <Pressable
              key={color}
              onPress={() => {
                setSelectedColor(color);
                selectedColorRef.current = color;
              }}
              style={[
                styles.eachColorButton,
                {
                  backgroundColor: color,
                  borderWidth: selectedColor === color ? 3 : 1,
                  borderColor: "gray",
                },
              ]}
            />
          ))}
        </View>
      )}

      {/*  entring the word */}
      {!isDrawer && selectedWord && (
        <View style={styles.guessContainer}>
          <TextInput
            placeholder="Type your guess..."
            placeholderTextColor="#888"
            value={guess}
            onChangeText={setGuess}
            style={styles.guessInput}
          />

          <Pressable onPress={handleGuess} style={styles.guessButton}>
            <Text style={styles.guessButtonText}>Send</Text>
          </Pressable>
        </View>
      )}

      {(!isDrawer || selectedWord) && (
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  guessContainer: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f3f4f6",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  guessInput: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },

  guessButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },

  guessButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  userCorrectGuess: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "green",
    marginVertical: 10,
  },

  colorsButtons: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    backgroundColor: "#eee",
  },

  eachColorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },

  wordsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
    gap: 20,
  },

  wordsTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },

  wordButton: {
    width: "100%",
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
  },

  wordButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
});
