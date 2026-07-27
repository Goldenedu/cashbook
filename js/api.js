/**
 * GOLDEN ERP SYSTEM - CENTRAL API BRIDGE & UTILITIES
 * File: js/api.js
 * 💡 SECURED: SWR In-Memory Caching, Background Prefetching (with Cashier Sync) & Formal Toast Engine
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
        loginErrBox.textContent = "Session သက်တမ်း ကုန်ဆုံးသွားပါပြီ။ ပြန်လည် Login ဝင်ရောက်ပါ။";
        loginErrBox.classList.remove('hidden');
      }

      throw new Error("HTTP Error: 401 (Session Expired)");
    }

    if (!response.ok) {
      // 💡 Try to read the JSON error body so the real server-side reason
      // (e.g. Google Drive/Sheets API failure detail) isn't swallowed and
      // shown only as a bare "HTTP Error: 500" in the console/toast.
      let serverMessage = '';
      try {
        const errData = await response.clone().json();
        serverMessage = errData && (errData.detail || errData.message) ? (errData.detail || errData.message) : '';
      } catch (parseErr) {
        // Response body wasn't JSON (or already consumed) — ignore and fall back.
      }
      throw new Error(`HTTP Error: ${response.status}${serverMessage ? ` - ${serverMessage}` : ''}`);
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
      window.showToast("ERROR", "ဆာဗာ ချိတ်ဆက်မှု မအောင်မြင်ပါ: " + err.message);
    }

    throw err;
  }
};

/**
 * 💡 Enterprise Background Prefetching Engine (0ms Instant Navigation)
 * Login ပြီးသည်နှင့် စာမျက်နှာ HTML Templates များနှင့် Modules အားလုံး၏ ဒေတာများကို နောက်ကွယ်မှ ကြိုတင်ဆွဲယူမည်
 */
window.prefetchCoreModules = function() {
  // 1. Prefetch View HTML Templates into window.viewCache
  window.viewCache = window.viewCache || {};
  const views = [
    'dashboard', 'bank-cash-kit', 'income', 'office', 'hr',
    'cashier', 'student', 'uniform', 'promotion', 'reports',
    'reports-fund', 'settings'
  ];

  views.forEach(v => {
    if (!window.viewCache[v]) {
      fetch(`views/${v}.html`)
        .then(r => r.ok ? r.text() : '')
        .then(html => { if (html) window.viewCache[v] = html; })
        .catch(() => {});
    }
  });

  // 2. Prefetch API Datasets silently into window.gDataCache
  setTimeout(() => {
    window.callApi('getDashboardData', {}).catch(() => {});
    window.callApi('getBankCashData', { bookName: 'Bank Book', page: 1, limit: 30, searchVal: '' }).catch(() => {});
    window.callApi('getBankCashData', { bookName: 'Cash Book', page: 1, limit: 30, searchVal: '' }).catch(() => {});
    window.callApi('getIncomeData', { page: 1, limit: 50, searchVal: '' }).catch(() => {});
    window.callApi('getExpenseData', { bookName: 'Office Exp Book', page: 1, limit: 30, searchVal: '' }).catch(() => {});
    window.callApi('getExpenseData', { bookName: 'Kitchen Exp Book', page: 1, limit: 30, searchVal: '' }).catch(() => {});
    window.callApi('getExpenseData', { bookName: 'HR Payroll Exp Book', page: 1, limit: 30, searchVal: '' }).catch(() => {});
    window.callApi('getCashierData', { bookName: 'CACash' }).catch(() => {});
    window.callApi('getCashierData', { bookName: 'CABank' }).catch(() => {});
    window.callApi('getTodayIncomeForCashier', {}).catch(() => {});
    window.callApi('getStudentData', { page: 1, limit: 50 }).catch(() => {});
    window.callApi('getStaffData', { category: 'FullTime', page: 1, limit: 30, searchVal: '' }).catch(() => {});
    window.callApi('getUniformData', { page: 1, limit: 1000 }).catch(() => {});
    window.callApi('getPromotionData', {}).catch(() => {});
    window.callApi('getFinancialReportData', {}).catch(() => {});
    window.callApi('getFundReportData', {}).catch(() => {});
    window.callApi('getSettingsData', {}).catch(() => {});
  }, 100);
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

/**
 * 💡 Utility Functions
 */
window.escapeHtml = function(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

window.cleanNumber = function(val) {
  if (val === undefined || val === null || val === "") return 0;
  var strVal = String(val).trim();
  var isNegative = (strVal.includes("(") && strVal.includes(")")) || strVal.indexOf("-") === 0;
  var cleaned = strVal.replace(/[^0-9.]/g, "");
  var num = parseFloat(cleaned);
  if (isNaN(num)) return 0;
  return isNegative ? -num : num;
};

window.parseIsoDate = function(dStr) {
  if (!dStr) return null;
  var str = String(dStr).trim();
  if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(str)) {
    var parts = str.split(/[-/]/);
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(str)) {
    var parts2 = str.split(/[-/]/);
    return new Date(parseInt(parts2[2], 10), parseInt(parts2[1], 10) - 1, parseInt(parts2[0], 10));
  }
  var d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
};

window.isDateInRange = function(rowDateStr, fromDateStr, toDateStr) {
  if (!fromDateStr && !toDateStr) return true;
  if (!rowDateStr) return false;

  var rowDate = window.parseIsoDate(rowDateStr);
  if (!rowDate) return true;

  if (fromDateStr) {
    var fromDate = new Date(fromDateStr + 'T00:00:00');
    if (rowDate < fromDate) return false;
  }
  if (toDateStr) {
    var toDate = new Date(toDateStr + 'T23:59:59');
    if (rowDate > toDate) return false;
  }
  return true;
};
