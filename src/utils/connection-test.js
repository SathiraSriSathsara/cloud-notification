// src/utils/connection-test.js
const redis = require('../config/redis');
const admin = require('../config/firebase');
const db = require('../db/init');

const testConnections = async () => {
  const status = {
    sqlite: false,
    redis: false,
    firebase: false,
    timestamp: new Date().toISOString()
  };

  // Test SQLite
  try {
    db.prepare('SELECT 1').get();
    status.sqlite = true;
  } catch (error) {
    console.error('SQLite connection error:', error.message);
  }

  // Test Redis
  try {
    await redis.ping();
    status.redis = true;
  } catch (error) {
    console.error('Redis connection error:', error.message);
  }

  // Test Firebase
  try {
    await admin.apps[0].firestore().collection('_test').doc('_test').get();
    status.firebase = true;
  } catch (error) {
    console.error('Firebase connection error:', error.message);
  }

  return status;
};

const getDetailedConnectionStatus = async () => {
  const status = {
    sqlite: { connected: false, info: {} },
    redis: { connected: false, info: {} },
    firebase: { connected: false, info: {} },
    timestamp: new Date().toISOString()
  };

  // SQLite Details
  try {
    const info = db.prepare("PRAGMA database_list").all();
    status.sqlite.connected = true;
    status.sqlite.info = info;
  } catch (error) {
    status.sqlite.error = error.message;
  }

  // Redis Details
  try {
    const info = await redis.info();
    status.redis.connected = true;
    status.redis.info = {
      version: info.split('\r\n').find(line => line.includes('redis_version:'))?.split(':')[1],
      connected_clients: info.split('\r\n').find(line => line.includes('connected_clients:'))?.split(':')[1]
    };
  } catch (error) {
    status.redis.error = error.message;
  }

  // Firebase Details
  try {
    const projectId = admin.apps[0]?.options?.projectId || 'unknown';
    status.firebase.connected = true;
    status.firebase.info = { projectId };
  } catch (error) {
    status.firebase.error = error.message;
  }

  return status;
};

module.exports = {
  testConnections,
  getDetailedConnectionStatus
};
