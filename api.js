// ── AgriLink API Connector ──
// This file connects your frontend to your live backend
// Include this in every HTML page with:
// <script src="api.js"></script>

const API_URL = 'https://agrilink-backend-h53g.onrender.com';

// ── HELPER: Make API calls ──
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  const token = localStorage.getItem('agrilink_token');
  if (token) options.headers['Authorization'] = `Bearer ${token}`;
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(API_URL + endpoint, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// ── AUTH ──
async function registerUser(userData) {
  const data = await apiCall('/api/register', 'POST', userData);
  localStorage.setItem('agrilink_token', data.token);
  localStorage.setItem('agrilink_user', JSON.stringify(data.user));
  return data;
}

async function loginUser(mobile, password) {
  const data = await apiCall('/api/login', 'POST', { mobile, password });
  localStorage.setItem('agrilink_token', data.token);
  localStorage.setItem('agrilink_user', JSON.stringify(data.user));
  return data;
}

function logoutUser() {
  localStorage.removeItem('agrilink_token');
  localStorage.removeItem('agrilink_user');
  window.location.href = 'login.html';
}

function getCurrentUser() {
  const user = localStorage.getItem('agrilink_user');
  return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
  return !!localStorage.getItem('agrilink_token');
}

// ── CONTRACTS ──
async function getContracts() {
  return await apiCall('/api/contracts');
}

async function postContract(contractData) {
  return await apiCall('/api/contracts', 'POST', contractData);
}

// ── APPLICATIONS ──
async function applyToContract(applicationData) {
  return await apiCall('/api/applications', 'POST', applicationData);
}

async function getApplications(contractId) {
  return await apiCall(`/api/applications/${contractId}`);
}

async function updateApplication(applicationId, status) {
  return await apiCall(`/api/applications/${applicationId}`, 'PATCH', { status });
}

// ── MESSAGES ──
async function sendMessage(messageData) {
  return await apiCall('/api/messages', 'POST', messageData);
}

async function getMessages(user1, user2) {
  return await apiCall(`/api/messages/${user1}/${user2}`);
}

// ── UI HELPERS ──
// Show logged in user name in navbar
function updateNavbar() {
  const user = getCurrentUser();
  if (user) {
    const navCta = document.querySelector('.nav-cta');
    if (navCta) {
      navCta.innerHTML = `
        <span style="font-size:14px;color:var(--text-mid)">👋 ${user.full_name}</span>
        <a href="${user.role === 'farmer' ? 'dashboard-farmer.html' : 'dashboard-industry.html'}"
           style="padding:9px 22px;border:none;border-radius:8px;background:var(--green-mid);color:white;font-size:14px;font-weight:500;cursor:pointer;text-decoration:none;">
           Dashboard
        </a>
        <button onclick="logoutUser()"
           style="padding:9px 22px;border:1.5px solid var(--green-mid);border-radius:8px;background:transparent;color:var(--green-mid);font-size:14px;font-weight:500;cursor:pointer;font-family:'DM Sans',sans-serif;">
           Logout
        </button>
      `;
    }
  }
}

// Auto update navbar on page load
document.addEventListener('DOMContentLoaded', updateNavbar);
