// src/controllers/notification.controller.js
const notificationQueue = require("../queues/notification.queue");
const { ApiKey } = require("../db/models");
const { checkRateLimit, logApiUsage } = require("../utils/rate-limit");

exports.sendNotification = async (req, res) => {
  try {
    const { type, payload } = req.body;

    // Get API key from Authorization header
    const authHeader = req.headers['authorization'];
    const apiKey = authHeader && authHeader.split(' ')[1];

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    // Find API key in database
    const apiKeyRecord = ApiKey.findByKey(apiKey);
    if (!apiKeyRecord || !apiKeyRecord.isActive) {
      return res.status(403).json({ error: 'Invalid or inactive API key' });
    }

    // Check rate limit
    const isAllowed = await checkRateLimit(apiKeyRecord.id, apiKeyRecord);
    if (!isAllowed) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Log API usage
    const startTime = Date.now();

    // Queue notification
    await notificationQueue.add("send", {
      type,
      payload,
    });

    const responseTime = Date.now() - startTime;
    logApiUsage(apiKeyRecord.id, '/notifications/send', 'POST', 200, responseTime);

    // Update last used time
    ApiKey.updateLastUsed(apiKeyRecord.id);

    res.json({ 
      message: 'Notification queued',
      type,
      queuedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};