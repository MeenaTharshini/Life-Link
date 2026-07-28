const supabase = require("../supabaseClient");

const createAndSendNotifications = async ({
  donors,
  request,
  emergency = false,
  popup_seen = false,
  play_alarm = false,
}) => {  const notifications = donors.map((donor) => ({
    donor_id: donor.id,
    request_id: request.id,

    created_by: request.hospital_id,

    requester_name: request.requester_name,
    requester_phone: request.requester_phone,

    blood_group: request.blood_group,
    urgency: request.urgency,
    units: request.units,

    latitude: request.latitude,
    longitude: request.longitude,
    address: request.address,

    distance: donor.distance,

    emergency,

    popup_seen,

    play_alarm,

    alarm_played: false,

    expired: false,

    priority: emergency ? "emergency" : request.urgency,

    response_time: null,

    status: "pending",

    is_read: false,
}));

  const { data, error } = await supabase
  .from("notifications")
  .upsert(notifications, {
    onConflict: "donor_id,request_id",
  })
  .select();

if (error) {
  console.log(error);
  throw error;
}


  return data;
};

module.exports = { createAndSendNotifications };