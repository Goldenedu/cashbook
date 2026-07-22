/**
 * GOLDEN ERP SYSTEM - CENTRAL API BRIDGE & UTILITIES
 * File: js/api.js
 */

const API_WORKER_URL = "https://cashbook-api.goldeneduprivateschool.workers.dev/";

window.AppState = {
  currentUser: localStorage.getItem('golden_user_name') || null,
  currentUserRole: localStorage.getItem('golden_user_role') || null,
  authToken: localStorage.getItem('golden_auth_token') || null,
  currentModule: 'dashboard'
};

/**
 * 💡 Central API Fetch Engine (Cloudflare Worker သို့ စာရင်းများ ပို့ပေးသည့် စနစ်)
 */
async function callApi(action, payload = {}, method = 'POST') {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${window.AppState.authToken || ''}`
    };

    const options = { method: method, headers: headers };
    let url = API_WORKER_URL;

    if (method === 'GET') {
      const params = new URLSearchParams({ action: action, ...payload });
      url += `?${params.toString()}`;
    } else {
      options.body = JSON.stringify({
        action: action,
        role: window.AppState.currentUserRole,
        authToken: window.AppState.authToken,
        ...payload
      });
    }

    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error(`API Error [${action}]:`, err);
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု မအောင်မြင်ပါ: " + err.message);
    throw err;
  }
}

function showToast(type, message) {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;

  let msg = String(message || "").trim();
  if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
    msg = "⚠️ အင်တာနက်လိုင်း နှေးကွေး/ပြတ်တောက်နေသဖြင့် ဆာဗာသို့ ချိတ်ဆက်၍ မရပါရှင်။";
  }

  const toast = document.createElement('div');
  toast.className = `p-4 rounded-xl shadow-2xl flex items-center gap-3 text-xs font-bold transition-all transform translate-y-5 opacity-0 duration-300 pointer-events-auto bg-slate-900 border ${type === 'SUCCESS' ? 'border-emerald-500 text-emerald-400' : 'border-rose-500 text-rose-400'
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

function toggleLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    if (show) overlay.classList.remove('hidden');
    else overlay.classList.add('hidden');
  }
}