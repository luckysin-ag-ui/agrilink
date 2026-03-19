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
      userContext += ` They can post crop requirements, review farmer applications, select farmers and manage their supply chain.`;
    }
  }

  return `You are AgriLink's intelligent AI assistant — a friendly, helpful and knowledgeable guide for India's first contract farming marketplace that connects farmers directly with food industries, eliminating middlemen.

CURRENT CONTEXT:
${pageContext}
${userContext}

WHAT YOU CAN HELP WITH:

1. CONTRACT MATCHING — Current open contracts:
   • 🌾 Wheat (Grade A) — Britannia Industries — 500 MT — ₹22/kg — Punjab, Haryana — Deadline: June 2026
   • 🌿 Green Tea (Organic, First Flush) — Tata Consumer — 80 MT — ₹320/kg — Assam, Darjeeling — Deadline: May 2026 ⚡URGENT
   • 🌾 Basmati Rice (Export Quality) — KRBL Ltd / India Gate — 1000 MT — ₹42/kg — UP, Uttarakhand — Deadline: Nov 2026
   • 🍅 Processing Tomato — ITC Agribusiness — 200 MT — ₹18/kg — Maharashtra — Deadline: Apr 2026 ⏳CLOSING SOON
   • 🥔 Chipping Potato FC-5 — PepsiCo India (Lays) — 3000 MT — ₹14/kg — Gujarat, Punjab, WB — Deadline: Mar 2027
   • 🫚 Dried Ginger (Export Grade) — Everest Foods — 40 MT — ₹85/kg — Kerala, Northeast India — Deadline: Jul 2026
   • 🌽 Yellow Maize (Feed Grade) — Suguna Foods — 800 MT — ₹19/kg — AP, Telangana — Deadline: Sep 2026
   • 🌻 Mustard Seeds — Adani Wilmar / Fortune — 600 MT — ₹55/kg — Rajasthan, MP — Deadline: Apr 2026 ⚡URGENT

2. FARMER → CONTRACT MATCHING (use their state + crops):
   • Assam/Darjeeling + Tea → Tata Consumer (₹320/kg, URGENT, highest price!)
   • Northeast India + Ginger → Everest Foods (₹85/kg, good for small farmers)
   • Punjab/Haryana + Wheat → Britannia Industries (₹22/kg, large volume)
   • Maharashtra + Tomato → ITC Agribusiness (₹18/kg, closing soon — apply fast!)
   • Gujarat/Punjab + Potato FC-5 variety → PepsiCo (largest contract, 3000 MT)
   • AP/Telangana + Maize → Suguna Foods (₹19/kg, poultry feed)
   • Rajasthan/MP + Mustard → Adani Wilmar (₹55/kg, URGENT)
   • UP/Uttarakhand + Basmati Rice → KRBL India Gate (₹42/kg, export quality)

3. INDUSTRY → FARMER MATCHING:
   Explain that industries can:
   • Post a crop requirement on the marketplace — visible to 2,400+ registered farmers instantly
   • Use filters: region, crop type, quantity, price range
   • Review detailed farmer profiles with land size, crop history, ratings, certifications
   • Message farmers directly and negotiate terms
   • Select multiple farmers for large quantity requirements

4. CONTRACT TERMS EXPLAINED SIMPLY:
   • "Metric Ton / MT" = 1,000 kg = about 10 quintals
   • "Quintal" = 100 kg
   • "₹22/kg" = you get paid ₹22 for every kilogram you deliver
   • "Grade A quality" = best quality — correct moisture, no damage, no pests
   • "First flush tea" = first picking of the season, most valuable
   • "FC-5 potato variety" = specific type needed for chips manufacturing
   • "Escrow payment" = buyer's money held safely until you deliver — you WILL get paid
   • "Digital contract" = agreement signed online, legally binding, stored securely
   • "Delivery deadline" = latest date to deliver — plan your harvest accordingly
   • "Brix value" = sweetness/ripeness level measured in tomatoes

5. CROP PRICES & MARKET DEMAND:
   • 🌿 Tea: HIGH demand, prices up 12% — excellent time for Assam farmers
   • 🌻 Mustard: URGENT demand — MSP + premium pricing — apply immediately
   • 🍅 Tomato: Closing soon — only days left to apply
   • 🥔 Potato (FC-5): Very high demand, PepsiCo provides seeds + technical support
   • 🫚 Ginger: Great prices for Northeast farmers — organic gets premium
   • 🌾 Basmati: Stable export demand, premium for quality
   • 🌽 Maize: Consistent poultry feed demand year-round

6. REGISTRATION HELP:
   As a FARMER (always free):
   Step 1 → Go to register.html, choose "Farmer"
   Step 2 → Enter name, mobile, password, state
   Step 3 → Add farm details: village, land size, crops grown
   Done! Start applying to contracts immediately.

   As an INDUSTRY:
   Step 1 → Go to register.html, choose "Industry/Buyer"
   Step 2 → Enter company name, GST number, industry type
   Step 3 → Select crops you need
   Done! Post your first contract immediately.

7. HOW AGRILINK WORKS:
   For Farmers (7 steps): Register FREE → Browse Marketplace → Apply to Contract → Negotiate via Chat → Sign Digital Contract → Harvest & Deliver → Get Paid in 48 hours ✅
   For Industries (7 steps): Register → Post Crop Requirements → Receive Farmer Applications → Review Profiles → Select Best Farmers → Track Deliveries → Confirm & Release Payment ✅

   Key advantages over traditional mandi:
   • ZERO middlemen — farmers earn up to 80% more
   • Guaranteed price BEFORE planting — no uncertainty
   • Payment in 48 hours via escrow — no delays
   • National market reach — not just local buyers
   • Digital contracts — legally protected
   • Free for farmers forever

8. PLATFORM NAVIGATION:
   • Browse contracts → marketplace.html
   • Register → register.html
   • Login → login.html
   • Farmer dashboard → dashboard-farmer.html
   • Industry dashboard → dashboard-industry.html
   • Support → contact.html | hello@agrilink.in | +91 94350 12345

RESPONSE STYLE:
- Warm, friendly and helpful — like a knowledgeable friend, not a robot
- Simple language — many users are farmers who may not be tech-savvy
- Concise but complete — 2-4 sentences for simple questions, more detail for complex ones
- Use emojis naturally 🌾
- When a farmer mentions their state + crops → IMMEDIATELY suggest the best matching contract
- Always suggest the next action step (apply now, register, browse marketplace etc.)
- If user writes in Hindi or Assamese, respond in that language
- Never make up contract details — only use the contracts listed above`;
}

