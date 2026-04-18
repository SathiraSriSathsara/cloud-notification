// src/db/init.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../notification-admin.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
function initializeDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // API Keys table
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      key TEXT UNIQUE NOT NULL,
      rateLimit INTEGER DEFAULT 1000,
      rateLimitWindow INTEGER DEFAULT 3600,
      isActive BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      lastUsedAt DATETIME,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Notification Methods table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_methods (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      isEnabled BOOLEAN DEFAULT 0,
      config TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(userId, type)
    )
  `);

  // Environment Credentials table
  db.exec(`
    CREATE TABLE IF NOT EXISTS env_credentials (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT NOT NULL,
      isEncrypted BOOLEAN DEFAULT 1,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // API Usage Logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS api_usage_logs (
      id TEXT PRIMARY KEY,
      apiKeyId TEXT NOT NULL,
      endpoint TEXT,
      method TEXT,
      status INTEGER,
      responseTime INTEGER,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (apiKeyId) REFERENCES api_keys(id) ON DELETE CASCADE
    )
  `);

  // Notification Test Logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notification_tests (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      type TEXT,
      recipient TEXT,
      status TEXT,
      message TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_api_keys_userId ON api_keys(userId);
    CREATE INDEX IF NOT EXISTS idx_api_usage_logs_apiKeyId ON api_usage_logs(apiKeyId);
    CREATE INDEX IF NOT EXISTS idx_notification_tests_userId ON notification_tests(userId);
    CREATE INDEX IF NOT EXISTS idx_env_credentials_userId ON env_credentials(userId);
    CREATE INDEX IF NOT EXISTS idx_notification_methods_userId ON notification_methods(userId);
  `);

  console.log('✅ Database initialized successfully');
}

initializeDatabase();
module.exports = db;
