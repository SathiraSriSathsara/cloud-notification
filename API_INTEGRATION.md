# API Integration Guide

## Overview

This guide explains how to integrate the Cloud Notification Service API into your applications.

## Authentication

All API requests must include an API key generated through the Admin Dashboard.

### Getting Your API Key

1. Open Admin Dashboard (http://localhost:4000)
2. Login or register
3. Go to **API Keys** tab
4. Click **New Key**
5. Enter a name and configure rate limits
6. Copy the generated key (format: `sk_...`)

### API Key in Requests

Include your API key in the `Authorization` header:

```
Authorization: Bearer sk_your_api_key_here
```

## Rate Limiting

Each API key has configurable rate limits:

- **Rate Limit**: Maximum requests allowed per window (default: 1000)
- **Rate Limit Window**: Time window in seconds (default: 3600 = 1 hour)

Example: 1000 requests per 3600 seconds = ~0.28 requests per second

### Rate Limit Headers

Responses include rate limit information:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1234567890
```

If limit exceeded, you'll receive:

```
HTTP 429 Too Many Requests
{
  "error": "Rate limit exceeded"
}
```

## Sending Notifications

### Endpoint

```
POST /notifications/send
```

### Request Headers

```json
{
  "Authorization": "Bearer sk_xxxxx",
  "Content-Type": "application/json"
}
```

### Request Body

```json
{
  "type": "push",
  "payload": {
    "token": "device_token",
    "title": "Notification Title",
    "body": "Notification message"
  }
}
```

### Notification Types

#### Push Notification (FCM)
```json
{
  "type": "push",
  "payload": {
    "token": "device_fcm_token",
    "title": "Hello User",
    "body": "You have a new message",
    "data": {
      "userId": "123",
      "action": "open_app"
    }
  }
}
```

#### SMS (Coming Soon)
```json
{
  "type": "sms",
  "payload": {
    "phoneNumber": "+1234567890",
    "message": "Your verification code is: 123456"
  }
}
```

#### WhatsApp (Coming Soon)
```json
{
  "type": "whatsapp",
  "payload": {
    "phoneNumber": "+1234567890",
    "message": "Hello from Cloud Notification"
  }
}
```

#### Email (Coming Soon)
```json
{
  "type": "email",
  "payload": {
    "email": "user@example.com",
    "subject": "Welcome",
    "body": "Email message content"
  }
}
```

### Response

**Success (200 OK):**
```json
{
  "message": "Notification queued",
  "type": "push",
  "queuedAt": "2024-04-18T10:30:00Z"
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Invalid payload"
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "API key required"
}
```

**Error (403 Forbidden):**
```json
{
  "error": "Invalid or inactive API key"
}
```

**Error (429 Too Many Requests):**
```json
{
  "error": "Rate limit exceeded"
}
```

## Code Examples

### JavaScript/Node.js

**Using Fetch:**
```javascript
const sendNotification = async (message) => {
  const response = await fetch('http://localhost:4000/notifications/send', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer sk_xxxxx',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'push',
      payload: {
        token: 'device_token',
        title: message.title,
        body: message.body
      }
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

// Usage
sendNotification({
  title: 'Hello',
  body: 'Test notification'
}).then(result => console.log(result))
  .catch(error => console.error(error));
```

**Using Axios:**
```javascript
const axios = require('axios');

const notificationClient = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Authorization': 'Bearer sk_xxxxx'
  }
});

const sendNotification = async (type, payload) => {
  try {
    const response = await notificationClient.post('/notifications/send', {
      type,
      payload
    });
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

// Usage
sendNotification('push', {
  token: 'device_token',
  title: 'Alert',
  body: 'Something happened'
});
```

### Python

```python
import requests
import json

class NotificationClient:
    def __init__(self, api_key, base_url='http://localhost:4000'):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def send(self, notification_type, payload):
        url = f'{self.base_url}/notifications/send'
        data = {
            'type': notification_type,
            'payload': payload
        }
        
        try:
            response = requests.post(url, json=data, headers=self.headers)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f'Error: {e.response.json() if e.response else str(e)}')
            return None

# Usage
client = NotificationClient('sk_xxxxx')

result = client.send('push', {
    'token': 'device_token',
    'title': 'Hello',
    'body': 'Test message'
})

print(result)
```

### PHP

```php
<?php

class NotificationClient {
    private $apiKey;
    private $baseUrl;
    
    public function __construct($apiKey, $baseUrl = 'http://localhost:4000') {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }
    
    public function send($type, $payload) {
        $url = $this->baseUrl . '/notifications/send';
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ];
        
        $data = [
            'type' => $type,
            'payload' => $payload
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode === 200) {
            return json_decode($response, true);
        } else {
            throw new Exception('API Error: ' . $response);
        }
    }
}

// Usage
$client = new NotificationClient('sk_xxxxx');

try {
    $result = $client->send('push', [
        'token' => 'device_token',
        'title' => 'Hello',
        'body' => 'Test message'
    ]);
    
    echo json_encode($result);
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage();
}
?>
```

### cURL

```bash
curl -X POST http://localhost:4000/notifications/send \
  -H "Authorization: Bearer sk_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "push",
    "payload": {
      "token": "device_token",
      "title": "Hello",
      "body": "Test notification"
    }
  }'
```

## Best Practices

### 1. Error Handling

Always implement proper error handling:

```javascript
try {
  const result = await sendNotification(data);
  console.log('Success:', result);
} catch (error) {
  if (error.status === 429) {
    // Rate limited - implement backoff
    console.log('Rate limited, retrying later...');
  } else if (error.status === 401) {
    // Invalid API key
    console.log('Invalid API key');
  } else {
    // Other error
    console.log('Error:', error.message);
  }
}
```

### 2. Rate Limit Handling

Implement exponential backoff for rate limits:

```javascript
async function sendWithRetry(data, maxRetries = 3) {
  let delay = 1000; // 1 second
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendNotification(data);
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw error;
      }
    }
  }
}
```

### 3. Batch Processing

For sending multiple notifications:

```javascript
async function sendBatch(notifications) {
  const results = [];
  
  for (const notification of notifications) {
    try {
      const result = await sendNotification(notification);
      results.push({ success: true, result });
    } catch (error) {
      results.push({ success: false, error: error.message });
    }
    
    // Small delay between requests to avoid rate limit
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}
```

### 4. API Key Security

- Never commit API keys to version control
- Store API keys in environment variables
- Rotate keys regularly
- Disable unused keys
- Monitor key usage in the dashboard

### 5. Monitoring

Check API usage statistics in the Admin Dashboard:

1. Go to **API Keys** tab
2. Click **Stats** button
3. View request counts, success/error rates, response times

## Support

For issues or questions:
- Check the [Admin Dashboard Guide](./ADMIN_DASHBOARD.md)
- Review the [README](./README.md)
- Check test examples in the Dashboard's **Test** tab