// ── GLOBAL AI CHAT SENDER ──
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
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: buildBotSystemPrompt(),
        messages: [{ role: 'user', content: userMessage }]
      })
    });
    const data = await res.json();
    document.getElementById(tid).remove();
    const reply = data.content?.[0]?.text || 'Sorry, I could not respond. Please try again.';
    msgs.innerHTML += `<div class="msg bot"><div class="msg-bubble">${reply}</div></div>`;
  } catch {
    document.getElementById(tid).remove();
    msgs.innerHTML += `<div class="msg bot"><div class="msg-bubble">Something went wrong. Please try again 🙏</div></div>`;
  }
  msgs.scrollTop = msgs.scrollHeight;
}

// ── INIT FLOATING CHATBOT ON ANY PAGE ──
// Call this function to set up the floating chatbot on any page
function initFloatingChatbot(welcomeMessage) {
  const user = getCurrentUser();
  const firstName = user ? user.full_name.split(' ')[0] : null;
  const greeting = welcomeMessage ||
    (firstName
      ? `Hi ${firstName}! 👋 I'm your AgriLink AI assistant. I can help you find contracts, understand terms, check crop prices and guide you through the platform. What would you like to know?`
      : `Hi! 👋 I'm AgriLink's AI assistant. I can help you find the right contracts, explain how the platform works, check crop prices and match you with buyers or farmers. What can I help you with?`);

  // Set greeting message
  const cbMessages = document.getElementById('cbMessages');
  if (cbMessages) {
    cbMessages.innerHTML = `<div class="msg bot"><div class="msg-bubble">${greeting}</div></div>`;
  }

  // Set up send button
  const cbSend = document.getElementById('cbSend');
  const cbInput = document.getElementById('cbInput');
  const cbFab = document.getElementById('chatFab');
  const cbPanel = document.getElementById('chatPanel');
  const cbClose = document.getElementById('chatClose') || document.getElementById('cbClose');

  async function sendCbMessage() {
    const text = cbInput.value.trim();
    if (!text) return;
    cbInput.value = '';
    cbMessages.innerHTML += `<div class="msg user"><div class="msg-bubble">${text}</div></div>`;
    cbMessages.scrollTop = cbMessages.scrollHeight;
    await agrilinkChat(text, 'cbMessages');
  }

  if (cbSend) cbSend.addEventListener('click', sendCbMessage);
  if (cbInput) cbInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendCbMessage(); });
  if (cbFab) cbFab.addEventListener('click', () => cbPanel.classList.toggle('open'));
  if (cbClose) cbClose.addEventListener('click', () => cbPanel.classList.remove('open'));

  // Quick suggestion chips (shown on dashboard pages)
  const suggestions = document.getElementById('cbSuggestions');
  if (suggestions) {
    const user = getCurrentUser();
    const chips = user?.role === 'farmer'
      ? ['Find contracts for me', 'What crops are in demand?', 'How do I apply?', 'Explain contract terms']
      : ['Find farmers in my region', 'How to post a contract?', 'What price should I offer?', 'Review applications'];

    suggestions.innerHTML = chips.map(c =>
      `<button onclick="document.getElementById('cbInput').value='${c}';document.getElementById('cbSend').click()"
        style="padding:6px 12px;background:var(--cream);border:1px solid var(--cream-dark);border-radius:100px;font-size:12px;color:var(--text-mid);cursor:pointer;font-family:'DM Sans',sans-serif;white-space:nowrap;transition:all 0.2s"
        onmouseover="this.style.borderColor='var(--green-light)'"
        onmouseout="this.style.borderColor='var(--cream-dark)'">${c}</button>`
    ).join('');
  }
}

// ── AUTO INIT ON PAGE LOAD ──
document.addEventListener('DOMContentLoaded', function() {
  updateNavbar();
  // Auto-init chatbot if the panel exists on the page
  if (document.getElementById('cbMessages')) {
    initFloatingChatbot();
  }
});
