const supabase = require("../supabaseClient");

/*
  This file exists only for helper functions.
  Supabase automatically broadcasts INSERT/UPDATE/DELETE
  once Realtime is enabled on the table.
*/

async function updateNotification(notificationId, values) {
  const { data, error } = await supabase
    .from("notifications")
    .update(values)
    .eq("id", notificationId)
    .select()
    .single();

  if (error) throw error;

  return data;
}

async function markPopupSeen(notificationId) {
  return updateNotification(notificationId, {
    popup_seen: true,
  });
}

async function markAccepted(notificationId) {
  return updateNotification(notificationId, {
    status: "accepted",
    is_read: true,
  });
}

async function markRead(notificationId) {
  return updateNotification(notificationId, {
    is_read: true,
  });
}

module.exports = {
  updateNotification,
  markPopupSeen,
  markAccepted,
  markRead,
};