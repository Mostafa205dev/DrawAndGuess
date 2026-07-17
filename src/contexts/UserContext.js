import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";
const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [Friends, setFriends] = useState([]);
  const [roomInvites, setRoomInvites] = useState([]);
  

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
