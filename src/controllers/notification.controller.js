// src/controllers/notification.controller.js
const notificationQueue = require("../queues/notification.queue");

exports.sendNotification = async (req, res) => {
  const { type, payload } = req.body;

  await notificationQueue.add("send", {
    type,
    payload,
  });

  res.json({ message: "Notification queued" });
};