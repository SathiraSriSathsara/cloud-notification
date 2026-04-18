// src/app.js
require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

app.use("/notifications", require("./routes/notification.routes"));

app.listen(4000, () => {
  console.log("🚀 Notification service running on 4000");
});