// src/workers/notification.worker.js
const { Worker } = require("bullmq");
const connection = require("../config/redis");

const { sendPush } = require("../services/push.service");

const worker = new Worker(
  "notification-queue",
  async (job) => {
    const { type, payload } = job.data;

    switch (type) {
      case "push":
        return await sendPush(payload);

      case "sms":
        // future
        return;

      case "whatsapp":
        // future
        return;

      default:
        throw new Error("Unknown notification type");
    }
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Job done: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Job failed: ${job.id}`, err);
});