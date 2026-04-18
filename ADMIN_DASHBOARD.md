# Admin Dashboard Setup & Guide

## Overview

The Admin Dashboard is a complete web application built with **Node.js/Express** and **SQLite** that allows you to manage and control the notification service.

## Features

### 1. **User Management**
- User registration and login with JWT authentication
- User management (create, view, delete users)
- Role-based access control (admin/user)

### 2. **API Key Management**
- Generate unlimited API keys for different applications
- Configure rate limits per API key (requests per time window)
- View API key usage statistics
- Enable/disable API keys
- Track API key creation and usage

### 3. **Environment Credentials**
- Securely store environment credentials
- Automatic encryption for sensitive values
- Support for multiple credential types
- Edit and manage credentials

### 4. **Notification Methods**
- Enable/disable different notification channels:
  - 🔔 Push Notifications (Firebase)
  - 📱 SMS
  - 💬 WhatsApp
  - 📧 Email
- Configure settings per notification method

### 5. **Notification Testing**
- Test notifications before deployment
- Send test messages to any recipient
- View test history and results
- Test response times and status

### 6. **Connection Status**
- Real-time monitoring of all database connections
- SQLite status
- Redis connection status
- Firebase connection status
- Detailed connection information

## Installation

### Prerequisites
- Node.js 14+
- npm or yarn

### Steps

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables** (`.env`):
```env
# APP
PORT=4000
JWT_SECRET=your-secret-key-change-in-production
ENCRYPTION_KEY=your-encryption-key

# REDIS
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_USERNAME=default

# FIREBASE
FIREBASE_PROJECT_ID=xxx
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXX\n-----END PRIVATE KEY-----\n"
```

3. **Start the application:**
```bash
# Development
npm run dev

# Production
npm start
```

4. **Access the dashboard:**
Open http://localhost:4000 in your browser

## Usage Guide

### First Login
1. Click "Register" to create a new admin account
2. Enter username, email, and password
3. You'll be automatically logged in

### Dashboard Tabs

#### 📊 Overview
- View system status (SQLite, Redis, Firebase)
- See quick statistics (API keys, credentials, enabled methods)

#### 🔑 API Keys
- **Create New Key:** Click "New Key", enter name and rate limits
- **View Keys:** See all API keys with their status
- **Copy Key:** Click Copy to get the full API key
- **View Stats:** Check usage statistics for each key
- **Disable Key:** Toggle the Active status
- **Delete Key:** Remove unused keys

#### 🔐 Credentials
- **Add Credential:** Click "Add Credential" to store sensitive data
- **Encrypted Storage:** All values are automatically encrypted
- **Edit:** Modify existing credentials
- **Delete:** Remove credentials

#### 📢 Notifications
- **Enable/Disable Methods:** Toggle notification channels on/off
- **Configure:** Each method can be configured with specific settings
- **Visual Indicators:** Green border shows enabled methods

#### 🧪 Test
- **Test Type:** Select notification channel (Push/SMS/WhatsApp/Email)
- **Recipient:** Enter device token, phone, or email
- **Message:** Provide title and body
- **Send Test:** Click button to send test notification
- **View History:** See all test attempts and results

#### 👥 Users
- **View All Users:** List all registered users
- **User Details:** See username, email, role, and creation date
- **Delete User:** Remove users from the system

## API Endpoints

### Authentication
- `POST /api/admin/auth/register` - Register new user
- `POST /api/admin/auth/login` - Login user

### User Management
- `GET /api/admin/user/me` - Get current user
- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/users/:userId` - Delete user

### API Keys
- `POST /api/admin/api-keys` - Create API key
- `GET /api/admin/api-keys` - List all keys for user
- `DELETE /api/admin/api-keys/:keyId` - Delete API key
- `PUT /api/admin/api-keys/:keyId` - Update API key settings
- `GET /api/admin/api-keys/:keyId/stats` - Get API key statistics

### Credentials
- `POST /api/admin/credentials` - Add credential
- `GET /api/admin/credentials` - List credentials
- `PUT /api/admin/credentials/:credentialId` - Update credential
- `DELETE /api/admin/credentials/:credentialId` - Delete credential

### Notification Methods
- `GET /api/admin/notification-methods` - List all methods
- `PUT /api/admin/notification-methods/:methodId` - Update method settings

### Testing
- `POST /api/admin/test-notification` - Send test notification
- `GET /api/admin/test-history` - Get test history

### Connection Status
- `GET /api/admin/status` - Get basic connection status
- `GET /api/admin/status/detailed` - Get detailed connection information

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### API Keys Table
```sql
CREATE TABLE api_keys (
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
  FOREIGN KEY (userId) REFERENCES users(id)
)
```

### Notification Methods Table
```sql
CREATE TABLE notification_methods (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  isEnabled BOOLEAN DEFAULT 0,
  config TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
)
```

### Environment Credentials Table
```sql
CREATE TABLE env_credentials (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  isEncrypted BOOLEAN DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
)
```

## Security Features

1. **Password Hashing:** Passwords are hashed using bcryptjs
2. **JWT Authentication:** Token-based authentication with 7-day expiration
3. **Credential Encryption:** All sensitive values are encrypted using AES-256-CBC
4. **CORS Ready:** Can be configured for cross-origin requests
5. **Rate Limiting:** Built-in rate limiting per API key

## Best Practices

1. **Change JWT_SECRET:** Always change the JWT_SECRET in production
2. **Use HTTPS:** Deploy with SSL/TLS in production
3. **Environment Variables:** Never commit `.env` files to version control
4. **API Key Rotation:** Regularly rotate API keys for security
5. **Monitor Usage:** Check API key stats regularly
6. **Backup Database:** Regularly backup the SQLite database

## Troubleshooting

### Database Issues
- Delete `notification-admin.db` to reset the database
- Check database file permissions

### Connection Errors
- Verify Redis connection details in `.env`
- Verify Firebase credentials are correct
- Check firewall rules for network access

### Authentication Issues
- Clear browser cookies and localStorage
- Verify JWT_SECRET hasn't changed
- Check user exists in database

## Development

### Project Structure
```
src/
├── db/
│   ├── init.js          # Database initialization
│   └── models.js        # Database queries
├── middleware/
│   └── auth.js          # JWT authentication
├── utils/
│   ├── encryption.js    # Encryption utilities
│   ├── connection-test.js # Connection monitoring
│   └── rate-limit.js    # Rate limiting
├── controllers/
│   └── admin.controller.js # Business logic
├── routes/
│   └── admin.routes.js  # API routes
└── app.js               # Main application

public/
├── index.html           # Frontend UI
├── styles.css          # Dashboard styles
└── app.js              # Frontend logic
```

### Adding New Notification Methods

1. Update `NotificationMethod.create()` in `src/db/models.js`
2. Add handler in `src/controllers/admin.controller.js`
3. Update frontend in `public/app.js`
4. Test through dashboard

## License

ISC
