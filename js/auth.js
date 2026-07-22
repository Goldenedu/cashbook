/**
 * GOLDEN ERP SYSTEM - AUTHENTICATION & ROLE ENGINE
 * File: js/auth.js
 */

/**
 * 💡 Login Form Submission Handler
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
  toggleLoading(true);

  try {
    const response = await callApi('checkLogin', { username, password });
    toggleLoading(false);

    if (response.success) {
      // Session ဒေတာများကို AppState နှင့် LocalStorage ထဲတွင် မှတ်သားခြင်း
      window.AppState.currentUser = response.username;
      window.AppState.currentUserRole = response.role;
      window.AppState.authToken = response.token;

      localStorage.setItem('golden_user_name', response.username);
      localStorage.setItem('golden_user_role', response.role);
      localStorage.setItem('golden_auth_token', response.token);

      // Login Overlay ပိတ်ပြီး Main Workspace ကို ဖွင့်ခြင်း
      document.getElementById('login-overlay').classList.add('hidden');
      document.getElementById('erp-workspace').classList.remove('hidden');

      // Cashier များအတွက် မိုဂျူးများ ကန့်သတ်ခြင်း
      applyRoleRestrictions();

      // Dashboard သို့ စတင်ခေါ်ဆောင်ခြင်း
      if (typeof switchModule === 'function') {
        switchModule('dashboard');
      }
      showToast("SUCCESS", "လော့ဂ်အင်ဝင်ရောက်မှု အောင်မြင်ပါသည်။");
    } else {
      if (errorBox) {
        errorBox.innerText = response.message || "အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။";
        errorBox.classList.remove('hidden');
      }
    }
  } catch (err) {
    toggleLoading(false);
    if (errorBox) {
      errorBox.innerText = "ဆာဗာစနစ်တွင်း အမှားဖြစ်ပေါ်ခဲ့သည်- " + err.message;
      errorBox.classList.remove('hidden');
    }
  }
}

/**
 * 💡 Role-Based UI Access Control (Cashier များအတွက် HR နှင့် Settings ကွယ်ဝှက်ခြင်း)
 */
function applyRoleRestrictions() {
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

/**
 * 💡 Session Logout Handler
 */
function handleLogout() {
  if (confirm("စနစ်မှ ထွက်ခွာလိုပါသလားရှင်?")) {
    localStorage.removeItem('golden_user_name');
    localStorage.removeItem('golden_user_role');
    localStorage.removeItem('golden_auth_token');

    window.AppState.currentUser = null;
    window.AppState.currentUserRole = null;
    window.AppState.authToken = null;

    document.getElementById('erp-workspace').classList.add('hidden');
    document.getElementById('login-overlay').classList.remove('hidden');

    const passwordInput = document.getElementById('login-password');
    if (passwordInput) passwordInput.value = '';

    showToast("SUCCESS", "စနစ်မှ အောင်မြင်စွာ ထွက်ခွာပြီးပါပြီ။");
  }
}

/**
 * 💡 Auto Check Saved Session on Page Reload (Page Refresh လုပ်ပါက မူလအတိုင်း ဖွင့်ထားပေးခြင်း)
 */
function checkExistingSession() {
  const savedUser = localStorage.getItem('golden_user_name');
  const savedRole = localStorage.getItem('golden_user_role');
  const savedToken = localStorage.getItem('golden_auth_token');

  if (savedUser && savedRole && savedToken) {
    window.AppState.currentUser = savedUser;
    window.AppState.currentUserRole = savedRole;
    window.AppState.authToken = savedToken;

    document.getElementById('login-overlay').classList.add('hidden');
    document.getElementById('erp-workspace').classList.remove('hidden');
    applyRoleRestrictions();

    if (typeof switchModule === 'function') {
      switchModule('dashboard');
    }
  }
}

// Page Load စတင်သည်နှင့် Session ရှိမရှိ စစ်ဆေးခြင်း
document.addEventListener("DOMContentLoaded", function () {
  checkExistingSession();
});