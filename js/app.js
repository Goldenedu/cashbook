/**
 * GOLDEN ERP SYSTEM - MAIN SPA ROUTER & APPLICATION CONTROLLER
 * File: js/app.js
 */

window.viewCache = window.viewCache || {};

document.addEventListener('DOMContentLoaded', function () {
  initApp();
});

function initApp() {
  const token = localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token');
  const user = localStorage.getItem('golden_user_name') || localStorage.getItem('golden_user_role');

  if (!token) {
    console.log("[InitApp] User is not authenticated. Displaying login screen.");
    document.documentElement.className = 'dark not-authed';
    return;
  }

  document.documentElement.className = 'dark is-authed';
  updateHeaderMetadata(user);

  const currentTab = window.AppState ? window.AppState.currentModule : 'dashboard';
  switchTab(currentTab || 'dashboard');
}

/**
 * 💡 Update Header Metadata Badge
 * Format: "FY 2026-2027 | Fri | 7:50 PM | User: Admin"
 */
function updateHeaderMetadata(username) {
  const metaEl = document.getElementById('live-metadata');
  if (!metaEl) return;

  const activeUser = username || localStorage.getItem('golden_user_name') || localStorage.getItem('golden_user_role') || 'Admin';

  const d = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayName = days[d.getDay()];

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedTime = `${hours}:${minutes} ${ampm}`;

  // 💡 Exact Format Requested: "FY 2026-2027 | Fri | 7:50 PM | User: Admin"
  metaEl.textContent = `FY 2026-2027 | ${dayName} | ${formattedTime} | User: ${activeUser}`;
}

/**
 * 💡 Central Tab & View Router Engine
 */
async function switchTab(tabId) {
  const token = localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token');

  if (!token) {
    document.documentElement.className = 'dark not-authed';
    return;
  }

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
    'hr': 'HR Payroll Group',
    'student': 'Student Directory List',
    'uniform': 'Uniform Inventory Ledger',
    'promotion': 'Promotion Fee Rate Matrix',
    'report-financial': 'Financial Reports & Statements',
    'report-staff-fund': 'Staff Bonus & Fund Report',
    'settings': 'System Settings & Controls'
  };

  const viewFileName = viewMap[tabId] || 'dashboard';

  updateSidebarHighlight(tabId);

  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.textContent = titleMap[tabId] || 'HR Payroll Group';
  }

  if (window.AppState) {
    window.AppState.currentModule = tabId;
  }

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
        } else if (typeof loadHrPayrollData === 'function') {
          await loadHrPayrollData(false);
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

    setElementText('db-total-income', formatMoney(d.kpi?.totalIncome) + ' MMK');
    setElementText('db-total-expense', formatMoney(d.kpi?.totalExpense) + ' MMK');
    setElementText('db-net-profit', formatMoney(d.kpi?.netProfit) + ' MMK');
    setElementText('db-total-entries', formatNumber(d.kpi?.totalEntries));

    setElementText('db-bal-bank', formatMoney(d.balances?.bank) + ' MMK');
    setElementText('db-bal-cash', formatMoney(d.balances?.cash) + ' MMK');
    setElementText('db-bal-office', formatMoney(d.balances?.office) + ' MMK');
    setElementText('db-bal-kitchen', formatMoney(d.balances?.kitchen) + ' MMK');
    setElementText('db-bal-payroll', formatMoney(d.balances?.payroll) + ' MMK');
    setElementText('db-bal-total', formatMoney(d.balances?.total) + ' MMK');

    setElementText('db-lia-bank', formatMoney(d.liabilities?.bankLoan) + ' MMK');
    setElementText('db-lia-cash', formatMoney(d.liabilities?.cashLoan) + ' MMK');
    setElementText('db-lia-office', formatMoney(d.liabilities?.officeLiabilities) + ' MMK');
    setElementText('db-lia-bonus', formatMoney(d.liabilities?.hrBonus) + ' MMK');
    setElementText('db-lia-fund', formatMoney(d.liabilities?.hrFund) + ' MMK');
    setElementText('db-lia-total', formatMoney(d.liabilities?.total) + ' MMK');

    setElementText('db-rec-snack', formatMoney(d.receivables?.advanceSnack) + ' MMK');
    setElementText('db-rec-uniform', formatMoney(d.receivables?.advanceUniform) + ' MMK');
    setElementText('db-rec-other', formatMoney(d.receivables?.otherAdvance) + ' MMK');
    setElementText('db-rec-total', formatMoney(d.receivables?.total) + ' MMK');

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
