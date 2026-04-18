// public/app.js

const API_BASE_URL = '/api/admin';
let authToken = localStorage.getItem('authToken') || null;
let currentUser = null;

// ============ AUTH FUNCTIONS ============

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    event.target.classList.add('active');
}

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            document.getElementById('login-error').textContent = data.error || 'Login failed';
            return;
        }

        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        currentUser = { id: data.userId, username: data.username };
        showDashboard();
    } catch (error) {
        document.getElementById('login-error').textContent = 'Network error: ' + error.message;
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            document.getElementById('register-error').textContent = data.error || 'Registration failed';
            return;
        }

        authToken = data.token;
        localStorage.setItem('authToken', authToken);
        currentUser = { id: data.userId, username };
        showDashboard();
    } catch (error) {
        document.getElementById('register-error').textContent = 'Network error: ' + error.message;
    }
}

function logout() {
    authToken = null;
    localStorage.removeItem('authToken');
    document.getElementById('auth-section').style.display = 'block';
    document.getElementById('dashboard-section').style.display = 'none';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

// ============ DASHBOARD FUNCTIONS ============

function showDashboard() {
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('dashboard-section').style.display = 'flex';
    document.getElementById('user-info').textContent = `👤 ${currentUser.username}`;
    loadDashboardData();
}

function switchDashboardTab(tab) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`${tab}-tab`).classList.add('active');
    event.target.classList.add('active');

    if (tab === 'overview') loadOverviewData();
    if (tab === 'api-keys') loadApiKeys();
    if (tab === 'credentials') loadCredentials();
    if (tab === 'notifications') loadNotificationMethods();
    if (tab === 'test') loadTestHistory();
    if (tab === 'users') loadUsers();
}

async function loadDashboardData() {
    loadOverviewData();
    loadApiKeys();
    loadCredentials();
    loadNotificationMethods();
}

// ============ API HELPER ============

async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'API Error');
    return data;
}

// ============ OVERVIEW TAB ============

