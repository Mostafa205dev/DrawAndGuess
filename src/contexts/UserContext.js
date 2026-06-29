import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
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

    return () => socket.disconnect();
  }, [user?._id]);

  return (
    <UserContext.Provider
      value={{ user, setUser, token, fetchUser, isLoading, logout, socketRef }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
