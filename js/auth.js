/**
 * GOLDEN ERP SYSTEM - AUTHENTICATION & ROLE ENGINE
 * File: js/auth.js
 */

async function handleLoginSubmit(e) {
  e.preventDefault();
  const usernameSelect = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const errorBox = document.getElementById('login-error');

  if (!usernameSelect || !passwordInput) return;

  const username = usernameSelect.value;
  const password = passwordInput.value;

  if (errorBox) errorBox.classList.add('hidden');
  if (typeof window.toggleLoading === 'function') window.toggleLoading(true);

  try {
    const response = await callApi('checkLogin', { username, password });
    if (typeof window.toggleLoading === 'function') window.toggleLoading(false);

    if (response && response.success) {
      window.AppState = window.AppState || {};
      window.AppState.currentUser = response.username;
      window.AppState.currentUserRole = response.role;
      window.AppState.authToken = response.token;

      localStorage.setItem('golden_user_name', response.username);
      localStorage.setItem('golden_user_role', response.role);
      localStorage.setItem('golden_auth_token', response.token);
      localStorage.setItem('erp_token', response.token);
      localStorage.setItem('erp_role', response.role);

      showWorkspace();
      applyRoleRestrictions();

      if (typeof switchTab === 'function') {
        switchTab('dashboard');
      }
      showToast("SUCCESS", "လော့ဂ်အင်ဝင်ရောက်မှု အောင်မြင်ပါသည်။");
    } else {
      if (errorBox) {
        errorBox.innerText = (response ? response.message : "") || "အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။";
        errorBox.classList.remove('hidden');
      }
    }
  } catch (err) {
    if (typeof window.toggleLoading === 'function') window.toggleLoading(false);
    if (errorBox) {
      errorBox.innerText = "ဆာဗာစနစ်တွင်း အမှားဖြစ်ပေါ်ခဲ့သည်- " + err.message;
      errorBox.classList.remove('hidden');
    }
  }
}

function applyRoleRestrictions() {
  if (!window.AppState) return;
  const role = window.AppState.currentUserRole;
  const hrSection = document.getElementById('nav-hr-section');
  const settingsSection = document.getElementById('nav-settings-section');

  if (role === "Cashier" || role === "Main Cashier") {
    if (hrSection) hrSection.classList.add('hidden');
    if (settingsSection) settingsSection.classList.add('hidden');
  } else {
    if (hrSection) hrSection.classList.remove('hidden');
    if (settingsSection) settingsSection.classList.remove('hidden');
  }
}

function showWorkspace() {
  document.documentElement.className = 'dark is-authed';

  const overlay = document.getElementById('login-overlay');
  const ws = document.getElementById('erp-workspace');

  if (overlay) {
    overlay.classList.add('hidden');
    overlay.style.display = 'none';
  }
  if (ws) {
    ws.classList.remove('hidden');
    ws.style.display = 'flex';
  }
}

function showLogin() {
  document.documentElement.className = 'dark not-authed';

  const overlay = document.getElementById('login-overlay');
  const ws = document.getElementById('erp-workspace');

  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
  }
  if (ws) {
    ws.classList.add('hidden');
    ws.style.display = 'none';
  }

  const passwordInput = document.getElementById('login-password');
  if (passwordInput) passwordInput.value = '';
}

/**
 * 💡 BULLETPROOF LOGOUT (Token များ ရှင်းထုတ်ပြီး Page ပါ Auto Reload ပြုလုပ်ပေးမည်)
 */
function handleLogout() {
  if (confirm("စနစ်မှ ထွက်ခွာလိုပါသလားရှင်?")) {
    localStorage.removeItem('golden_user_name');
    localStorage.removeItem('golden_user_role');
    localStorage.removeItem('golden_auth_token');
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_role');

    if (window.AppState) {
      window.AppState.currentUser = null;
      window.AppState.currentUserRole = null;
      window.AppState.authToken = null;
    }

    showLogin();
    showToast("SUCCESS", "စနစ်မှ အောင်မြင်စွာ ထွက်ခွာပြီးပါပြီ။");

    setTimeout(function() {
      window.location.reload();
    }, 300);
  }
}

function checkExistingSession() {
  const savedUser = localStorage.getItem('golden_user_name');
  const savedRole = localStorage.getItem('golden_user_role');
  const savedToken = localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token');

  if (savedUser && savedRole && savedToken) {
    window.AppState = window.AppState || {};
    window.AppState.currentUser = savedUser;
    window.AppState.currentUserRole = savedRole;
    window.AppState.authToken = savedToken;

    showWorkspace();
    applyRoleRestrictions();

    if (typeof switchTab === 'function') {
      switchTab('dashboard');
    }
  } else {
    showLogin();
  }
}
