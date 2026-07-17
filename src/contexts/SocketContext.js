import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { io } from "socket.io-client";
import { useUser } from "./UserContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, fetchUser, fetchFriends, setRoomInvites } = useUser();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user?._id) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const socket = io("https://drawandguessbackend.onrender.com", {
      auth: { userId: user._id },
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleRefreshUser = async () => {
      await fetchUser();
    };
    const handleRefreshFriends = () => {
      fetchFriends();
    };
    const handleRoomInvite = (invite) => {
      setRoomInvites((prev) => [...prev, invite]);
    };

    socket.on("refreshUser", handleRefreshUser);
    socket.on("refreshFriends", handleRefreshFriends);
    socket.on("roomInviteReceived", handleRoomInvite);

    return () => {
      socket.off("refreshUser", handleRefreshUser);
      socket.off("refreshFriends", handleRefreshFriends);
      socket.off("roomInviteReceived", handleRoomInvite);
    };
  }, [connected]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "background") {
        socketRef.current?.disconnect();
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <SocketContext.Provider value={{ socketRef, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};
