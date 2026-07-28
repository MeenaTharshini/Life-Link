const supabase = require("../supabaseClient");

const createAndSendNotifications = async ({ donors, request }) => {
  const notifications = donors.map((donor) => ({
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

  return data;
};

module.exports = { createAndSendNotifications };