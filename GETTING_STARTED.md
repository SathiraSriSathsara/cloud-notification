# Getting Started - Complete Guide

Welcome to the Cloud Notification Service Admin Dashboard! This guide will walk you through everything from setup to deployment.

## 📋 Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Starting the Service](#starting-the-service)
4. [First Time Setup](#first-time-setup)
5. [Using the Dashboard](#using-the-dashboard)
6. [API Integration](#api-integration)
7. [Deployment](#deployment)

## 🚀 Installation

### Prerequisites
- Node.js 14 or higher
- npm or yarn
- Firebase Account (for push notifications)
- Redis (optional, for message queuing)

### Step 1: Clone or Download the Project
```bash
cd cloud-notification
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install:
- Express.js - Web framework
- Firebase Admin SDK - Push notifications
- BullMQ - Message queue
- Redis - In-memory data store
- JWT - Authentication
- bcryptjs - Password hashing
- better-sqlite3 - Lightweight database
- And more...

## ⚙️ Configuration

### Step 1: Copy Environment File
```bash
cp sample.env .env
```

### Step 2: Get Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or select existing)
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate Private Key**
5. Download the JSON file
6. Save it as `firebase-key.json` in the project root

### Step 3: Edit .env File

Open `.env` and fill in your credentials:

```env
# ============ APP ============
PORT=4000
JWT_SECRET=your-super-secret-key-change-this
ENCRYPTION_KEY=your-encryption-key-change-this

# ============ REDIS ============
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_USERNAME=default

# ============ FIREBASE ============
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-email@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**Important Tips:**
- Change `JWT_SECRET` to a strong random string in production
- Keep `.env` file in `.gitignore` (don't commit!)
- Use strong passwords for all services

## 🔥 Starting the Service

### Development Mode (with auto-reload)
```bash
npm run dev
```

You'll see:
```
✅ Redis connected
✅ Database initialized successfully
🚀 Notification service running on 4000
📊 Admin Dashboard: http://localhost:4000
```

### Production Mode
```bash
npm start
```

## 👥 First Time Setup

### 1. Open Dashboard
Open http://localhost:4000 in your browser

You'll see the login/register screen.

### 2. Create Admin Account
- Click the **Register** tab
- Enter username, email, password
- Click **Register**
- You'll be logged in automatically

### 3. Generate API Key
1. Navigate to **🔑 API Keys** tab
2. Click **+ New Key**
3. Enter a name (e.g., "Development")
4. Set rate limit (default: 1000 requests/hour)
5. Click **Create**
6. Copy the generated key (it won't show again!)

### 4. Enable Notifications
1. Go to **📢 Notifications** tab
2. Toggle to enable PUSH (and other methods as needed)
3. Each notification type will turn green when enabled

### 5. Test Connection
1. Go to **📊 Overview** tab
2. See connection status for:
   - 💾 SQLite (local database)
   - ⚡ Redis (message queue)
   - 🔥 Firebase (push notifications)

### 6. Send Test Notification
1. Go to **🧪 Test** tab
2. Select **PUSH** notification type
3. Enter a Firebase device token
4. Enter a test message
5. Click **Send Test**
6. Check history for results

## 📊 Using the Dashboard

### Overview Tab
- System status at a glance
- Quick statistics
- Connection status

### API Keys Tab
- View all your API keys
- Create new keys
- Copy key to clipboard
- View usage statistics
- Enable/disable keys
- Delete unused keys

### Credentials Tab
- Store sensitive data (API keys, passwords, etc.)
- Automatically encrypted
- Add/edit/delete credentials

### Notifications Tab
- Enable/disable notification channels
- Supported: PUSH, SMS, WHATSAPP, EMAIL
- Visual indicators for enabled methods

### Test Tab
- Send test notifications
- Try different notification types
- View test history
- Check response times

### Users Tab
- View registered users
- Delete users (admin only)
- User management

## 🔌 API Integration

### Getting Your API Key
1. Login to dashboard
2. Go to **API Keys** tab
3. Create a new key
4. Copy the key

### Making API Requests

**Endpoint:** `POST /notifications/send`

**Headers:**
```
Authorization: Bearer sk_your_api_key
Content-Type: application/json
```

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:4000/notifications/send', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer sk_xxxxx',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'push',
    payload: {
      token: 'device_token_here',
      title: 'Hello',
      body: 'Test notification'
    }
  })
});

const result = await response.json();
console.log(result);
```

**Example - cURL:**
```bash
curl -X POST http://localhost:4000/notifications/send \
  -H "Authorization: Bearer sk_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "push",
    "payload": {
      "token": "device_token",
      "title": "Hello",
      "body": "Test message"
    }
  }'
```

### Rate Limiting
Each API key has configurable rate limits:
- Default: 1000 requests per 3600 seconds (1 hour)
- Change limits in the dashboard
- Get 429 error if exceeded

For detailed API information, see [API_INTEGRATION.md](./API_INTEGRATION.md)

## 🐳 Deployment

### Using Docker

Build image:
```bash
docker build -t notification-service .
```

Run container:
```bash
docker run -p 4000:4000 \
  -e JWT_SECRET=your_secret \
  -e REDIS_HOST=redis_host \
  -e FIREBASE_PROJECT_ID=your_id \
  notification-service
```

### Using Docker Compose

```bash
docker-compose up -d
```

See [DOCKER.md](./DOCKER.md) for detailed Docker instructions.

### Using PM2 (Node.js Process Manager)

Install PM2:
```bash
npm install -g pm2
```

Start service:
```bash
pm2 start src/app.js --name "notification-service"
```

View logs:
```bash
pm2 logs notification-service
```

## 📁 Project Structure

```
cloud-notification/
├── public/                    # Frontend
│   ├── index.html            # Dashboard HTML
│   ├── styles.css            # Dashboard styles
│   └── app.js                # Dashboard logic
├── src/
│   ├── db/
│   │   ├── init.js           # Database setup
│   │   └── models.js         # Database queries
│   ├── middleware/
│   │   └── auth.js           # JWT authentication
│   ├── utils/
│   │   ├── encryption.js     # Data encryption
│   │   ├── connection-test.js # Status checking
│   │   └── rate-limit.js     # Rate limiting
│   ├── controllers/
│   │   ├── admin.controller.js
│   │   └── notification.controller.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   └── notification.routes.js
│   ├── config/
│   │   ├── firebase.js
│   │   └── redis.js
│   ├── workers/
│   ├── queues/
│   ├── services/
│   └── app.js
├── notification-admin.db      # SQLite database (auto-created)
├── firebase-key.json         # Firebase credentials (create manually)
├── .env                      # Environment variables (create from sample.env)
└── package.json
```

## 🔐 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` to git
   - Use strong random secrets
   - Rotate secrets regularly

2. **API Keys**
   - Keep API keys secret
   - Use different keys for different apps
   - Disable unused keys
   - Monitor key usage

3. **Database**
   - Backup `notification-admin.db` regularly
   - Use strong database access
   - Encrypt credentials at rest

4. **HTTPS/TLS**
   - Always use HTTPS in production
   - Use reverse proxy (nginx, apache)
   - Enable CORS only for trusted domains

## 🐛 Troubleshooting

### Port 4000 Already in Use
```bash
# Change port in .env
PORT=5000

# Or kill process on port 4000
# On Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# On Mac/Linux:
lsof -i :4000
kill -9 <PID>
```

### Database Locked Error
```bash
# Delete the database file (it will recreate)
rm notification-admin.db
```

### Firebase Connection Failed
- Verify `firebase-key.json` exists in root
- Check FIREBASE_PROJECT_ID in `.env`
- Verify credentials are valid
- Test in Firebase Console

### Redis Connection Failed
- Verify Redis is running
- Check REDIS_HOST and REDIS_PORT
- Verify authentication if required
- Check firewall rules

### Can't Login
- Clear browser cache: Ctrl+Shift+Del
- Check browser console for errors: F12
- Verify database exists: check for `notification-admin.db`

## 📚 Documentation

- **QUICKSTART.md** - 5-minute setup
- **ADMIN_DASHBOARD.md** - Dashboard documentation
- **API_INTEGRATION.md** - API integration guide
- **IMPLEMENTATION_SUMMARY.md** - What was built

## 🆘 Support

### Common Issues
1. **"Cannot find module"** → Run `npm install`
2. **"Port already in use"** → Change PORT in `.env`
3. **"Firebase error"** → Check firebase-key.json
4. **"Database locked"** → Delete `notification-admin.db`

### Getting Help
1. Check the relevant documentation file
2. Review error messages carefully
3. Check browser console (F12)
4. Check server logs in terminal

## ✅ Verification Checklist

After setup, verify everything is working:

- [ ] `npm install` completed successfully
- [ ] `.env` file created and filled in
- [ ] `firebase-key.json` placed in root
- [ ] `npm run dev` starts without errors
- [ ] Dashboard accessible at http://localhost:4000
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Can generate an API key
- [ ] Connection status shows all green
- [ ] Can send a test notification

## 🎉 Next Steps

1. **Configure Notifications**
   - Enable notification methods you need
   - Add credentials for SMS/WhatsApp/Email

2. **Create API Keys**
   - Generate keys for your applications
   - Set appropriate rate limits

3. **Integrate into Your App**
   - Use API key to send notifications
   - Handle rate limits gracefully
   - Monitor usage in dashboard

4. **Deploy to Production**
   - Use Docker or PM2
   - Set strong JWT_SECRET
   - Enable HTTPS/TLS
   - Setup backups

5. **Monitor and Maintain**
   - Check dashboard regularly
   - Review API usage stats
   - Rotate API keys periodically
   - Update dependencies

## 💡 Pro Tips

- Generate separate API keys for development, staging, and production
- Set reasonable rate limits to prevent abuse
- Monitor notification delivery in logs
- Use test tab before sending important notifications
- Backup database regularly
- Use environment variables for all secrets

---

**Ready to start?** Run:
```bash
npm install && npm run dev
```

Then open http://localhost:4000

Enjoy managing your notifications! 🎉
