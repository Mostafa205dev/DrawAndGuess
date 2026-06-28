import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ResultsScreen() {
  const params = useLocalSearchParams();
  const room = params.room ? JSON.parse(params.room) : null;
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push({
        pathname: "/room",
        params: { room: JSON.stringify(room) },
      });
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (!room) return <Text>No data</Text>;

  const players = room.players
    .map((player) => ({
      ...player,
      score: room.scores[player._id] || 0,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Results 🏆</Text>
      {players.map((player, index) => (
        <View key={player._id} style={styles.playerRow}>
          <Text style={styles.rank}>#{index + 1}</Text>
          <Image
            source={{
              uri: `https://api.dicebear.com/7.x/${player.avatar}/png?seed=${player.name}`,
            }}
            style={styles.avatar}
          />
          <Text style={styles.name}>{player.name}</Text>
          <Text style={styles.score}>{player.score} pts</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
    backgroundColor: "#1A1A2E",
    flexGrow: 1,
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  rank: {
    color: "#FBBF24",
    fontSize: 18,
    fontWeight: "bold",
    width: 30,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  name: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  score: {
    color: "#22c55e",
    fontSize: 16,
    fontWeight: "bold",
  },
});
