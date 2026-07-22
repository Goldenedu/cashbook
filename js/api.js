/**
 * GOLDEN ERP SYSTEM - MAIN SPA ROUTER & HIGH-SPEED SWR ENGINE
 * File: js/app.js
 */

const TITLE_MAP = {
  'dashboard': 'Home Dashboard',
  'bank-cash-kit': 'Bank / Cash / Kitchen Books',
  'office': 'Office Exp Book',
  'hr': 'HR Payroll Exp Book',
  'staff': 'Staff List',
  'income': 'Main Income Book',
  'student': 'Student List',
  'promotion': 'Promotion Reference Matrix',
  'uniform': 'Uniform Inventory Ledger',
  'reports': 'Reports & Financial Statements',
  'settings': 'System Settings & Controls'
};

// HTML Template Memory Cache
window.viewCache = window.viewCache || {};

/**
 * 💡 Instant High-Speed SPA View Switcher (0ms Response Time)
 */
async function switchModule(moduleName) {
  window.AppState.currentModule = moduleName;

  // 1. Update Title & Active Sidebar UI Immediately
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.innerText = TITLE_MAP[moduleName] || 'ERP Module';

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeNav = document.getElementById(`nav-${moduleName}`);
  if (activeNav) activeNav.classList.add('active');

  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  try {
    // Check if View HTML template is already in memory
    if (window.viewCache[moduleName]) {
      mainContent.innerHTML = window.viewCache[moduleName];
      triggerModuleInit(moduleName, true); // Silent background fetch
    } else {
      toggleLoading(true);
      const res = await fetch(`views/${moduleName}.html`);
      if (!res.ok) throw new Error(`View views/${moduleName}.html not found.`);
      const htmlText = await res.text();
      window.viewCache[moduleName] = htmlText;
      mainContent.innerHTML = htmlText;
      toggleLoading(false);
      triggerModuleInit(moduleName, false);
    }
  } catch (err) {
    toggleLoading(false);
    console.error(`Failed to load view [${moduleName}]:`, err);
    mainContent.innerHTML = `<div class="p-8 text-center text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 rounded-2xl">
      <i class="fa-solid fa-triangle-exclamation text-2xl mb-2"></i>
      <p>Error loading view: ${err.message}</p>
    </div>`;
  }
}

/**
 * 💡 Trigger Module Data Fetching
 */
function triggerModuleInit(moduleName, isSilent = false) {
  switch (moduleName) {
    case 'dashboard':
      if (typeof loadDashboardData === 'function') loadDashboardData(isSilent, false);
      break;
    case 'bank-cash-kit':
      if (typeof switchSubBook === 'function') switchSubBook(window.BankCashKitState.activeSubBook || 'bank');
      break;
    case 'office':
      if (typeof loadOfficeData === 'function') loadOfficeData(isSilent);
      break;
    case 'hr':
      if (typeof switchHrSubTab === 'function') switchHrSubTab(window.HrState.activeSubTab || 'payroll');
      break;
    case 'staff':
      if (typeof loadStaffData === 'function') loadStaffData(isSilent);
      break;
    case 'income':
      if (typeof loadIncomeData === 'function') loadIncomeData(isSilent);
      break;
    case 'student':
      if (typeof loadStudentData === 'function') loadStudentData(isSilent);
      break;
    case 'promotion':
      if (typeof loadPromotionData === 'function') loadPromotionData(isSilent);
      break;
    case 'uniform':
      if (typeof loadUniformData === 'function') loadUniformData(isSilent);
      break;
    case 'reports':
      if (typeof showReportPanel === 'function') showReportPanel('panel-report-financial');
      break;
  }
}

/**
 * 💡 Dashboard Data Reader
 */
