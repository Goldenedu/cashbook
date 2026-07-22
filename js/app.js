/**
 * GOLDEN ERP SYSTEM - MAIN SPA ROUTER & APP CORE
 * File: js/app.js
 */

const TITLE_MAP = {
  'dashboard': 'Home Dashboard',
  'bank-cash-kit': 'Bank / Cash / Kitchen Books',
  'office': 'Office Exp Book',
  'hr': 'HR Payroll & Staff List',
  'staff': 'Staff List',
  'income': 'Main Income Book',
  'student': 'Student List',
  'promotion': 'Promotion Reference Matrix',
  'uniform': 'Uniform Inventory Ledger',
  'reports': 'Reports & Financial Statements',
  'settings': 'System Settings & Controls'
};

// Cache for loaded HTML view templates to avoid repeated network fetches
window.viewCache = {};

/**
 * 💡 SPA View Switcher & Dynamic View Loader
 */
async function switchModule(moduleName) {
  window.AppState.currentModule = moduleName;

  // 1. Update Page Title
  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.innerText = TITLE_MAP[moduleName] || 'ERP Module';

  // 2. Highlight Sidebar Active Button
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeNav = document.getElementById(`nav-${moduleName}`);
  if (activeNav) activeNav.classList.add('active');

  // 3. Dynamic HTML View Loading
  const mainContent = document.getElementById('main-content');
  if (!mainContent) return;

  try {
    let viewHtml = window.viewCache[moduleName];

    if (!viewHtml) {
      toggleLoading(true);
      const res = await fetch(`views/${moduleName}.html`);
      if (!res.ok) throw new Error(`View template views/${moduleName}.html not found.`);
      viewHtml = await res.text();
      window.viewCache[moduleName] = viewHtml; // Store in memory cache
      toggleLoading(false);
    }

    mainContent.innerHTML = viewHtml;

    // 4. Trigger Module Specific Initialization Function
    triggerModuleInit(moduleName);

  } catch (err) {
    toggleLoading(false);
    console.error(`Failed to load view [${moduleName}]:`, err);
    mainContent.innerHTML = `<div class="p-8 text-center text-rose-400 font-bold bg-rose-500/10 border border-rose-500/20 rounded-2xl">
      <i class="fa-solid fa-triangle-exclamation text-2xl mb-2"></i>
      <p>Error loading module '${moduleName}': ${err.message}</p>
    </div>`;
  }
}

/**
 * 💡 Route Initializer Helper
 */
function triggerModuleInit(moduleName) {
  switch (moduleName) {
    case 'dashboard':
      if (typeof loadDashboardData === 'function') loadDashboardData(false, false);
      break;
    case 'bank-cash-kit':
      if (typeof switchSubBook === 'function') switchSubBook(window.BankCashKitState.activeSubBook || 'bank');
      break;
    case 'office':
      if (typeof loadOfficeData === 'function') loadOfficeData(false);
      break;
    case 'hr':
      if (typeof switchHrSubTab === 'function') switchHrSubTab(window.HrState.activeSubTab || 'payroll');
      break;
    case 'staff':
      if (typeof loadStaffData === 'function') loadStaffData(false);
      break;
    case 'income':
      if (typeof loadIncomeData === 'function') loadIncomeData(false);
      break;
    case 'student':
      if (typeof loadStudentData === 'function') loadStudentData(false);
      break;
    case 'promotion':
      if (typeof loadPromotionData === 'function') loadPromotionData(false);
      break;
    case 'uniform':
      if (typeof loadUniformData === 'function') loadUniformData(false);
      break;
    case 'reports':
      if (typeof showReportPanel === 'function') showReportPanel('panel-report-financial');
      break;
    case 'settings':
      // Settings view is static, no auto fetch needed
      break;
  }
}

/**
 * 💡 Load Dashboard Data (Reads pre-calculated Home A1:G32 from Sheets via Worker API)
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

/**
 * 💡 Render Dashboard Metrics & Cards
 */
