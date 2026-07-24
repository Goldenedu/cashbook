/**
 * GOLDEN ERP SYSTEM - MAIN SPA ROUTER & APPLICATION CONTROLLER
 * File: js/app.js
 */

// 💡 Global View HTML Cache
window.viewCache = window.viewCache || {};

/**
 * 💡 Main Application Initializer
 */
document.addEventListener('DOMContentLoaded', function () {
  initApp();
});

function initApp() {
  const token = localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token');
  const user = localStorage.getItem('golden_user_name');
  const role = localStorage.getItem('golden_user_role');

  // 💡 SECURITY GUARD: Login မဝင်ရသေးပါက မည်သည့် API ကိုမျှ မခေါ်ဘဲ Login Screen တွင် ရပ်တန့်ထားမည်
  if (!token) {
    console.log("[InitApp] User is not authenticated. Displaying login screen.");
    document.documentElement.className = 'dark not-authed';
    return;
  }

  // Update authenticated UI state
  document.documentElement.className = 'dark is-authed';
  updateHeaderMetadata(user, role);

  // Load default view (Dashboard)
  const currentTab = window.AppState ? window.AppState.currentModule : 'dashboard';
  switchTab(currentTab || 'dashboard');
}

/**
 * 💡 Update Header Metadata Badge
 */
function updateHeaderMetadata(username, role) {
  const metaEl = document.getElementById('live-metadata');
  if (metaEl) {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    metaEl.textContent = `FY 2026-2027 | Date: ${todayStr} | User: ${username || 'Anonymous'} (${role || 'Admin'})`;
  }
}

/**
 * 💡 Central Tab & View Router Engine
 */
