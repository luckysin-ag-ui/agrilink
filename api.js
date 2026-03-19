// ── AgriLink API Connector + Smart AI Bot ──
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
  localStorage.setItem('agrilink_user', JSON.stringify({...data.user, mobile: userData.mobile}));
  return data;
}

async function loginUser(mobile, password) {
  const data = await apiCall('/api/login', 'POST', { mobile, password });
  localStorage.setItem('agrilink_token', data.token);
  localStorage.setItem('agrilink_user', JSON.stringify({...data.user, mobile}));
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

// ── NAVBAR UPDATE ──
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

// ── SMART AI BOT SYSTEM PROMPT ──
function buildBotSystemPrompt() {
  const user = getCurrentUser();
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  const pageContextMap = {
    'index.html': 'The user is on the AgriLink Home page.',
    'marketplace.html': 'The user is on the Contract Marketplace page browsing available contracts.',
    'register.html': 'The user is on the Registration page and may need help signing up.',
    'login.html': 'The user is on the Login page.',
    'dashboard-farmer.html': 'The user is on their Farmer Dashboard.',
    'dashboard-industry.html': 'The user is on their Industry Dashboard.',
    'how-it-works.html': 'The user is on the How It Works page.',
    'about.html': 'The user is on the About Us page.',
    'contact.html': 'The user is on the Contact page.',
  };
  const pageContext = pageContextMap[currentPage] || 'The user is browsing AgriLink.';

  let userContext = 'The user is not logged in yet.';
  if (user) {
    userContext = `The logged-in user is ${user.full_name}, a ${user.role} from ${user.state || 'India'}.`;
    if (user.role === 'farmer') {
      userContext += ` They can browse contracts, apply to supply crops, track deliveries and message buyers.`;
    } else {
      userContext += ` They can post crop requirements, review farmer applications, select farmers and manage supply chain.`;
    }
  }

  return `You are AgriLink's intelligent AI assistant — a friendly, helpful guide for India's first contract farming marketplace connecting farmers directly with food industries, eliminating middlemen.

CURRENT CONTEXT:
${pageContext}
${userContext}

WHAT YOU CAN HELP WITH:

1. CONTRACT MATCHING — Current open contracts:
   • 🌾 Wheat (Grade A) — Britannia Industries — 500 MT — ₹22/kg — Punjab, Haryana — Deadline: June 2026
   • 🌿 Green Tea (Organic) — Tata Consumer — 80 MT — ₹320/kg — Assam, Darjeeling — Deadline: May 2026 ⚡URGENT
   • 🌾 Basmati Rice — KRBL Ltd (India Gate) — 1000 MT — ₹42/kg — UP, Uttarakhand — Deadline: Nov 2026
   • 🍅 Processing Tomato — ITC Agribusiness — 200 MT — ₹18/kg — Maharashtra — Deadline: Apr 2026 ⏳CLOSING SOON
   • 🥔 Chipping Potato FC-5 — PepsiCo India — 3000 MT — ₹14/kg — Gujarat, Punjab — Deadline: Mar 2027
   • 🫚 Dried Ginger — Everest Foods — 40 MT — ₹85/kg — Kerala, Northeast India — Deadline: Jul 2026
   • 🌽 Yellow Maize — Suguna Foods — 800 MT — ₹19/kg — AP, Telangana — Deadline: Sep 2026
   • 🌻 Mustard Seeds — Adani Wilmar — 600 MT — ₹55/kg — Rajasthan, MP — Deadline: Apr 2026 ⚡URGENT

2. FARMER → CONTRACT MATCHING (match state + crops):
   • Assam/Darjeeling + Tea → Tata Consumer (₹320/kg, URGENT!)
   • Northeast India + Ginger → Everest Foods (₹85/kg)
   • Punjab/Haryana + Wheat → Britannia (₹22/kg)
   • Maharashtra + Tomato → ITC Agribusiness (₹18/kg, closing soon!)
   • Gujarat/Punjab + Potato FC-5 → PepsiCo (largest contract!)
   • AP/Telangana + Maize → Suguna Foods (₹19/kg)
   • Rajasthan/MP + Mustard → Adani Wilmar (₹55/kg, URGENT!)
   • UP/Uttarakhand + Basmati → KRBL India Gate (₹42/kg)

3. CONTRACT TERMS EXPLAINED SIMPLY:
   • MT / Metric Ton = 1,000 kg
   • Quintal = 100 kg
   • Price per kg = amount paid per kilogram delivered
   • Grade A = highest quality, correct moisture, no damage
   • Escrow payment = money held safely, released after delivery
   • Digital contract = legally binding agreement signed online
   • First flush tea = first harvest of season, most valuable
   • FC-5 potato = specific variety needed for chips

4. CROP MARKET DEMAND:
   • 🌿 Tea: HIGH demand, prices up 12% — great for Assam farmers
   • 🌻 Mustard: URGENT demand, MSP + premium pricing
   • 🍅 Tomato: Closing soon — apply immediately!
   • 🥔 Potato FC-5: Very high demand, PepsiCo gives seeds + support
   • 🫚 Ginger: Great prices for Northeast farmers
   • 🌾 Basmati: Stable export demand, premium for quality
   • 🌽 Maize: Consistent year-round demand

5. REGISTRATION HELP:
   Farmer (always FREE):
   → register.html → choose Farmer → name, mobile, password, state → farm details → done!

   Industry:
   → register.html → choose Industry → company name, GST, type → crops needed → done!

6. HOW IT WORKS:
   Farmers: Register → Browse → Apply → Negotiate → Sign → Deliver → Paid in 48hrs ✅
   Industries: Register → Post → Review Applications → Select → Track → Confirm Payment ✅

   Key benefits: Zero middlemen, guaranteed price before planting, payment in 48hrs, free for farmers forever.

7. NAVIGATION HELP:
   • Browse contracts → marketplace.html
   • Register → register.html
   • Login → login.html
   • Support → hello@agrilink.in | +91 94350 12345

RESPONSE STYLE:
- Warm and friendly like a knowledgeable friend
- Simple language — many users are farmers
- Keep responses short but helpful — 2-4 sentences for simple questions
- Use emojis naturally 🌾
- When farmer mentions state + crops → suggest matching contract immediately
- Always suggest the next action step
- If user writes in Hindi or Assamese, respond in that language too`;
}

// ── SEND MESSAGE TO AI VIA BACKEND ──
async function agrilinkChat(userMessage, messagesContainerId) {
  const msgs = document.getElementById(messagesContainerId);
  if (!msgs) return;

  const tid = 'msg_' + Date.now();
  msgs.innerHTML += `
    <div class="msg bot" id="${tid}">
      <div class="msg-bubble">
        <div class="typing"><span></span><span></span><span></span></div>
      </div>
    </div>`;
  msgs.scrollTop = msgs.scrollHeight;

  try {
    // Call YOUR backend which calls Groq — no CORS issues!
    const res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        system: buildBotSystemPrompt()
      })
    });
    const data = await res.json();
    document.getElementById(tid).remove();
    const reply = data.reply || 'Sorry, I could not get a response. Please try again.';
    msgs.innerHTML += `<div class="msg bot"><div class="msg-bubble">${reply}</div></div>`;
  } catch {
    document.getElementById(tid).remove();
    msgs.innerHTML += `<div class="msg bot"><div class="msg-bubble">Sorry, something went wrong. Please try again 🙏</div></div>`;
  }
  msgs.scrollTop = msgs.scrollHeight;
}

