/**
 * GOLDEN ERP SYSTEM - CENTRAL API BRIDGE & UTILITIES
 * File: js/api.js
 */

const API_WORKER_URL = "https://cashbook-api.goldeneduprivateschool.workers.dev/";

// 💡 Global AppState (LocalStorage ဖြင့် အမြဲတမ်း Sync ပြုလုပ်ထားပါသည်)
window.AppState = window.AppState || {
  currentUser: localStorage.getItem('golden_user_name') || null,
  currentUserRole: localStorage.getItem('golden_user_role') || null,
  authToken: localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token') || null,
  currentModule: 'dashboard'
};

/**
 * 💡 Storage ထဲမှ လတ်ဆတ်သော Token ကို အမြဲတမ်း ဆွဲယူပေးမည့် Helper Function
 */
function getFreshAuthToken() {
  const token = localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token') || (window.AppState ? window.AppState.authToken : null) || '';
  if (window.AppState) window.AppState.authToken = token;
  return token;
}

/**
 * 💡 Global Loading Spinner Indicator Helper
 */
window.toggleLoading = function(show) {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    if (show) overlay.classList.remove('hidden');
    else overlay.classList.add('hidden');
  }
};

/**
 * 💡 Central API Fetch Engine (Phase 3 Security & 401 Redirect Handled)
 */
async function callApi(action, payload = {}, method = 'POST') {
  try {
    const currentToken = getFreshAuthToken();
    const currentRole = localStorage.getItem('golden_user_role') || (window.AppState ? window.AppState.currentUserRole : '') || '';

    const headers = {
      'Content-Type': 'application/json'
    };

    // 💡 Header တွင် Authorization Bearer Token အမြဲထည့်သွင်းခြင်း
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    const options = { method: method, headers: headers };
    let url = API_WORKER_URL;

    if (method === 'GET') {
      const params = new URLSearchParams({
        action: action,
        token: currentToken,
        role: currentRole,
        ...payload
      });
      url += `?${params.toString()}`;
    } else {
      options.body = JSON.stringify({
        action: action,
        token: currentToken,
        authToken: currentToken,
        role: currentRole,
        ...payload
      });
    }

    const response = await fetch(url, options);

    // 💡 HTTP 401 (Session Expired / Token မမှန်ပါက) Login သို့ ယဉ်ကျေးစွာ ပြန်ညွှန်းခြင်း
    if (response.status === 401) {
      console.warn(`[API 401] Session expired or unauthorized for action: ${action}`);

      // Token အဟောင်းများကို ရှင်းထုတ်ခြင်း
      localStorage.removeItem('golden_auth_token');
      localStorage.removeItem('erp_token');
      localStorage.removeItem('golden_user_name');
      localStorage.removeItem('golden_user_role');

      if (window.AppState) {
        window.AppState.authToken = null;
        window.AppState.currentUser = null;
        window.AppState.currentUserRole = null;
      }

      // Login Overlay သို့ ချက်ချင်း ပြောင်းလဲခြင်း
      document.documentElement.className = 'dark not-authed';

      const loginErrBox = document.getElementById('login-error');
      if (loginErrBox) {
        loginErrBox.textContent = "Session သက်တမ်းကုန်သွားပါပြီ။ ပြန်လည် Login ဝင်ရောက်ပေးပါရှင်။";
        loginErrBox.classList.remove('hidden');
      }

      throw new Error("HTTP Error: 401 (Session Expired)");
    }

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();
    return result;

  } catch (err) {
    console.error(`API Error [${action}]:`, err);

    // 💡 401 Error မဟုတ်မှသာ Error Toast ပေါ်စေမည် (Toast ပလူပျံ မတက်စေရန်)
    if (!err.message || !err.message.includes("401")) {
      showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု မအောင်မြင်ပါ: " + err.message);
    }

    throw err;
  }
}

/**
 * 💡 Global Toast Stack Notification Engine
 */
function showToast(type, message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  let msg = String(message || "").trim();
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
    msg = "⚠️ အင်တာနက်လိုင်း နှေးကွေး/ပြတ်တောက်နေသဖြင့် ဆာဗာသို့ ချိတ်ဆက်၍ မရပါရှင်။";
  }

  const toast = document.createElement('div');
  toast.className = `p-4 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all transform translate-y-5 opacity-0 duration-300 pointer-events-auto bg-slate-900 border ${
    type === 'SUCCESS' ? 'border-emerald-500 text-emerald-400' : 'border-rose-500 text-rose-400'
  }`;

  const icon = type === 'SUCCESS' ? '<i class="fa-solid fa-circle-check text-base"></i>' : '<i class="fa-solid fa-circle-exclamation text-base"></i>';
  toast.innerHTML = `${icon} <span>${escapeHtml(msg)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => { toast.classList.remove('translate-y-5', 'opacity-0'); }, 10);
  setTimeout(() => {
    toast.classList.add('translate-y-5', 'opacity-0');
    setTimeout(() => { toast.remove(); }, 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function cleanNumber(val) {
  if (val === undefined || val === null || val === "") return 0;
  var strVal = String(val).trim();
  var isNegative = (strVal.includes("(") && strVal.includes(")")) || strVal.indexOf("-") === 0;
  var cleaned = strVal.replace(/[^\d.]/g, "");
  var num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return isNegative ? -num : num;
}
