// src/queues/notification.queue.js
const { Queue } = require("bullmq");
const connection = require("../config/redis");

const notificationQueue = new Queue("notification-queue", {
  connection,
});

module.exports = notificationQueue;