// ── INIT FLOATING CHATBOT ──
function initFloatingChatbot() {
  const user = getCurrentUser();
  const firstName = user ? user.full_name.split(' ')[0] : null;
  const greeting = firstName
    ? `Hi ${firstName}! 👋 I'm your AgriLink AI assistant. I can help you find contracts, check crop prices, explain terms and guide you through the platform. What would you like to know?`
    : `Hi! 👋 I'm AgriLink's AI assistant. I can help you find contracts, explain how the platform works, match you with buyers or farmers, and answer any questions. What can I help with?`;

  const cbMessages = document.getElementById('cbMessages');
  if (cbMessages) {
    cbMessages.innerHTML = `<div class="msg bot"><div class="msg-bubble">${greeting}</div></div>`;
  }

  async function sendCbMessage() {
    const cbInput = document.getElementById('cbInput');
    const text = cbInput.value.trim();
    if (!text) return;
    cbInput.value = '';
    cbMessages.innerHTML += `<div class="msg user"><div class="msg-bubble">${text}</div></div>`;
    cbMessages.scrollTop = cbMessages.scrollHeight;
    await agrilinkChat(text, 'cbMessages');
  }

  const cbSend = document.getElementById('cbSend');
  const cbInput = document.getElementById('cbInput');
  const cbFab = document.getElementById('chatFab') || document.getElementById('cbFab');
  const cbPanel = document.getElementById('chatPanel') || document.getElementById('cbPanel');
  const cbClose = document.getElementById('chatClose') || document.getElementById('cbClose');

  if (cbSend) cbSend.onclick = sendCbMessage;
  if (cbInput) {
    cbInput.onkeydown = e => { if (e.key === 'Enter') sendCbMessage(); };
  }
  if (cbFab && cbPanel) cbFab.onclick = () => cbPanel.classList.toggle('open');
  if (cbClose && cbPanel) cbClose.onclick = () => cbPanel.classList.remove('open');
}

// ── AUTO INIT ON PAGE LOAD ──
document.addEventListener('DOMContentLoaded', function() {
  updateNavbar();
  // Auto-init chatbot if panel exists on the page
  if (document.getElementById('cbMessages')) {
    initFloatingChatbot();
  }
});