async function switchTab(tabId) {
  const token = localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token');

  // Session သက်တမ်းကုန်/မရှိပါက စာမျက်နှာ မကူးဘဲ Login သို့ ပို့မည်
  if (!token) {
    document.documentElement.className = 'dark not-authed';
    return;
  }

  // Map navigation tab IDs to HTML view template names
  const viewMap = {
    'dashboard': 'dashboard',
    'bank': 'bank-cash-kit',
    'cash': 'bank-cash-kit',
    'income': 'income',
    'office': 'office',
    'kitchen': 'office',
    'hr': 'hr',
    'student': 'student',
    'uniform': 'uniform',
    'promotion': 'promotion',
    'report-financial': 'reports',
    'report-staff-fund': 'reports-fund',
    'settings': 'settings'
  };

  const titleMap = {
    'dashboard': 'Home Dashboard',
    'bank': 'Main Bank Book',
    'cash': 'Main Cash Book',
    'income': 'Main Income Book',
    'office': 'Office Expense Book',
    'kitchen': 'Kitchen Expense Book',
    'hr': 'HR Payroll & Staff Management',
    'student': 'Student Directory List',
    'uniform': 'Uniform Inventory Ledger',
    'promotion': 'Promotion Fee Rate Matrix',
    'report-financial': 'Financial Reports & Statements',
    'report-staff-fund': 'Staff Bonus & Fund Report',
    'settings': 'System Settings & Controls'
  };

  const viewFileName = viewMap[tabId] || 'dashboard';

  // Update Active Sidebar Navigation Highlights
  updateSidebarHighlight(tabId);

  // Update Page Title
  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.textContent = titleMap[tabId] || 'Golden ERP System';
  }

  // Sync Global AppState
  if (window.AppState) {
    window.AppState.currentModule = tabId;
  }

  // Load View HTML Template
  try {
    toggleLoading(true);
    let htmlContent = window.viewCache[viewFileName];

    if (!htmlContent) {
      const response = await fetch(`views/${viewFileName}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load view template: views/${viewFileName}.html`);
      }
      htmlContent = await response.text();
      window.viewCache[viewFileName] = htmlContent;
    }

    const container = document.getElementById('view-container');
    if (container) {
      container.innerHTML = htmlContent;
    }

    // 💡 Module Initialization Engine (View ရောက်မှ Data သန့်ရှင်းစွာ ခေါ်ယူခြင်း)
    await triggerModuleInit(tabId);

  } catch (err) {
    console.error(`[SwitchTab Error] Tab '${tabId}':`, err);
    showToast("ERROR", "စာမျက်နှာ ဖွင့်ယူ၍ မရပါ: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

/**
 * 💡 Trigger Data Loading for Specific Module
 */
async function triggerModuleInit(tabId) {
  try {
    switch (tabId) {
      case 'dashboard':
        await loadDashboardData(false, true);
        break;

      case 'bank':
      case 'cash':
        if (typeof window.switchSubBook === 'function') {
          window.switchSubBook(tabId === 'bank' ? 'Bank' : 'Cash');
        } else if (typeof loadBankCashKitData === 'function') {
          await loadBankCashKitData(false, true);
        }
        break;

      case 'income':
        if (typeof loadIncomeData === 'function') {
          await loadIncomeData(false);
        }
        break;

      case 'office':
      case 'kitchen':
        if (typeof window.switchExpenseBook === 'function') {
          window.switchExpenseBook(tabId === 'office' ? 'Office' : 'Kitchen');
        } else if (typeof loadOfficeData === 'function') {
          await loadOfficeData(false);
        }
        break;

      case 'hr':
        if (typeof switchHrSubTab === 'function') {
          switchHrSubTab('payroll');
        }
        break;

      case 'student':
        if (typeof loadStudentData === 'function') {
          await loadStudentData(false);
        }
        break;

      case 'uniform':
        if (typeof loadUniformData === 'function') {
          await loadUniformData(false);
        }
        break;

      case 'promotion':
        if (typeof loadPromotionData === 'function') {
          await loadPromotionData(false);
        }
        break;

      case 'report-financial':
        if (typeof showReportPanel === 'function') {
          showReportPanel('panel-report-financial');
        } else if (typeof loadReportFinancialData === 'function') {
          await loadReportFinancialData(false);
        }
        break;

      case 'report-staff-fund':
        if (typeof loadReportStaffFundData === 'function') {
          await loadReportStaffFundData(false);
        }
        break;

      case 'settings':
        break;

      default:
        break;
    }
  } catch (err) {
    console.error(`[ModuleInit Error] Failed to initialize '${tabId}':`, err);
  }
}

/**
 * 💡 Highlight active navigation button in sidebar
 */
function updateSidebarHighlight(activeTabId) {
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.classList.remove('active');
  });

  const activeBtn = document.getElementById(`btn-${activeTabId}`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

/**
 * 💡 Dashboard Live Data Loader
 */
async function loadDashboardData(isSilent = false, forceRefresh = false) {
  const token = localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token');
  if (!token) return;

  try {
    if (!isSilent) toggleLoading(true);

    const res = await callApi('getDashboardData', { forceRefresh: forceRefresh });

    if (!res || !res.success || !res.data) {
      throw new Error(res?.message || "Dashboard data unavailable");
    }

    const d = res.data;

    // 1. KPI Top Cards
    setElementText('db-total-income', formatMoney(d.kpi?.totalIncome) + ' MMK');
    setElementText('db-total-expense', formatMoney(d.kpi?.totalExpense) + ' MMK');
    setElementText('db-net-profit', formatMoney(d.kpi?.netProfit) + ' MMK');
    setElementText('db-total-entries', formatNumber(d.kpi?.totalEntries));

    // 2. Daily Balances
    setElementText('db-bal-bank', formatMoney(d.balances?.bank) + ' MMK');
    setElementText('db-bal-cash', formatMoney(d.balances?.cash) + ' MMK');
    setElementText('db-bal-office', formatMoney(d.balances?.office) + ' MMK');
    setElementText('db-bal-kitchen', formatMoney(d.balances?.kitchen) + ' MMK');
    setElementText('db-bal-payroll', formatMoney(d.balances?.payroll) + ' MMK');
    setElementText('db-bal-total', formatMoney(d.balances?.total) + ' MMK');

    // 3. Liabilities
    setElementText('db-lia-bank', formatMoney(d.liabilities?.bankLoan) + ' MMK');
    setElementText('db-lia-cash', formatMoney(d.liabilities?.cashLoan) + ' MMK');
    setElementText('db-lia-office', formatMoney(d.liabilities?.officeLiabilities) + ' MMK');
    setElementText('db-lia-bonus', formatMoney(d.liabilities?.hrBonus) + ' MMK');
    setElementText('db-lia-fund', formatMoney(d.liabilities?.hrFund) + ' MMK');
    setElementText('db-lia-total', formatMoney(d.liabilities?.total) + ' MMK');

    // 4. Receivables
    setElementText('db-rec-snack', formatMoney(d.receivables?.advanceSnack) + ' MMK');
    setElementText('db-rec-uniform', formatMoney(d.receivables?.advanceUniform) + ' MMK');
    setElementText('db-rec-other', formatMoney(d.receivables?.otherAdvance) + ' MMK');
    setElementText('db-rec-total', formatMoney(d.receivables?.total) + ' MMK');

    // 5. Active Demographic Info
    setElementText('db-stu-male', formatNumber(d.info?.students?.male));
    setElementText('db-stu-female', formatNumber(d.info?.students?.female));
    setElementText('db-stu-total', formatNumber(d.info?.students?.total));

    setElementText('db-ft-male', formatNumber(d.info?.fullTime?.male));
    setElementText('db-ft-female', formatNumber(d.info?.fullTime?.female));
    setElementText('db-ft-total', formatNumber(d.info?.fullTime?.total));

    setElementText('db-pt-male', formatNumber(d.info?.partTime?.male));
    setElementText('db-pt-female', formatNumber(d.info?.partTime?.female));
    setElementText('db-pt-total', formatNumber(d.info?.partTime?.total));

    const grandMale = (d.info?.students?.male || 0) + (d.info?.fullTime?.male || 0) + (d.info?.partTime?.male || 0);
    const grandFemale = (d.info?.students?.female || 0) + (d.info?.fullTime?.female || 0) + (d.info?.partTime?.female || 0);
    const grandAll = (d.info?.students?.total || 0) + (d.info?.fullTime?.total || 0) + (d.info?.partTime?.total || 0);

    setElementText('db-demo-tot-male', formatNumber(grandMale));
    setElementText('db-demo-tot-female', formatNumber(grandFemale));
    setElementText('db-demo-tot-all', formatNumber(grandAll));

  } catch (err) {
    console.error("Dashboard Load Error:", err);
    if (!isSilent) showToast("ERROR", "Dashboard အချက်အလက်များ တောင်းယူ၍ မရပါ: " + err.message);
  } finally {
    if (!isSilent) toggleLoading(false);
  }
}

/**
 * 💡 Helper formatting functions
 */
function setElementText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function formatMoney(val) {
  const num = typeof cleanNumber === 'function' ? cleanNumber(val) : Number(val) || 0;
  return num.toLocaleString('en-US');
}

function formatNumber(val) {
  const num = typeof cleanNumber === 'function' ? cleanNumber(val) : Number(val) || 0;
  return num.toLocaleString('en-US');
}
