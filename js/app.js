/**
 * GOLDEN ERP SYSTEM - INSTANT ZERO-LATENCY SPA ROUTER
 * File: js/app.js
 */

window.TITLE_MAP = window.TITLE_MAP || {
  'dashboard': 'Home Dashboard',
  'bank': 'Main Bank Book',
  'cash': 'Main Cash Book',
  'income': 'Main Income Book',
  'office': 'Office Exp Book',
  'kitchen': 'Kitchen Exp Book',
  'payroll': 'HR Payroll Exp Book',
  'fulltime': 'Full Time Staff List (FID)',
  'parttime': 'Part Time Staff List (PID)',
  'student': 'Student List',
  'uniform': 'Uniform Ledger',
  'promotion': 'Promotion Reference Matrix',
  'report-financial': 'Financial Statement Report',
  'report-in-detail': 'Income Detail Report (InDetail)',
  'report-in-rep': 'Monthly Income Report (InRep)',
  'report-staff-fund': 'Staff Fund Report',
  'report-student': 'Student Demographics Report',
  'settings': 'System Settings & Controls'
};

// 💡 1. VIEW_FILES ထဲသို့ 'report-staff-fund' ထည့်သွင်းပေးခြင်း
const VIEW_FILES = [
  'dashboard', 'bank-cash-kit', 'office', 'hr', 'staff',
  'income', 'student', 'promotion', 'uniform', 'reports', 'report-staff-fund', 'settings'
];

async function preloadAllViews() {
  const container = document.getElementById('view-container');
  if (!container) return;

  for (const v of VIEW_FILES) {
    try {
      const res = await fetch(`views/${v}.html`);
      if (res.ok) {
        const htmlText = await res.text();
        const wrapper = document.createElement('div');
        wrapper.id = `view-${v}`;
        wrapper.className = 'view-panel hidden';
        wrapper.innerHTML = htmlText;
        container.appendChild(wrapper);
      }
    } catch (err) {
      console.warn(`Failed to preload view: ${v}`, err);
    }
  }

  switchTab('dashboard');
}

function switchTab(tabId) {
  if (window.AppState) window.AppState.currentModule = tabId;

  const titleEl = document.getElementById('page-title');
  if (titleEl) titleEl.innerText = window.TITLE_MAP[tabId] || 'ERP Module';

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-${tabId}`);
  if (activeBtn) activeBtn.classList.add('active');

  document.querySelectorAll('.view-panel').forEach(panel => panel.classList.add('hidden'));

  // 💡 2. Target View Mapping (report-staff-fund အတွက် သီးသန့် View လမ်းကြောင်းပေးခြင်း)
  let targetViewId = tabId;
  if (['bank', 'cash', 'kitchen'].includes(tabId)) {
    targetViewId = 'bank-cash-kit';
  } else if (tabId === 'payroll') {
    targetViewId = 'hr';
  } else if (['fulltime', 'parttime'].includes(tabId)) {
    targetViewId = 'staff';
  } else if (tabId === 'report-staff-fund') {
    targetViewId = 'report-staff-fund'; // 💡 သီးသန့် View သို့ ညွှန်းမည်
  } else if (tabId.startsWith('report-')) {
    targetViewId = 'reports';
  }

  const targetPanel = document.getElementById(`view-${targetViewId}`);
  if (targetPanel) {
    targetPanel.classList.remove('hidden');
  }

  triggerModuleInit(tabId);
}

function triggerModuleInit(tabId) {
  if (tabId === 'dashboard') {
    if (typeof loadDashboardData === 'function') loadDashboardData(true, false);
  } else if (['bank', 'cash', 'kitchen'].includes(tabId)) {
    if (typeof switchSubBook === 'function') switchSubBook(tabId);
  } else if (tabId === 'office') {
    if (typeof loadOfficeData === 'function') loadOfficeData(true);
  } else if (tabId === 'payroll') {
    if (typeof switchHrSubTab === 'function') switchHrSubTab('payroll');
  } else if (tabId === 'fulltime') {
    if (typeof switchStaffCategory === 'function') switchStaffCategory('Full Time');
  } else if (tabId === 'parttime') {
    if (typeof switchStaffCategory === 'function') switchStaffCategory('Part Time');
  } else if (tabId === 'income') {
    if (typeof loadIncomeData === 'function') loadIncomeData(true);
  } else if (tabId === 'student') {
    if (typeof loadStudentData === 'function') loadStudentData(true);
  } else if (tabId === 'promotion') {
    if (typeof loadPromotionData === 'function') loadPromotionData(true);
  } else if (tabId === 'uniform') {
    if (typeof loadUniformData === 'function') loadUniformData(true);
  } else if (tabId === 'report-financial') {
    if (typeof showReportPanel === 'function') showReportPanel('panel-report-financial');
  } else if (tabId === 'report-in-detail') {
    if (typeof showReportPanel === 'function') showReportPanel('panel-report-income-detail');
  } else if (tabId === 'report-in-rep') {
    if (typeof showReportPanel === 'function') showReportPanel('panel-report-monthly-income');
  } else if (tabId === 'report-staff-fund') {
    // 💡 3. Staff Fund Data ကို တိုက်ရိုက် ခေါ်ယူခြင်း
    if (typeof loadReportStaffFundData === 'function') loadReportStaffFundData(false);
  } else if (tabId === 'report-student') {
    if (typeof showReportPanel === 'function') showReportPanel('panel-report-student');
  }
}

async function loadDashboardData(isSilent = true, forceRefresh = false) {
  try {
    const response = await callApi('getDashboardData', { forceRefresh: !!forceRefresh }, 'GET');
    if (response && response.success && response.data) {
      renderDashboardUI(response.data);
      if (forceRefresh) showToast("SUCCESS", "Dashboard ဒေတာများကို Sheet မှ Live ပြန်လည်ဆွဲယူပြီးပါပြီ။");
    }
  } catch (err) {
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

  const userDisplay = (window.AppState && window.AppState.currentUser) ? ` | User: ${window.AppState.currentUser.toUpperCase()} (${window.AppState.currentUserRole})` : '';
  const clockEl = document.getElementById('live-metadata');

  if (clockEl) {
    clockEl.innerHTML = `FY ${fyStart}-${fyEnd} | Date: ${day}-${month}-${year} | ${String(hours).padStart(2, '0')}:${minutes} ${ampm}${userDisplay}`;
  }
}

setInterval(updateClock, 30000);
document.addEventListener("DOMContentLoaded", function () {
  updateClock();
  preloadAllViews();
});
