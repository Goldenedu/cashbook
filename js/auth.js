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

      document.getElementById('login-overlay').classList.add('hidden');
      document.getElementById('erp-workspace').classList.remove('hidden');

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

function handleLogout() {
  if (confirm("စနစ်မှ ထွက်ခွာလိုပါသလားရှင်?")) {
    localStorage.removeItem('golden_user_name');
    localStorage.removeItem('golden_user_role');
    localStorage.removeItem('golden_auth_token');

    if (window.AppState) {
      window.AppState.currentUser = null;
      window.AppState.currentUserRole = null;
      window.AppState.authToken = null;
    }

    document.getElementById('erp-workspace').classList.add('hidden');
    document.getElementById('login-overlay').classList.remove('hidden');

    const passwordInput = document.getElementById('login-password');
    if (passwordInput) passwordInput.value = '';

    showToast("SUCCESS", "စနစ်မှ အောင်မြင်စွာ ထွက်ခွာပြီးပါပြီ။");
  }
}

function checkExistingSession() {
  const savedUser = localStorage.getItem('golden_user_name');
  const savedRole = localStorage.getItem('golden_user_role');
  const savedToken = localStorage.getItem('golden_auth_token');

  if (savedUser && savedRole && savedToken) {
    window.AppState = window.AppState || {};
    window.AppState.currentUser = savedUser;
    window.AppState.currentUserRole = savedRole;
    window.AppState.authToken = savedToken;

    const overlay = document.getElementById('login-overlay');
    const ws = document.getElementById('erp-workspace');

    if (overlay) overlay.classList.add('hidden');
    if (ws) ws.classList.remove('hidden');

    applyRoleRestrictions();

    if (typeof switchTab === 'function') {
      switchTab('dashboard');
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  checkExistingSession();
});
