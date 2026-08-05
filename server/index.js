const express = require("express");
const cors = require("cors");
const profileRoutes = require("./routes/profileRoutes");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://life-link-blood-finder-network.onrender.com",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/profile", profileRoutes);
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/donors", require("./routes/donorRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/responses", require("./routes/responseRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));

app.get("/", (req, res) => {
  res.send("Life-Link Server Running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));