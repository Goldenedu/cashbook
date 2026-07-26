/**
 * GOLDEN ERP SYSTEM - AUTHENTICATION & ROLE ENGINE
 * File: js/auth.js
 * 💡 JWT Session Management, RBAC Permission Matrix & Workspace Toggler
 */

/**
 * 💡 Central Role-Based Access Control (RBAC) Permission Verifier
 * @param {string} permissionName - 'can_delete' | 'can_edit' | 'can_manage_grades' | 'can_backup'
 * @returns {boolean}
 */
function hasPermission(permissionName) {
  const role = (window.AppState?.currentUserRole || localStorage.getItem('golden_user_role') || 'Viewer').trim();

  const matrix = {
    'Owner': { can_view: true, can_add: true, can_edit: true, can_delete: true, can_manage_grades: true, can_backup: true },
    'Admin': { can_view: true, can_add: true, can_edit: true, can_delete: true, can_manage_grades: true, can_backup: true },
    'Finance': { can_view: true, can_add: true, can_edit: true, can_delete: true, can_manage_grades: false, can_backup: true },
    'Accountant': { can_view: true, can_add: true, can_edit: true, can_delete: true, can_manage_grades: false, can_backup: true },
    'HR Staff': { can_view: true, can_add: true, can_edit: true, can_delete: true, can_manage_grades: true, can_backup: false },
    'Cashier': { can_view: true, can_add: true, can_edit: true, can_delete: false, can_manage_grades: false, can_backup: false },
    'Main Cashier': { can_view: true, can_add: true, can_edit: true, can_delete: false, can_manage_grades: false, can_backup: false },
    'Staff': { can_view: true, can_add: true, can_edit: false, can_delete: false, can_manage_grades: false, can_backup: false },
    'Viewer': { can_view: true, can_add: false, can_edit: false, can_delete: false, can_manage_grades: false, can_backup: false }
  };

  const userPerms = matrix[role] || matrix['Viewer'];
  return !!userPerms[permissionName];
}

/**
 * 💡 Handle Login Form Submission
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
  if (typeof window.showLoading === 'function') window.showLoading(true);

  try {
    const response = await callApi('checkLogin', { username, password });
    if (typeof window.hideLoading === 'function') window.hideLoading();

    if (response && response.success) {
      window.AppState = window.AppState || {};
      window.AppState.currentUser = response.username;
      window.AppState.currentUserRole = response.role;
      window.AppState.authToken = response.token;

      const userObj = JSON.stringify({ username: response.username, role: response.role });
      localStorage.setItem('golden_user_name', response.username);
      localStorage.setItem('golden_user_role', response.role);
      localStorage.setItem('golden_auth_token', response.token);
      localStorage.setItem('golden_user', userObj);
      localStorage.setItem('erp_token', response.token);
      localStorage.setItem('erp_role', response.role);

      // 💡 1. Switch UI Workspace & Apply RBAC UI Restrictions
      showWorkspace();
      applyRoleRestrictions();

      if (typeof switchTab === 'function') {
        switchTab('dashboard');
      }
      showToast("SUCCESS", "လော့ဂ်အင် ဝင်ရောက်မှု အောင်မြင်ပါသည်။");
    } else {
      if (errorBox) {
        errorBox.innerText = (response ? response.message : "") || "အသုံးပြုသူအမည် သို့မဟုတ် လျှို့ဝှက်နံပါတ် မှားယွင်းနေပါသည်။";
        errorBox.classList.remove('hidden');
      }
    }
  } catch (err) {
    if (typeof window.hideLoading === 'function') window.hideLoading();
    if (errorBox) {
      errorBox.innerText = "ဆာဗာ ချိတ်ဆက်မှု အမှား ဖြစ်ပေါ်ခဲ့သည်: " + err.message;
      errorBox.classList.remove('hidden');
    }
  }
}

/**
 * 💡 Apply Navigation & Button Level Permissions by User Role
 */
function applyRoleRestrictions() {
  const role = (window.AppState?.currentUserRole || localStorage.getItem('golden_user_role') || 'Viewer').trim();
  const hrSection = document.getElementById('nav-hr-section');
  const settingsSection = document.getElementById('nav-settings-section');

  // Sidebar Section Restrictions
  if (role === "Cashier" || role === "Main Cashier" || role === "Staff" || role === "Viewer") {
    if (hrSection && (role === "Cashier" || role === "Main Cashier" || role === "Viewer")) hrSection.classList.add('hidden');
    if (settingsSection) settingsSection.classList.add('hidden');
  } else {
    if (hrSection) hrSection.classList.remove('hidden');
    if (settingsSection) settingsSection.classList.remove('hidden');
  }

  // Hide Delete Buttons across the DOM if role cannot delete
  const canDelete = hasPermission('can_delete');
  if (!canDelete) {
    document.body.classList.add('hide-delete-btn');
  } else {
    document.body.classList.remove('hide-delete-btn');
  }
}

/**
 * 💡 BULLETPROOF WORKSPACE TOGGLER (Tailwind .flex / .hidden Collision Resolution)
 */
function showWorkspace() {
  document.documentElement.className = 'dark is-authed';

  const overlay = document.getElementById('login-overlay');
  const ws = document.getElementById('erp-workspace');

  if (overlay) {
    overlay.classList.remove('flex');
    overlay.classList.add('hidden');
    overlay.style.setProperty('display', 'none', 'important');
  }

  if (ws) {
    ws.classList.remove('hidden');
    ws.classList.add('flex');
    ws.style.setProperty('display', 'flex', 'important');
  }
}

function showLogin() {
  document.documentElement.className = 'dark not-authed';

  const overlay = document.getElementById('login-overlay');
  const ws = document.getElementById('erp-workspace');

  if (overlay) {
    overlay.classList.remove('hidden');
    overlay.classList.add('flex');
    overlay.style.setProperty('display', 'flex', 'important');
  }

  if (ws) {
    ws.classList.remove('flex');
    ws.classList.add('hidden');
    ws.style.setProperty('display', 'none', 'important');
  }

  const passwordInput = document.getElementById('login-password');
  if (passwordInput) passwordInput.value = '';
}

/**
 * 💡 Handle System Logout Action
 */
function handleLogout() {
  if (confirm("စနစ်မှ ထွက်ခွာလိုပါသလား။")) {
    localStorage.removeItem('golden_user_name');
    localStorage.removeItem('golden_user_role');
    localStorage.removeItem('golden_auth_token');
    localStorage.removeItem('golden_user');
    localStorage.removeItem('erp_token');
    localStorage.removeItem('erp_role');

    if (window.AppState) {
      window.AppState.currentUser = null;
      window.AppState.currentUserRole = null;
      window.AppState.authToken = null;
    }

    if (window.invalidateCache) {
      window.invalidateCache();
    }

    showLogin();
    showToast("SUCCESS", "စနစ်မှ အောင်မြင်စွာ ထွက်ခွာပြီးပါပြီ။");

    setTimeout(function() {
      window.location.reload();
    }, 300);
  }
}

/**
 * 💡 Verify Existing Session State
 */
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
