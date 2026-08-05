import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import supabase from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const EmergencyContext = createContext();

export function EmergencyProvider({ children }) {
  const { donor } = useAuth();

  const [activeEmergency, setActiveEmergency] = useState(null);

  const [alarmPlaying, setAlarmPlaying] = useState(false);

  const audioRef = useRef(null);

  /*
  ---------------------------------------
  Start Alarm
  ---------------------------------------
  */
  const startAlarm = () => {
    if (!audioRef.current) return;

    audioRef.current.loop = true;

    audioRef.current.play().catch(() => {
      console.log("Autoplay blocked.");
    });

    setAlarmPlaying(true);
  };

  /*
  ---------------------------------------
  Stop Alarm
  ---------------------------------------
  */
  const stopAlarm = () => {
    if (!audioRef.current) return;

    audioRef.current.pause();

    audioRef.current.currentTime = 0;

    setAlarmPlaying(false);
  };

  /*
  ---------------------------------------
  Listen for Emergency Notifications
  ---------------------------------------
  */

  useEffect(() => {
    if (!donor) return;

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
        async (payload) => {
          const notification = payload.new;

          /*
          Ignore normal notifications
          */

          if (!notification.emergency) return;

          /*
          Already shown?
          */

          if (notification.popup_seen) return;

          setActiveEmergency(notification);

          startAlarm();

          await supabase
            .from("notifications")
            .update({
              popup_seen: true,
            })
            .eq("id", notification.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [donor]);

  /*
  ---------------------------------------
  Close Emergency Popup
  ---------------------------------------
  */

  const closeEmergency = () => {
    stopAlarm();

    setActiveEmergency(null);
  };

  return (
    <EmergencyContext.Provider
      value={{
        activeEmergency,
        setActiveEmergency,

        alarmPlaying,

        startAlarm,
        stopAlarm,

        closeEmergency,
      }}
    >
      <audio
        ref={audioRef}
        src="/sounds/emergency.wav"
        preload="auto"
      />

      {children}
    </EmergencyContext.Provider>
  );
}

export function useEmergency() {
  return useContext(EmergencyContext);
}