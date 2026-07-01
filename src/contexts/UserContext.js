import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [roomInvites, setRoomInvites] = useState([]);
  const socketRef = useRef(null);

  const fetchUser = async () => {
    const token = await SecureStore.getItemAsync("token");
    setToken(token);
    if (!token) {
      setIsLoading(false);
      return;
    }

    const response = await fetch(
      "https://drawandguessbackend.onrender.com/users/me",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    if (!response.ok) {
      await SecureStore.deleteItemAsync("token");
      setIsLoading(false);
      return;
    }

    const data = await response.json();
    setUser(data.data);
    setIsLoading(false);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    socketRef.current?.disconnect();
    socketRef.current = null;
    setUser(null);
    setToken(null);
  };

  const fetchOnline = async (currentToken) => {
    if (!user?.friends?.length) return;
    const res = await fetch(
      "https://drawandguessbackend.onrender.com/users/onlineFriends",
      { headers: { Authorization: `Bearer ${currentToken || token}` } },
    );
    const data = await res.json();
    setOnlineFriends(data.data.map((id) => id.toString()));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const socket = io("https://drawandguessbackend.onrender.com", {
      auth: { userId: user._id },
    });
    socketRef.current = socket;

    socket.on("refresh", () => fetchUser());
    socket.on("friendStatusChanged", () => fetchOnline());
    
    socket.on("roomInviteReceived", (invite) => {
      setRoomInvites((prev) => [...prev, invite]);
    });

    return () => socket.disconnect();
  }, [user?._id]);

  useEffect(() => {
    if (!user?.friends?.length || !token) return;
    fetchOnline();
  }, [user?._id, token]);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        token,
        fetchUser,
        isLoading,
        logout,
        socketRef,
        onlineFriends,
        fetchOnline,
        roomInvites,
        setRoomInvites,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
