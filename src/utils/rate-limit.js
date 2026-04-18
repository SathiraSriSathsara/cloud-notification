// src/utils/rate-limit.js
const { ApiUsageLog, ApiKey } = require('../db/models');

const checkRateLimit = async (apiKeyId, apiKey) => {
  if (!apiKey) return false;

  const now = Date.now() / 1000;
  const windowStart = now - apiKey.rateLimitWindow;

  // Count requests in current window
  const logs = ApiUsageLog.getByApiKeyId(apiKeyId, 10000);
  const recentRequests = logs.filter(log => {
    const logTime = new Date(log.createdAt).getTime() / 1000;
    return logTime > windowStart;
  }).length;

  return recentRequests < apiKey.rateLimit;
};

const logApiUsage = (apiKeyId, endpoint, method, status, responseTime) => {
  ApiUsageLog.create(apiKeyId, endpoint, method, status, responseTime);
};

module.exports = {
  checkRateLimit,
  logApiUsage
};