async function loadDashboardData(isSilent = false, forceRefresh = false) {
  if (!isSilent) toggleLoading(true);

  try {
    const response = await callApi('getDashboardData', { forceRefresh: !!forceRefresh }, 'GET');
    if (!isSilent) toggleLoading(false);

    if (response && response.success && response.data) {
      renderDashboardUI(response.data);
      if (forceRefresh) showToast("SUCCESS", "Dashboard ဒေတာများကို Sheet မှ Live ပြန်လည်ဆွဲယူပြီးပါပြီ။");
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Dashboard Load Error:", err);
  }
}

function renderDashboardUI(data) {
  if (!data || !data.kpi || !data.balances) return;

  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };

  setT('db-total-income', Number(data.kpi.totalIncome || 0).toLocaleString('en-US') + " MMK");
  setT('db-total-expense', Number(data.kpi.totalExpense || 0).toLocaleString('en-US') + " MMK");
  setT('db-net-profit', Number(data.kpi.netProfit || 0).toLocaleString('en-US') + " MMK");
  setT('db-total-entries', Number(data.kpi.totalEntries || 0).toLocaleString('en-US'));

  setT('db-bal-bank', Number(data.balances.bank || 0).toLocaleString('en-US') + " MMK");
  setT('db-bal-cash', Number(data.balances.cash || 0).toLocaleString('en-US') + " MMK");
  setT('db-bal-office', Number(data.balances.office || 0).toLocaleString('en-US') + " MMK");
  setT('db-bal-kitchen', Number(data.balances.kitchen || 0).toLocaleString('en-US') + " MMK");
  setT('db-bal-payroll', Number(data.balances.payroll || 0).toLocaleString('en-US') + " MMK");
  setT('db-bal-total', Number(data.balances.total || 0).toLocaleString('en-US') + " MMK");

  setT('db-lia-bank', Number(data.liabilities.bankLoan || 0).toLocaleString('en-US') + " MMK");
  setT('db-lia-cash', Number(data.liabilities.cashLoan || 0).toLocaleString('en-US') + " MMK");
  setT('db-lia-office', Number(data.liabilities.officeLiabilities || 0).toLocaleString('en-US') + " MMK");
  setT('db-lia-bonus', Number(data.liabilities.hrBonus || 0).toLocaleString('en-US') + " MMK");
  setT('db-lia-fund', Number(data.liabilities.hrFund || 0).toLocaleString('en-US') + " MMK");
  setT('db-lia-total', Number(data.liabilities.total || 0).toLocaleString('en-US') + " MMK");

  setT('db-rec-snack', Number(data.receivables.advanceSnack || 0).toLocaleString('en-US') + " MMK");
  setT('db-rec-uniform', Number(data.receivables.advanceUniform || 0).toLocaleString('en-US') + " MMK");
  setT('db-rec-other', Number(data.receivables.otherAdvance || 0).toLocaleString('en-US') + " MMK");
  setT('db-rec-total', Number(data.receivables.total || 0).toLocaleString('en-US') + " MMK");

  if (data.info) {
    setT('db-stu-male', Number(data.info.students.male || 0).toLocaleString('en-US'));
    setT('db-stu-female', Number(data.info.students.female || 0).toLocaleString('en-US'));
    setT('db-stu-total', Number(data.info.students.total || 0).toLocaleString('en-US'));

    setT('db-ft-male', Number(data.info.fullTime.male || 0).toLocaleString('en-US'));
    setT('db-ft-female', Number(data.info.fullTime.female || 0).toLocaleString('en-US'));
    setT('db-ft-total', Number(data.info.fullTime.total || 0).toLocaleString('en-US'));

    setT('db-pt-male', Number(data.info.partTime.male || 0).toLocaleString('en-US'));
    setT('db-pt-female', Number(data.info.partTime.female || 0).toLocaleString('en-US'));
    setT('db-pt-total', Number(data.info.partTime.total || 0).toLocaleString('en-US'));

    const totM = Number(data.info.students.male || 0) + Number(data.info.fullTime.male || 0) + Number(data.info.partTime.male || 0);
    const totF = Number(data.info.students.female || 0) + Number(data.info.fullTime.female || 0) + Number(data.info.partTime.female || 0);
    const totA = Number(data.info.students.total || 0) + Number(data.info.fullTime.total || 0) + Number(data.info.partTime.total || 0);

    setT('db-demo-tot-male', totM.toLocaleString('en-US'));
    setT('db-demo-tot-female', totF.toLocaleString('en-US'));
    setT('db-demo-tot-all', totA.toLocaleString('en-US'));
  }
}

function updateClock() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;

  let fyStart = (now.getMonth() < 3) ? year - 1 : year;
  let fyEnd = fyStart + 1;

  const userDisplay = window.AppState.currentUser ? ` | User: ${window.AppState.currentUser.toUpperCase()} (${window.AppState.currentUserRole})` : '';
  const clockEl = document.getElementById('live-metadata');

  if (clockEl) {
    clockEl.innerHTML = `FY ${fyStart}-${fyEnd} | Date: ${day}-${month}-${year} | ${String(hours).padStart(2, '0')}:${minutes} ${ampm}${userDisplay}`;
  }
}

setInterval(updateClock, 30000);
document.addEventListener("DOMContentLoaded", updateClock);
