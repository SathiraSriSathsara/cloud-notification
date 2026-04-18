// src/db/models.js
const db = require('./init');
const crypto = require('crypto');

// User queries
const User = {
  create: (username, email, password) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare(
      'INSERT INTO users (id, username, email, password, role) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(id, username, email, password, 'user');
    return id;
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
  },

  findByUsername: (username) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username);
  },

  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  getAll: () => {
    const stmt = db.prepare('SELECT id, username, email, role, createdAt FROM users');
    return stmt.all();
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    stmt.run(id);
  },

  update: (id, data) => {
    const fields = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(data);
    const stmt = db.prepare(
      `UPDATE users SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
    );
    stmt.run(...values, id);
  }
};

// API Key queries
const ApiKey = {
  create: (userId, name, rateLimit = 1000, rateLimitWindow = 3600) => {
    const id = crypto.randomUUID();
    const key = `sk_${crypto.randomBytes(32).toString('hex')}`;
    const stmt = db.prepare(
      'INSERT INTO api_keys (id, userId, name, key, rateLimit, rateLimitWindow) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, userId, name, key, rateLimit, rateLimitWindow);
    return { id, key, rateLimit, rateLimitWindow };
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT * FROM api_keys WHERE id = ?');
    return stmt.get(id);
  },

  findByKey: (key) => {
    const stmt = db.prepare('SELECT * FROM api_keys WHERE key = ?');
    return stmt.get(key);
  },

  getByUserId: (userId) => {
    const stmt = db.prepare(
      'SELECT id, userId, name, key, rateLimit, rateLimitWindow, isActive, createdAt, lastUsedAt FROM api_keys WHERE userId = ?'
    );
    return stmt.all(userId);
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM api_keys WHERE id = ?');
    stmt.run(id);
  },

  update: (id, data) => {
    const fields = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    const values = Object.values(data);
    const stmt = db.prepare(
      `UPDATE api_keys SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
    );
    stmt.run(...values, id);
  },

  updateLastUsed: (id) => {
    const stmt = db.prepare('UPDATE api_keys SET lastUsedAt = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(id);
  }
};

// Notification Method queries
const NotificationMethod = {
  create: (userId, type, config = {}) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare(
      'INSERT INTO notification_methods (id, userId, type, config) VALUES (?, ?, ?, ?)'
    );
    stmt.run(id, userId, type, JSON.stringify(config));
    return id;
  },

  getByUserId: (userId) => {
    const stmt = db.prepare(
      'SELECT id, type, isEnabled, config, updatedAt FROM notification_methods WHERE userId = ?'
    );
    const methods = stmt.all(userId);
    return methods.map(m => ({
      ...m,
      config: JSON.parse(m.config || '{}')
    }));
  },

  getByType: (userId, type) => {
    const stmt = db.prepare(
      'SELECT * FROM notification_methods WHERE userId = ? AND type = ?'
    );
    const method = stmt.get(userId, type);
    return method ? { ...method, config: JSON.parse(method.config || '{}') } : null;
  },

  update: (id, data) => {
    const fields = Object.keys(data)
      .filter(k => k !== 'config')
      .map(key => `${key} = ?`)
      .join(', ');
    
    let values = Object.entries(data)
      .filter(([k]) => k !== 'config')
      .map(([, v]) => v);

    if (data.config) {
      if (fields) fields += ', config = ?';
      else fields = 'config = ?';
      values.push(JSON.stringify(data.config));
    }

    const stmt = db.prepare(
      `UPDATE notification_methods SET ${fields}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
    );
    stmt.run(...values, id);
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM notification_methods WHERE id = ?');
    stmt.run(id);
  }
};

// Environment Credentials queries
const EnvCredential = {
  create: (userId, key, value, isEncrypted = true) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare(
      'INSERT INTO env_credentials (id, userId, key, value, isEncrypted) VALUES (?, ?, ?, ?, ?)'
    );
    stmt.run(id, userId, key, value, isEncrypted ? 1 : 0);
    return id;
  },

  getByUserId: (userId) => {
    const stmt = db.prepare(
      'SELECT id, key, isEncrypted, updatedAt FROM env_credentials WHERE userId = ?'
    );
    return stmt.all(userId);
  },

  getValueByKey: (userId, key) => {
    const stmt = db.prepare(
      'SELECT value FROM env_credentials WHERE userId = ? AND key = ?'
    );
    const result = stmt.get(userId, key);
    return result ? result.value : null;
  },

  update: (id, key, value) => {
    const stmt = db.prepare(
      'UPDATE env_credentials SET key = ?, value = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?'
    );
    stmt.run(key, value, id);
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM env_credentials WHERE id = ?');
    stmt.run(id);
  },

  deleteByKey: (userId, key) => {
    const stmt = db.prepare(
      'DELETE FROM env_credentials WHERE userId = ? AND key = ?'
    );
    stmt.run(userId, key);
  }
};

// API Usage Log queries
const ApiUsageLog = {
  create: (apiKeyId, endpoint, method, status, responseTime) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare(
      'INSERT INTO api_usage_logs (id, apiKeyId, endpoint, method, status, responseTime) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, apiKeyId, endpoint, method, status, responseTime);
  },

  getByApiKeyId: (apiKeyId, limit = 100) => {
    const stmt = db.prepare(
      'SELECT * FROM api_usage_logs WHERE apiKeyId = ? ORDER BY createdAt DESC LIMIT ?'
    );
    return stmt.all(apiKeyId, limit);
  },

  getStats: (apiKeyId) => {
    const stmt = db.prepare(`
      SELECT 
        COUNT(*) as totalRequests,
        AVG(responseTime) as avgResponseTime,
        MAX(responseTime) as maxResponseTime,
        SUM(CASE WHEN status >= 200 AND status < 300 THEN 1 ELSE 0 END) as successCount,
        SUM(CASE WHEN status >= 400 THEN 1 ELSE 0 END) as errorCount
      FROM api_usage_logs 
      WHERE apiKeyId = ?
    `);
    return stmt.get(apiKeyId);
  }
};

// Notification Test Log queries
const NotificationTestLog = {
  create: (userId, type, recipient, status, message) => {
    const id = crypto.randomUUID();
    const stmt = db.prepare(
      'INSERT INTO notification_tests (id, userId, type, recipient, status, message) VALUES (?, ?, ?, ?, ?, ?)'
    );
    stmt.run(id, userId, type, recipient, status, message);
    return id;
  },

  getByUserId: (userId, limit = 50) => {
    const stmt = db.prepare(
      'SELECT * FROM notification_tests WHERE userId = ? ORDER BY createdAt DESC LIMIT ?'
    );
    return stmt.all(userId, limit);
  }
};

module.exports = {
  User,
  ApiKey,
  NotificationMethod,
  EnvCredential,
  ApiUsageLog,
  NotificationTestLog
};
