<div align="center">
<h1> Cloud Notification </h1>
<p> NodeJS base cloud notification service for any project </p>
</div>
<hr>

## Features

✅ Push Notification (FCM)  
✅ SMS Support  
✅ WhatsApp Support  
✅ Email Support  
✅ Admin Dashboard with UI  
✅ API Key Management with Rate Limiting  
✅ User Authentication & Management  
✅ Environment Credentials Management  
✅ Connection Status Monitoring  
✅ Notification Testing Tools  

## Setup 🔥

### Prerequisites
- Node.js 14+
- Firebase Account
- Redis (optional, for queuing)

### Step 1: Prepare Environment

Rename `sample.env` to `.env` and add your credentials:

```bash
cp sample.env .env
```

Edit `.env`:
```env
# APP
PORT=4000
JWT_SECRET=your-super-secret-key-change-in-production
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

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate Private Key**
5. Save the downloaded JSON as `firebase-key.json` in the root directory

### Step 3: Install Dependencies

```bash
npm install
```

## Start the Project 🚀

### Development Mode

```bash
npm run dev
```

The application will start on `http://localhost:4000`

### Production Mode

```bash
npm start
```

## Access Points

- **Admin Dashboard:** http://localhost:4000
- **API Endpoint:** http://localhost:4000/notifications/send

## Admin Dashboard

Complete web interface to manage your notification service:

### Dashboard Features

📊 **Overview**
- Real-time system status (SQLite, Redis, Firebase)
- Quick statistics

🔑 **API Key Management**
- Generate API keys with custom rate limits
- Monitor usage statistics
- Enable/disable keys

🔐 **Credentials Management**
- Store encrypted environment variables
- Manage sensitive data
- Update credentials

📢 **Notification Methods**
- Enable/disable notification channels
- Configure method-specific settings

🧪 **Testing**
- Send test notifications
- View test history
- Monitor response times

👥 **User Management**
- User registration and login
- User administration
- Role-based access

For detailed dashboard documentation, see [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md)

## API Usage

### Authentication

First, create an account through the Admin Dashboard and generate an API key.

### Send Notification via API

**Endpoint:** `POST /notifications/send`

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_API_KEY",
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "type": "push",
  "payload": {
    "token": "USER_FCM_TOKEN",
    "title": "Notification title",
    "body": "Notification body"
  }
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:4000/notifications/send \
  -H "Authorization: Bearer sk_xxxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "push",
    "payload": {
      "token": "USER_FCM_TOKEN",
      "title": "Hello",
      "body": "Test message"
    }
  }'
```

## Database

The application uses **SQLite** for the admin dashboard database with the following tables:

- **users** - Admin users
- **api_keys** - Generated API keys
- **notification_methods** - Enabled notification channels
- **env_credentials** - Encrypted environment variables
- **api_usage_logs** - API request logs
- **notification_tests** - Test notification history

Database file: `notification-admin.db` (auto-created)

## Project Structure

```
├── src/
│   ├── db/
│   │   ├── init.js              # Database initialization
│   │   └── models.js            # Database queries
│   ├── middleware/
│   │   └── auth.js              # Authentication
│   ├── utils/
│   │   ├── encryption.js        # Data encryption
│   │   ├── connection-test.js   # Status checking
│   │   └── rate-limit.js        # Rate limiting
│   ├── controllers/
│   │   ├── admin.controller.js  # Admin API logic
│   │   └── notification.controller.js  # Notification logic
│   ├── routes/
│   │   ├── admin.routes.js      # Admin routes
│   │   └── notification.routes.js # API routes
│   ├── config/
│   │   ├── firebase.js          # Firebase config
│   │   └── redis.js             # Redis config
│   ├── workers/
│   │   └── notification.worker.js
│   ├── queues/
│   │   └── notification.queue.js
│   ├── services/
│   │   └── push.service.js
│   └── app.js                   # Main application
├── public/
│   ├── index.html               # Dashboard UI
│   ├── styles.css               # Dashboard styles
│   └── app.js                   # Frontend logic
├── firebase-key.json            # Firebase credentials (not in git)
├── notification-admin.db        # SQLite database (auto-created)
├── package.json
├── .env                         # Environment variables (not in git)
└── README.md
```

## Security

- ✅ Password hashing with bcryptjs
- ✅ JWT token authentication
- ✅ AES-256 encryption for sensitive data
- ✅ Rate limiting per API key
- ✅ Input validation
- ✅ CORS ready

## Docker Support

Build Docker image:

```bash
docker build -t notification-service .
```

Run with Docker Compose:

```bash
docker-compose up
```

See [DOCKER.md](./DOCKER.md) for detailed Docker instructions.

## Troubleshooting

### Database Locked
Delete `notification-admin.db` and restart

### Firebase Connection Failed
- Verify `firebase-key.json` exists in root
- Check Firebase credentials in `.env`

### Redis Connection Failed
- Verify Redis is running
- Check REDIS_HOST and REDIS_PORT in `.env`

### Port Already in Use
```bash
# Change PORT in .env file
# Or kill process on port 4000
```

## Environment Variables Reference

```env
# Application
PORT=4000                          # Server port
JWT_SECRET=secret                  # JWT signing secret
ENCRYPTION_KEY=encryption          # Data encryption key

# Redis
REDIS_HOST=localhost               # Redis host
REDIS_PORT=6379                    # Redis port
REDIS_USERNAME=default             # Redis username
REDIS_PASSWORD=password            # Redis password

# Firebase
FIREBASE_PROJECT_ID=project-id     # Firebase project ID
FIREBASE_CLIENT_EMAIL=email        # Firebase service account email
FIREBASE_PRIVATE_KEY=key           # Firebase private key
```

## License

ISC

## Support

For issues and questions, please create an issue in the repository.