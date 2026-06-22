import { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  const fetchUser = async () => {
    const token = await SecureStore.getItemAsync("token");
    setToken(token)
    if (!token) return;

    const response = await fetch(
      "https://drawandguessbackend.onrender.com/users/me",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    
    const data = await response.json();
    setUser(data.data);
  };

  useEffect(() => {
    fetchUser();
  }, []);
  return (
    <UserContext.Provider value={{ user,setUser, token, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);