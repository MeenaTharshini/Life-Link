const supabase = require("../supabaseClient");
const { createAndSendNotifications } = require("./notificationService");
async function createBloodRequest(data) {
  const { data: request, error } = await supabase
    .from("blood_requests")
    .insert([data])
    .select()
    .single();

  if (error) throw error;

  await createNotifications(request);

  return request;
}

module.exports = { createBloodRequest };