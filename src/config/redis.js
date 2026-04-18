// src/config/redis.js
const { Redis } = require("ioredis");

const connection = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // important for BullMQ
  enableReadyCheck: false,
});

connection.on("connect", () => {
  console.log("✅ Redis connected");
});

connection.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

module.exports = connection;