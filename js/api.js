/**
 * GOLDEN ERP SYSTEM - CENTRAL API BRIDGE & UTILITIES
 * File: js/api.js (SWR CACHING, BACKGROUND PREFETCH & FORMAL TONE)
 */

const API_WORKER_URL = "https://cashbook-api.goldeneduprivateschool.workers.dev/";

// 💡 Global AppState
window.AppState = window.AppState || {
  currentUser: localStorage.getItem('golden_user_name') || null,
  currentUserRole: localStorage.getItem('golden_user_role') || null,
  authToken: localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token') || null,
  currentModule: 'dashboard'
};

// 💡 Global In-Memory Cache Store for 0ms Instant Navigation
window.gDataCache = window.gDataCache || {};

/**
 * 💡 Cache Helper Functions
 */
window.getApiCache = function(cacheKey) {
  return window.gDataCache[cacheKey] || null;
};

window.setApiCache = function(cacheKey, data) {
  if (data && data.success) {
    window.gDataCache[cacheKey] = data;
  }
};

window.clearAllApiCache = function() {
  window.gDataCache = {};
};

window.invalidateApiCache = function(actionPrefix = '') {
  if (!actionPrefix) {
    window.clearAllApiCache();
    return;
  }
  Object.keys(window.gDataCache).forEach(key => {
    if (key.toLowerCase().includes(actionPrefix.toLowerCase())) {
      delete window.gDataCache[key];
    }
  });
};

/**
 * 💡 Storage ထဲမှ လတ်ဆတ်သော Token ကို ရယူပေးသည့် Helper
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
 * 💡 Central API Fetch Engine with In-Memory SWR Caching
 */
window.callApi = async function(action, payload = {}, method = 'POST') {
  try {
    const currentToken = getFreshAuthToken();
    const currentRole = localStorage.getItem('golden_user_role') || (window.AppState ? window.AppState.currentUserRole : '') || '';

    const isReadAction = action.startsWith('get') || action.startsWith('check');
    const isWriteAction = action.startsWith('save') || action.startsWith('update') || action.startsWith('delete') || action.startsWith('trigger') || action.startsWith('backup');
    const forceRefresh = payload.forceRefresh === true;

    // Remove forceRefresh property from payload sent to server
    const { forceRefresh: _, ...serverPayload } = payload;

    const cacheKey = `${action}_${JSON.stringify(serverPayload)}`;

    // 1. Check Cache for Read Actions (Instant 0ms Load)
    if (isReadAction && !forceRefresh) {
      const cachedRes = window.getApiCache(cacheKey);
      if (cachedRes) {
        return cachedRes;
      }
    }

    const headers = {
      'Content-Type': 'application/json'
    };

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
        ...serverPayload
      });
      url += `?${params.toString()}`;
    } else {
      options.body = JSON.stringify({
        action: action,
        token: currentToken,
        authToken: currentToken,
        role: currentRole,
        ...serverPayload
      });
    }

    const response = await fetch(url, options);

    // 💡 401 Unauthorized Handling
    if (response.status === 401) {
      console.warn(`[API 401] Unauthorized access for action: ${action}`);

      localStorage.removeItem('golden_auth_token');
      localStorage.removeItem('erp_token');
      localStorage.removeItem('golden_user_name');
      localStorage.removeItem('golden_user_role');

      if (window.AppState) {
        window.AppState.authToken = null;
        window.AppState.currentUser = null;
        window.AppState.currentUserRole = null;
      }

      window.clearAllApiCache();
      document.documentElement.className = 'dark not-authed';

      const loginErrBox = document.getElementById('login-error');
      if (loginErrBox) {
        loginErrBox.textContent = "Session သက်တမ်းကုန်ဆုံးသွားပါပြီ။ ပြန်လည် Login ဝင်ရောက်ပေးပါရန်။";
        loginErrBox.classList.remove('hidden');
      }

      throw new Error("HTTP Error: 401 (Session Expired)");
    }

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const result = await response.json();

    // 2. Cache successful Read Responses in Memory
    if (isReadAction && result && result.success) {
      window.setApiCache(cacheKey, result);
    }

    // 3. Clear Cache on Write Actions so next read fetches fresh data from Google Sheet
    if (isWriteAction && result && result.success) {
      window.clearAllApiCache();
    }

    return result;

  } catch (err) {
    console.error(`API Error [${action}]:`, err);

    if (!err.message || !err.message.includes("401")) {
      window.showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု မအောင်မြင်ပါ: " + err.message);
    }

    throw err;
  }
};

/**
 * 💡 Background Prefetching Engine (Login ပြီးသည်နှင့် အဓိက စာအုပ်များ၏ ဒေတာကို နောက်ကွယ်မှ ကြိုတင်ဆွဲယူမည်)
 */
window.prefetchCoreModules = function() {
  setTimeout(() => {
    window.callApi('getDashboardData', {}).catch(() => {});
    window.callApi('getBankCashData', { bookName: 'Bank Book' }).catch(() => {});
    window.callApi('getBankCashData', { bookName: 'Cash Book' }).catch(() => {});
    window.callApi('getIncomeData', { page: 1, limit: 30 }).catch(() => {});
    window.callApi('getStudentData', { page: 1, limit: 30 }).catch(() => {});
  }, 150);
};

/**
 * 💡 Global Toast Stack Notification Engine (Formal Enterprise Corporate Tone)
 */
window.showToast = function(type, message) {
  if (document.documentElement.classList.contains('not-authed') && type === 'ERROR') {
    return;
  }

  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  let msg = String(message || "").trim();
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
    msg = "⚠️ အင်တာနက်လိုင်း နှေးကွေး/ပြတ်တောက်နေသဖြင့် ဆာဗာသို့ ချိတ်ဆက်၍ မရပါ။";
  }

  const toast = document.createElement('div');
  toast.className = `p-4 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all transform translate-y-5 opacity-0 duration-300 pointer-events-auto bg-slate-900 border ${
    type === 'SUCCESS' ? 'border-emerald-500 text-emerald-400' : 'border-rose-500 text-rose-400'
  }`;

  const icon = type === 'SUCCESS' ? '<i class="fa-solid fa-circle-check text-base"></i>' : '<i class="fa-solid fa-circle-exclamation text-base"></i>';
  toast.innerHTML = `${icon} <span>${window.escapeHtml(msg)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => { toast.classList.remove('translate-y-5', 'opacity-0'); }, 10);
  setTimeout(() => {
    toast.classList.add('translate-y-5', 'opacity-0');
    setTimeout(() => { toast.remove(); }, 300);
  }, 4000);
};

window.escapeHtml = function(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

window.cleanNumber = function(val) {
  if (val === undefined || val === null || val === "") return 0;
  var strVal = String(val).trim();
  var isNegative = (strVal.includes("(") && strVal.includes(")")) || strVal.indexOf("-") === 0;
  var cleaned = strVal.replace(/[^\d.]/g, "");
  var num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return isNegative ? -num : num;
};
