# Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp sample.env .env
```

Edit `.env` and add your Firebase credentials:
- Get `firebase-key.json` from Firebase Console
- Copy FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

### 3. Create Firebase Key File
Create `firebase-key.json` in root directory with your Firebase service account credentials.

### 4. Start Application
```bash
npm run dev
```

### 5. Access Dashboard
Open http://localhost:4000 in your browser

## First Steps

1. **Register**: Click "Register" tab and create an account
2. **Login**: Login with your credentials
3. **Generate API Key**: Go to "API Keys" tab and create a new key
4. **Test Connection**: Go to "Overview" tab to see connection status
5. **Enable Notifications**: Go to "Notifications" tab and enable PUSH
6. **Send Test**: Go to "Test" tab and send a test notification

## Common Tasks

### Add Environment Variable
1. Go to "Credentials" tab
2. Click "Add Credential"
3. Enter key (e.g., TWILIO_API_KEY)
4. Enter value
5. Save (automatically encrypted)

### Generate API Key for Your App
1. Go to "API Keys" tab
2. Click "New Key"
3. Enter key name (e.g., "Mobile App v1")
4. Set rate limit (default 1000 requests/hour)
5. Click Create
6. Copy the key and use it in your app

### Test Notification
1. Go to "Test" tab
2. Select notification type (PUSH, SMS, etc.)
3. Enter recipient (device token, phone, etc.)
4. Enter message
5. Click "Send Test"
6. Check history for results

## Using in Your Application

### JavaScript/Node.js
```javascript
const API_KEY = 'sk_xxxx'; // From dashboard

const sendNotification = async () => {
  const response = await fetch('http://localhost:4000/notifications/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'push',
      payload: {
        token: 'USER_FCM_TOKEN',
        title: 'Hello',
        body: 'Test message'
      }
    })
  });
  return response.json();
};
```

### Python
```python
import requests

API_KEY = 'sk_xxxx'
headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

data = {
    'type': 'push',
    'payload': {
        'token': 'USER_FCM_TOKEN',
        'title': 'Hello',
        'body': 'Test message'
    }
}

response = requests.post(
    'http://localhost:4000/notifications/send',
    json=data,
    headers=headers
)
print(response.json())
```

### cURL
```bash
curl -X POST http://localhost:4000/notifications/send \
  -H "Authorization: Bearer sk_xxxx" \
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

## Database Files

- **notification-admin.db**: SQLite database (auto-created)
  - Users and API keys
  - Stored credentials
  - Notification settings
  - Usage logs

- **firebase-key.json**: Firebase credentials (create manually)

## Troubleshooting

### Port 4000 already in use
Edit `.env` and change PORT:
```env
PORT=5000
```

### Database locked error
Delete `notification-admin.db` and restart

### Firebase connection failed
- Verify `firebase-key.json` exists in root
- Check FIREBASE_PROJECT_ID and credentials in `.env`
- Test Firebase key in Firebase Console

### Can't see data in dashboard
- Clear browser cache (Ctrl+Shift+Del)
- Check browser console for errors (F12)
- Verify token exists in localStorage

## Support

For more details, see:
- [README.md](./README.md) - Full documentation
- [ADMIN_DASHBOARD.md](./ADMIN_DASHBOARD.md) - Dashboard guide
- [DOCKER.md](./DOCKER.md) - Docker deployment

## Next Steps

1. **Add More Notification Methods**: Configure SMS, WhatsApp, Email
2. **Integrate API Key**: Add API key to your application
3. **Setup Rate Limiting**: Configure limits per API key
4. **Monitor Usage**: Check API key statistics
5. **Deploy**: Use Docker or your preferred hosting
