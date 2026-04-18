// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticateToken } = require('../middleware/auth');

// ============ AUTH ROUTES ============
router.post('/auth/register', adminController.register);
router.post('/auth/login', adminController.login);

// ============ USER MANAGEMENT ROUTES ============
router.get('/user/me', authenticateToken, adminController.getCurrentUser);
router.get('/users', authenticateToken, adminController.getAllUsers);
router.delete('/users/:userId', authenticateToken, adminController.deleteUser);

// ============ API KEY ROUTES ============
router.post('/api-keys', authenticateToken, adminController.createApiKey);
router.get('/api-keys', authenticateToken, adminController.getApiKeys);
router.delete('/api-keys/:keyId', authenticateToken, adminController.deleteApiKey);
router.put('/api-keys/:keyId', authenticateToken, adminController.updateApiKey);
router.get('/api-keys/:keyId/stats', authenticateToken, adminController.getApiKeyStats);

// ============ ENVIRONMENT CREDENTIALS ROUTES ============
router.post('/credentials', authenticateToken, adminController.createEnvCredential);
router.get('/credentials', authenticateToken, adminController.getEnvCredentials);
router.put('/credentials/:credentialId', authenticateToken, adminController.updateEnvCredential);
router.delete('/credentials/:credentialId', authenticateToken, adminController.deleteEnvCredential);

// ============ NOTIFICATION METHODS ROUTES ============
router.get('/notification-methods', authenticateToken, adminController.getNotificationMethods);
router.put('/notification-methods/:methodId', authenticateToken, adminController.updateNotificationMethod);

// ============ NOTIFICATION TESTING ROUTES ============
router.post('/test-notification', authenticateToken, adminController.testNotification);
router.get('/test-history', authenticateToken, adminController.getNotificationTests);

// ============ CONNECTION STATUS ROUTES ============
router.get('/status', authenticateToken, adminController.getConnectionStatus);
router.get('/status/detailed', authenticateToken, adminController.getDetailedStatus);

module.exports = router;