function renderDashboardUI(data) {
  if (!data || !data.kpi || !data.balances) return;

  // KPI Cards
  const incEl = document.getElementById('db-total-income');
  if (incEl) incEl.innerText = Number(data.kpi.totalIncome || 0).toLocaleString('en-US') + " MMK";

  const expEl = document.getElementById('db-total-expense');
  if (expEl) expEl.innerText = Number(data.kpi.totalExpense || 0).toLocaleString('en-US') + " MMK";

  const netEl = document.getElementById('db-net-profit');
  if (netEl) netEl.innerText = Number(data.kpi.netProfit || 0).toLocaleString('en-US') + " MMK";

  const entEl = document.getElementById('db-total-entries');
  if (entEl) entEl.innerText = Number(data.kpi.totalEntries || 0).toLocaleString('en-US');

  // Daily Balances
  const bBnk = document.getElementById('db-bal-bank'); if (bBnk) bBnk.innerText = Number(data.balances.bank || 0).toLocaleString('en-US') + " MMK";
  const bCsh = document.getElementById('db-bal-cash'); if (bCsh) bCsh.innerText = Number(data.balances.cash || 0).toLocaleString('en-US') + " MMK";
  const bOff = document.getElementById('db-bal-office'); if (bOff) bOff.innerText = Number(data.balances.office || 0).toLocaleString('en-US') + " MMK";
  const bKit = document.getElementById('db-bal-kitchen'); if (bKit) bKit.innerText = Number(data.balances.kitchen || 0).toLocaleString('en-US') + " MMK";
  const bPay = document.getElementById('db-bal-payroll'); if (bPay) bPay.innerText = Number(data.balances.payroll || 0).toLocaleString('en-US') + " MMK";
  const bTot = document.getElementById('db-bal-total'); if (bTot) bTot.innerText = Number(data.balances.total || 0).toLocaleString('en-US') + " MMK";

  // Liabilities
  const lBnk = document.getElementById('db-lia-bank'); if (lBnk) lBnk.innerText = Number(data.liabilities.bankLoan || 0).toLocaleString('en-US') + " MMK";
  const lCsh = document.getElementById('db-lia-cash'); if (lCsh) lCsh.innerText = Number(data.liabilities.cashLoan || 0).toLocaleString('en-US') + " MMK";
  const lOff = document.getElementById('db-lia-office'); if (lOff) lOff.innerText = Number(data.liabilities.officeLiabilities || 0).toLocaleString('en-US') + " MMK";
  const lBon = document.getElementById('db-lia-bonus'); if (lBon) lBon.innerText = Number(data.liabilities.hrBonus || 0).toLocaleString('en-US') + " MMK";
  const lFnd = document.getElementById('db-lia-fund'); if (lFnd) lFnd.innerText = Number(data.liabilities.hrFund || 0).toLocaleString('en-US') + " MMK";
  const lTot = document.getElementById('db-lia-total'); if (lTot) lTot.innerText = Number(data.liabilities.total || 0).toLocaleString('en-US') + " MMK";

  // Receivables
  const rSnk = document.getElementById('db-rec-snack'); if (rSnk) rSnk.innerText = Number(data.receivables.advanceSnack || 0).toLocaleString('en-US') + " MMK";
  const rUni = document.getElementById('db-rec-uniform'); if (rUni) rUni.innerText = Number(data.receivables.advanceUniform || 0).toLocaleString('en-US') + " MMK";
  const rOth = document.getElementById('db-rec-other'); if (rOth) rOth.innerText = Number(data.receivables.otherAdvance || 0).toLocaleString('en-US') + " MMK";
  const rTot = document.getElementById('db-rec-total'); if (rTot) rTot.innerText = Number(data.receivables.total || 0).toLocaleString('en-US') + " MMK";

  // Active Demographics
  if (data.info) {
    const sM = document.getElementById('db-stu-male'); if (sM) sM.innerText = Number(data.info.students.male || 0).toLocaleString('en-US');
    const sF = document.getElementById('db-stu-female'); if (sF) sF.innerText = Number(data.info.students.female || 0).toLocaleString('en-US');
    const sT = document.getElementById('db-stu-total'); if (sT) sT.innerText = Number(data.info.students.total || 0).toLocaleString('en-US');

    const ftM = document.getElementById('db-ft-male'); if (ftM) ftM.innerText = Number(data.info.fullTime.male || 0).toLocaleString('en-US');
    const ftF = document.getElementById('db-ft-female'); if (ftF) ftF.innerText = Number(data.info.fullTime.female || 0).toLocaleString('en-US');
    const ftT = document.getElementById('db-ft-total'); if (ftT) ftT.innerText = Number(data.info.fullTime.total || 0).toLocaleString('en-US');

    const ptM = document.getElementById('db-pt-male'); if (ptM) ptM.innerText = Number(data.info.partTime.male || 0).toLocaleString('en-US');
    const ptF = document.getElementById('db-pt-female'); if (ptF) ptF.innerText = Number(data.info.partTime.female || 0).toLocaleString('en-US');
    const ptT = document.getElementById('db-pt-total'); if (ptT) ptT.innerText = Number(data.info.partTime.total || 0).toLocaleString('en-US');

    const totM = Number(data.info.students.male || 0) + Number(data.info.fullTime.male || 0) + Number(data.info.partTime.male || 0);
    const totF = Number(data.info.students.female || 0) + Number(data.info.fullTime.female || 0) + Number(data.info.partTime.female || 0);
    const totA = Number(data.info.students.total || 0) + Number(data.info.fullTime.total || 0) + Number(data.info.partTime.total || 0);

    const dTM = document.getElementById('db-demo-tot-male'); if (dTM) dTM.innerText = totM.toLocaleString('en-US');
    const dTF = document.getElementById('db-demo-tot-female'); if (dTF) dTF.innerText = totF.toLocaleString('en-US');
    const dTA = document.getElementById('db-demo-tot-all'); if (dTA) dTA.innerText = totA.toLocaleString('en-US');
  }
}

/**
 * 💡 Live Header Clock & Metadata Updater
 */
function updateClock() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const formattedHours = String(hours).padStart(2, '0');

  let fyStart = (now.getMonth() < 3) ? year - 1 : year;
  let fyEnd = fyStart + 1;

  const userDisplay = window.AppState.currentUser ? ` | User: ${window.AppState.currentUser.toUpperCase()} (${window.AppState.currentUserRole})` : '';
  const clockEl = document.getElementById('live-metadata');

  if (clockEl) {
    clockEl.innerHTML = `FY ${fyStart}-${fyEnd} | Date: ${day}-${month}-${year} | ${formattedHours}:${minutes} ${ampm}${userDisplay}`;
  }
}

// Start Clock Interval
setInterval(updateClock, 30000);
document.addEventListener("DOMContentLoaded", updateClock);