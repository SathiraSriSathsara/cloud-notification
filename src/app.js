// src/app.js
require("dotenv").config();
const express = require("express");
const path = require("path");

// Initialize Database
require("./db/init");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/notifications", require("./routes/notification.routes"));
app.use("/api/admin", require("./routes/admin.routes"));

// Serve dashboard
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(4000, () => {
  console.log("🚀 Notification service running on 4000");
  console.log("📊 Admin Dashboard: http://localhost:4000");
});