async function loadOverviewData() {
    try {
        const [status, keys, creds, methods] = await Promise.all([
            apiCall('/status'),
            apiCall('/api-keys'),
            apiCall('/credentials'),
            apiCall('/notification-methods')
        ]);

        updateStatusCards(status);
        document.getElementById('api-keys-count').textContent = keys.length;
        document.getElementById('credentials-count').textContent = creds.length;
        document.getElementById('methods-enabled-count').textContent = methods.filter(m => m.isEnabled).length;
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

function updateStatusCards(status) {
    const cards = {
        'sqlite-status': status.sqlite,
        'redis-status': status.redis,
        'firebase-status': status.firebase
    };

    Object.entries(cards).forEach(([cardId, connected]) => {
        const card = document.getElementById(cardId);
        if (card) {
            card.classList.toggle('connected', connected);
            card.classList.toggle('disconnected', !connected);
            const statusText = card.querySelector('.status-text');
            statusText.textContent = connected ? '✅ Connected' : '❌ Disconnected';
        }
    });
}

// ============ API KEYS TAB ============

async function loadApiKeys() {
    try {
        const keys = await apiCall('/api-keys');
        const tbody = document.getElementById('api-keys-table');

        if (!keys.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No API keys created yet</td></tr>';
            return;
        }

        tbody.innerHTML = keys.map(key => `
            <tr>
                <td>${key.name}</td>
                <td><code>${key.key.substring(0, 10)}...${key.key.substring(key.key.length - 4)}</code></td>
                <td>${key.rateLimit} / ${key.rateLimitWindow}s</td>
                <td><span class="badge ${key.isActive ? 'badge-success' : 'badge-danger'}">
                    ${key.isActive ? 'Active' : 'Inactive'}
                </span></td>
                <td>${new Date(key.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="copyToClipboard('${key.key}')">Copy</button>
                    <button class="btn btn-sm btn-secondary" onclick="showApiKeyStats('${key.id}')">Stats</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteApiKey('${key.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading API keys:', error);
    }
}

function openCreateKeyModal() {
    document.getElementById('create-key-modal').classList.add('active');
    document.getElementById('modal-backdrop').classList.add('active');
}

async function handleCreateApiKey(event) {
    event.preventDefault();
    const name = document.getElementById('modal-key-name').value;
    const rateLimit = parseInt(document.getElementById('modal-rate-limit').value);
    const rateLimitWindow = parseInt(document.getElementById('modal-rate-window').value);

    try {
        const result = await apiCall('/api-keys', 'POST', { name, rateLimit, rateLimitWindow });
        showSuccessMessage(`API Key created! Key: ${result.key}`);
        closeAllModals();
        document.getElementById('modal-key-name').value = '';
        document.getElementById('modal-rate-limit').value = '1000';
        document.getElementById('modal-rate-window').value = '3600';
        loadApiKeys();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteApiKey(keyId) {
    if (!confirm('Delete this API key?')) return;
    try {
        await apiCall(`/api-keys/${keyId}`, 'DELETE');
        showSuccessMessage('API Key deleted');
        loadApiKeys();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
    showSuccessMessage('Copied to clipboard!');
}

async function showApiKeyStats(keyId) {
    try {
        const stats = await apiCall(`/api-keys/${keyId}/stats`);
        const message = `
API Key Statistics:
- Total Requests: ${stats.stats.totalRequests || 0}
- Successful: ${stats.stats.successCount || 0}
- Errors: ${stats.stats.errorCount || 0}
- Avg Response Time: ${Math.round(stats.stats.avgResponseTime || 0)}ms
        `;
        alert(message);
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ============ CREDENTIALS TAB ============

async function loadCredentials() {
    try {
        const creds = await apiCall('/credentials');
        const tbody = document.getElementById('credentials-table');

        if (!creds.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center">No credentials stored</td></tr>';
            return;
        }

        tbody.innerHTML = creds.map(cred => `
            <tr>
                <td>${cred.key}</td>
                <td>${cred.isEncrypted ? '🔒 Yes' : '⚠️ No'}</td>
                <td>${new Date(cred.updatedAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="editCredential('${cred.id}')">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCredential('${cred.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading credentials:', error);
    }
}

function openCreateCredentialModal() {
    document.getElementById('create-credential-modal').classList.add('active');
    document.getElementById('modal-backdrop').classList.add('active');
}

async function handleCreateCredential(event) {
    event.preventDefault();
    const key = document.getElementById('modal-cred-key').value;
    const value = document.getElementById('modal-cred-value').value;

    try {
        await apiCall('/credentials', 'POST', { key, value });
        showSuccessMessage('Credential added and encrypted!');
        closeAllModals();
        document.getElementById('modal-cred-key').value = '';
        document.getElementById('modal-cred-value').value = '';
        loadCredentials();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function deleteCredential(credId) {
    if (!confirm('Delete this credential?')) return;
    try {
        await apiCall(`/credentials/${credId}`, 'DELETE');
        showSuccessMessage('Credential deleted');
        loadCredentials();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function editCredential(credId) {
    alert('Edit functionality coming soon!');
}

// ============ NOTIFICATION METHODS TAB ============

async function loadNotificationMethods() {
    try {
        const methods = await apiCall('/notification-methods');
        const container = document.getElementById('notification-methods-list');

        if (!methods.length) {
            container.innerHTML = '<p>No notification methods available</p>';
            return;
        }

        container.innerHTML = methods.map(method => `
            <div class="method-card ${method.isEnabled ? 'enabled' : ''}">
                <div class="method-info">
                    <h3>${method.type}</h3>
                    <p>${method.isEnabled ? 'Enabled' : 'Disabled'}</p>
                </div>
                <label class="toggle-switch">
                    <input type="checkbox" ${method.isEnabled ? 'checked' : ''} 
                        onchange="toggleNotificationMethod('${method.id}', this.checked)">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading notification methods:', error);
    }
}

async function toggleNotificationMethod(methodId, isEnabled) {
    try {
        await apiCall(`/notification-methods/${methodId}`, 'PUT', { isEnabled });
        showSuccessMessage(`Notification method ${isEnabled ? 'enabled' : 'disabled'}`);
        loadNotificationMethods();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ============ TEST TAB ============

async function handleTestNotification(event) {
    event.preventDefault();
    const type = document.getElementById('test-type').value;
    const recipient = document.getElementById('test-recipient').value;
    const title = document.getElementById('test-title').value;
    const body = document.getElementById('test-body').value;

    try {
        const result = await apiCall('/test-notification', 'POST', { type, recipient, title, body });
        showSuccessMessage(`Test ${type} notification sent! Response time: ${result.responseTime}ms`);
        document.getElementById('test-type').value = '';
        document.getElementById('test-recipient').value = '';
        document.getElementById('test-title').value = '';
        document.getElementById('test-body').value = '';
        loadTestHistory();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

async function loadTestHistory() {
    try {
        const tests = await apiCall('/test-history');
        const tbody = document.getElementById('test-history-table');

        if (!tests.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No test history</td></tr>';
            return;
        }

        tbody.innerHTML = tests.map(test => `
            <tr>
                <td>${test.type}</td>
                <td>${test.recipient}</td>
                <td><span class="badge ${test.status === 'success' ? 'badge-success' : 'badge-danger'}">
                    ${test.status}
                </span></td>
                <td>${test.message}</td>
                <td>${new Date(test.createdAt).toLocaleString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading test history:', error);
    }
}

// ============ USERS TAB ============

async function loadUsers() {
    try {
        const users = await apiCall('/users');
        const tbody = document.getElementById('users-table');

        if (!users.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No users</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td><span class="badge badge-success">${user.role}</span></td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.id}')">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function deleteUser(userId) {
    if (!confirm('Delete this user?')) return;
    try {
        await apiCall(`/users/${userId}`, 'DELETE');
        showSuccessMessage('User deleted');
        loadUsers();
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

// ============ MODAL FUNCTIONS ============

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.classList.remove('active'));
    document.getElementById('modal-backdrop').classList.remove('active');
}

// ============ UTILITY FUNCTIONS ============

function showSuccessMessage(message) {
    const div = document.createElement('div');
    div.className = 'success-message';
    div.textContent = message;
    document.querySelector('main').prepend(div);
    setTimeout(() => div.remove(), 3000);
}

// ============ INITIALIZATION ============

document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
    }
});
