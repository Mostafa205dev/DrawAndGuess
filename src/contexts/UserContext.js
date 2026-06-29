import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    console.log(response.status);

    if (!response.ok) {
      await SecureStore.deleteItemAsync("token");
      setIsLoading(false);
      return;
    }

    const data = await response.json();
    console.log(data);
    setUser(data.data);
    setIsLoading(false);
  };
  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setUser(null);
    setToken(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <UserContext.Provider
      value={{ user, setUser, token, fetchUser, isLoading, logout }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
