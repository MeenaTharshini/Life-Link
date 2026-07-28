import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import supabase from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const EmergencyContext = createContext();

export function EmergencyProvider({ children }) {
  const { donor } = useAuth();

  const [emergencyNotification, setEmergencyNotification] =
    useState(null);

  useEffect(() => {
    if (!donor) return;

    // Listen for NEW emergency notifications
    const channel = supabase
      .channel(`emergency-${donor.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `donor_id=eq.${donor.id}`,
        },
        (payload) => {
          const notification = payload.new;

          // Show popup only for emergency notifications
          if (
  notification.emergency &&
  !notification.popup_seen
){
            setEmergencyNotification(notification);

            // Mark popup shown
            supabase
              .from("notifications")
              .update({
                popup_seen: true,
              })
              .eq("id", notification.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [donor]);

  const closeEmergency = () => {
    setEmergencyNotification(null);
  };

  return (
    <EmergencyContext.Provider
      value={{
        emergencyNotification,
        setEmergencyNotification,
        closeEmergency,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  return useContext(EmergencyContext);
}