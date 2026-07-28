import { useEffect } from "react";
import supabase from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function useRealTimeNotifications() {
  const {
    donor,
    setNotificationCount,
  } = useAuth();

  useEffect(() => {
    if (!donor) return;

    // Load initial unread notification count
    loadNotificationCount();

    // Subscribe to realtime changes
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
          loadNotificationCount();
        }
      )
      .subscribe();

    async function loadNotificationCount() {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", {
          count: "exact",
          head: true,
        })
        .eq("donor_id", donor.id)
        .eq("is_read", false);

      if (!error) {
        setNotificationCount(count || 0);
      }
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, [donor]);
}