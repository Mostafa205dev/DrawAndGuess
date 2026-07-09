import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [Friends, setFriends] = useState([]);
  const [roomInvites, setRoomInvites] = useState([]);
  const socketRef = useRef(null);

  const fetchUser = async () => {
    try {
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
      setFriends(data.data.friends);
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    socketRef.current?.disconnect();
    socketRef.current = null;
    setUser(null);
    setToken(null);
    setFriends([]);
    setRoomInvites([]);
  };

  const fetchFriends = async (currentToken) => {
    try {
      const res = await fetch(
        "https://drawandguessbackend.onrender.com/users/Friends",
        { headers: { Authorization: `Bearer ${currentToken || token}` } },
      );
      if (!res.ok) {
        return;
      }
      const data = await res.json();
      setFriends(data.data);
    } catch (error) {
      console.error("Error fetching online friends:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    socketRef.current?.disconnect();
    const socket = io("https://drawandguessbackend.onrender.com", {
      auth: { userId: user._id },
    });
    socketRef.current = socket;

    socket.on("refreshUser", async () => {
      await fetchUser();
    });
    socket.on("refreshFriends", () => {
      fetchFriends();
    });

    socket.on("roomInviteReceived", (invite) => {
      setRoomInvites((prev) => [...prev, invite]);
    });

    return () => socket.disconnect();
  }, [user?._id]);

  useEffect(() => {
    if (!user?.friends?.length || !token) return;
    fetchFriends();
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
        Friends,
        fetchFriends,
        roomInvites,
        setRoomInvites,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
