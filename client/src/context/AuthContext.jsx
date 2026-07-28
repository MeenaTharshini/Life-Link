import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabaseClient";
import axios from "axios";
const API = import.meta.env.VITE_API_URL;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [donor, setDonor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
const [acceptedCount, setAcceptedCount] = useState(0);

  const loadUser = async (supabaseUser) => {
    try {
      // Load user profile
      const profileRes = await axios.get(
  `${API}/api/users/${supabaseUser.id}`
);

      setProfile(profileRes.data);

      // Load donor profile (may not exist)
      try {
        const donorRes = await axios.get(
  `${API}/api/donors/by-user/${supabaseUser.id}`
);

        setDonor(donorRes.data);

await loadNotificationCount(donorRes.data.id);
      } catch {
        setDonor(null);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);

      setProfile(null);
      setDonor(null);
      setNotificationCount(0);
setAcceptedCount(0);
    }
  };
  const loadNotificationCount = async (donorId) => {
  if (!donorId) {
    setNotificationCount(0);
    return;
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, is_read")
    .eq("donor_id", donorId);

  if (error) {
    console.error(error);
    return;
  }

  const unread = data.filter((n) => !n.is_read).length;

  setNotificationCount(unread);
};

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    setAuthUser(data.user);

    await loadUser(data.user);
  };

  const logout = async () => {
    await supabase.auth.signOut();

    setAuthUser(null);
    setProfile(null);
    setDonor(null);
  };

  const load = async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    setAuthUser(user);

    await loadUser(user);

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
  if (!donor) return;

  const channel = supabase
    .channel(`notifications-${donor.id}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "notifications",
        filter: `donor_id=eq.${donor.id}`,
      },
      () => {
        loadNotificationCount(donor.id);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [donor]);
  const canRequest = !!authUser;

const canDonate = !!donor;
  return (
    <AuthContext.Provider
      value={{
        authUser,
        profile,
        donor,
        loading,
        login,
        logout,
        canRequest,
        canDonate,
        notificationCount,
setNotificationCount,

acceptedCount,
setAcceptedCount,

loadNotificationCount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);