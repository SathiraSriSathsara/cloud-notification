// src/controllers/admin.controller.js
const bcrypt = require('bcryptjs');
const {
  User,
  ApiKey,
  NotificationMethod,
  EnvCredential,
  NotificationTestLog
} = require('../db/models');
const { generateToken } = require('../middleware/auth');
const { encrypt, decrypt } = require('../utils/encryption');
const { testConnections, getDetailedConnectionStatus } = require('../utils/connection-test');
const { logApiUsage } = require('../utils/rate-limit');
const redis = require('../config/redis');
const admin = require('../config/firebase');

// ============ AUTH CONTROLLERS ============

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    // Check if user exists
    if (User.findByUsername(username) || User.findByEmail(email)) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = User.create(username, email, hashedPassword);

    // Initialize default notification methods
    ['PUSH', 'SMS', 'WHATSAPP', 'EMAIL'].forEach(type => {
      NotificationMethod.create(userId, type, {});
    });

    const token = generateToken(userId, username);
    res.status(201).json({ message: 'User created successfully', userId, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id, user.username);
    res.json({ message: 'Login successful', userId: user.id, username: user.username, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ USER MANAGEMENT CONTROLLERS ============

const getCurrentUser = (req, res) => {
  try {
    const user = User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllUsers = (req, res) => {
  try {
    const user = User.findById(req.user.userId);
    if (user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const users = User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUser = User.findById(req.user.userId);

    if (currentUser?.role !== 'admin' && req.user.userId !== targetUserId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    User.delete(targetUserId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ API KEY MANAGEMENT ============

const createApiKey = (req, res) => {
  try {
    const { name, rateLimit = 1000, rateLimitWindow = 3600 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'API key name is required' });
    }

    const apiKeyData = ApiKey.create(
      req.user.userId,
      name,
      rateLimit,
      rateLimitWindow
    );

    res.status(201).json(apiKeyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getApiKeys = (req, res) => {
  try {
    const keys = ApiKey.getByUserId(req.user.userId);
    res.json(keys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteApiKey = (req, res) => {
  try {
    const { keyId } = req.params;
    const apiKey = ApiKey.findById(keyId);

    if (!apiKey || apiKey.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    ApiKey.delete(keyId);
    res.json({ message: 'API key deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateApiKey = (req, res) => {
  try {
    const { keyId } = req.params;
    const { isActive, rateLimit, rateLimitWindow } = req.body;

    const apiKey = ApiKey.findById(keyId);
    if (!apiKey || apiKey.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive ? 1 : 0;
    if (rateLimit !== undefined) updates.rateLimit = rateLimit;
    if (rateLimitWindow !== undefined) updates.rateLimitWindow = rateLimitWindow;

    ApiKey.update(keyId, updates);
    res.json({ message: 'API key updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getApiKeyStats = (req, res) => {
  try {
    const { keyId } = req.params;
    const apiKey = ApiKey.findById(keyId);

    if (!apiKey || apiKey.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const stats = require('../utils/rate-limit').logApiUsage;
    const { ApiUsageLog } = require('../db/models');
    const logs = ApiUsageLog.getByApiKeyId(keyId, 100);
    const statsData = ApiUsageLog.getStats(keyId);

    res.json({
      stats: statsData,
      recentLogs: logs
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ ENVIRONMENT CREDENTIALS ============

const createEnvCredential = (req, res) => {
  try {
    const { key, value } = req.body;

    if (!key || !value) {
      return res.status(400).json({ error: 'Key and value are required' });
    }

    const encryptedValue = encrypt(value);
    EnvCredential.create(req.user.userId, key, encryptedValue, true);

    res.status(201).json({ message: 'Credential created', key });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEnvCredentials = (req, res) => {
  try {
    const credentials = EnvCredential.getByUserId(req.user.userId);
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateEnvCredential = (req, res) => {
  try {
    const { credentialId } = req.params;
    const { key, value } = req.body;

    const encryptedValue = encrypt(value);
    EnvCredential.update(credentialId, key, encryptedValue);

    res.json({ message: 'Credential updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteEnvCredential = (req, res) => {
  try {
    const { credentialId } = req.params;
    EnvCredential.delete(credentialId);
    res.json({ message: 'Credential deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ NOTIFICATION METHODS ============

const getNotificationMethods = (req, res) => {
  try {
    const methods = NotificationMethod.getByUserId(req.user.userId);
    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateNotificationMethod = (req, res) => {
  try {
    const { methodId } = req.params;
    const { isEnabled, config } = req.body;

    const updates = {};
    if (isEnabled !== undefined) updates.isEnabled = isEnabled ? 1 : 0;
    if (config) updates.config = config;

    NotificationMethod.update(methodId, updates);
    res.json({ message: 'Notification method updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ NOTIFICATION TESTING ============

const testNotification = async (req, res) => {
  try {
    const { type, recipient, title, body } = req.body;

    if (!type || !recipient) {
      return res.status(400).json({ error: 'Type and recipient are required' });
    }

    const method = NotificationMethod.getByType(req.user.userId, type);
    if (!method || !method.isEnabled) {
      return res.status(400).json({ error: `${type} notifications not enabled` });
    }

    let result;
    const startTime = Date.now();

    try {
      switch (type.toUpperCase()) {
        case 'PUSH':
          result = await testPushNotification(recipient, title, body);
          break;
        case 'SMS':
          result = await testSmsNotification(recipient, body);
          break;
        case 'WHATSAPP':
          result = await testWhatsappNotification(recipient, body);
          break;
        case 'EMAIL':
          result = await testEmailNotification(recipient, title, body);
          break;
        default:
          return res.status(400).json({ error: 'Unknown notification type' });
      }

      const responseTime = Date.now() - startTime;
      NotificationTestLog.create(
        req.user.userId,
        type,
        recipient,
        'success',
        'Test notification sent successfully'
      );

      res.json({
        message: 'Test notification sent',
        status: 'success',
        responseTime,
        result
      });
    } catch (error) {
      NotificationTestLog.create(
        req.user.userId,
        type,
        recipient,
        'failed',
        error.message
      );

      res.status(500).json({
        error: 'Failed to send test notification',
        details: error.message
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const testPushNotification = async (deviceToken, title, body) => {
  const message = {
    token: deviceToken,
    notification: {
      title: title || 'Test Notification',
      body: body || 'This is a test notification'
    }
  };

  const response = await admin.messaging().send(message);
  return { messageId: response };
};

const testSmsNotification = async (phoneNumber, body) => {
  // Placeholder for SMS service integration
  console.log(`SMS to ${phoneNumber}: ${body}`);
  return { sent: true, provider: 'placeholder' };
};

const testWhatsappNotification = async (phoneNumber, body) => {
  // Placeholder for WhatsApp service integration
  console.log(`WhatsApp to ${phoneNumber}: ${body}`);
  return { sent: true, provider: 'placeholder' };
};

const testEmailNotification = async (email, title, body) => {
  // Placeholder for Email service integration
  console.log(`Email to ${email}\nSubject: ${title}\nBody: ${body}`);
  return { sent: true, provider: 'placeholder' };
};

const getNotificationTests = (req, res) => {
  try {
    const tests = NotificationTestLog.getByUserId(req.user.userId, 50);
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============ CONNECTION STATUS ============

const getConnectionStatus = async (req, res) => {
  try {
    const status = await testConnections();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDetailedStatus = async (req, res) => {
  try {
    const status = await getDetailedConnectionStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  // Auth
  register,
  login,
  getCurrentUser,
  // User Management
  getAllUsers,
  deleteUser,
  // API Keys
  createApiKey,
  getApiKeys,
  deleteApiKey,
  updateApiKey,
  getApiKeyStats,
  // Environment Credentials
  createEnvCredential,
  getEnvCredentials,
  updateEnvCredential,
  deleteEnvCredential,
  // Notification Methods
  getNotificationMethods,
  updateNotificationMethod,
  // Testing
  testNotification,
  getNotificationTests,
  // Connection Status
  getConnectionStatus,
  getDetailedStatus
};
