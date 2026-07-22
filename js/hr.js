/**
 * GOLDEN ERP SYSTEM - HR PAYROLL & STAFF MANAGEMENT MODULE
 * File: js/hr.js
 */

window.HrState = {
  activeSubTab: 'payroll', // 'payroll', 'fulltime', or 'parttime'
  payrollPage: 1,
  payrollLimit: 30,
  payrollTotalRows: 0,
  payrollData: [],
  payrollStats: { totalIncome: 0, totalExpense: 0, balance: 0 },

  staffCategory: 'Full Time',
  staffPage: 1,
  staffLimit: 50,
  staffTotalRows: 0,
  staffData: [],
  staffStats: {},

  payrollSettings: { grades: {}, bonus: 46000, fundRate: 0.05 },
  fullTimeList: [],
  partTimeList: []
};

/**
 * 💡 Switch Sub-Tab (Payroll vs Full Time Staff vs Part Time Staff)
 */
function switchHrSubTab(tabKey) {
  window.HrState.activeSubTab = tabKey;

  document.querySelectorAll('.hr-sub-tab-btn').forEach(btn => {
    btn.classList.remove('bg-teal-600', 'text-white');
    btn.classList.add('bg-slate-800', 'text-slate-400');
  });

  const activeBtn = document.getElementById(`hr-tab-${tabKey}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-800', 'text-slate-400');
    activeBtn.classList.add('bg-teal-600', 'text-white');
  }

  const payrollSec = document.getElementById('hr-payroll-section');
  const staffSec = document.getElementById('hr-staff-section');

  if (tabKey === 'payroll') {
    if (payrollSec) payrollSec.classList.remove('hidden');
    if (staffSec) staffSec.classList.add('hidden');
    loadHrPayrollData(false);
  } else {
    if (payrollSec) payrollSec.classList.add('hidden');
    if (staffSec) staffSec.classList.remove('hidden');
    window.HrState.staffCategory = (tabKey === 'fulltime') ? 'Full Time' : 'Part Time';
    loadStaffData(false);
  }
}

/**
 * 💡 Load Payroll Settings (Grades A-J Rates)
 */
async function loadPayrollSettings() {
  try {
    const res = await callApi('getPayrollSettings', {}, 'GET');
    if (res && res.grades) {
      window.HrState.payrollSettings = res;
    }
  } catch (err) {
    console.warn("Failed to load payroll settings:", err);
  }
}

/**
 * 💡 Auto-fill Basic Salary on Grade Selection
 */
function onSalaryGradeChange() {
  const gradeSelect = document.getElementById('staff-grade');
  if (!gradeSelect) return;

  const key = gradeSelect.value.trim().toUpperCase();
  const basicInput = document.getElementById('staff-basic');
  const workingDaysInput = document.getElementById('staff-working-days');

  if (key === "NON") {
    if (basicInput) basicInput.value = 0;
    if (workingDaysInput) workingDaysInput.value = 0;
    return;
  } else {
    if (workingDaysInput && parseFloat(workingDaysInput.value) === 0) {
      workingDaysInput.value = 26;
    }
  }

  if (window.HrState.payrollSettings && window.HrState.payrollSettings.grades) {
    const rate = window.HrState.payrollSettings.grades[key] || 0;
    if (basicInput) basicInput.value = rate;
  }
}

/**
 * 💡 Load HR Payroll Expense Book Data
 */
async function loadHrPayrollData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  try {
    const response = await callApi('getExpenseData', {
      bookName: 'HR Payroll Exp Book',
      page: window.HrState.payrollPage,
      limit: window.HrState.payrollLimit,
      searchVal: document.getElementById('hr-payroll-search') ? document.getElementById('hr-payroll-search').value.trim() : ''
    }, 'GET');

    if (!isSilent) toggleLoading(false);

    if (response && response.data) {
      window.HrState.payrollData = response.data;
      window.HrState.payrollTotalRows = response.totalRows || 0;
      window.HrState.payrollStats = response.stats || { totalIncome: 0, totalExpense: 0, balance: 0 };

      updateStatsHrPayroll();
      renderHrPayrollTable();
      updatePaginationHrPayroll();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading HR Payroll data:", err);
  }
}

function updateStatsHrPayroll() {
  const stats = window.HrState.payrollStats;
  const incEl = document.getElementById('hr-pay-total-income');
  if (incEl) incEl.innerText = Number(stats.totalIncome || 0).toLocaleString('en-US') + " MMK";

  const expEl = document.getElementById('hr-pay-total-expense');
  if (expEl) expEl.innerText = Number(stats.totalExpense || 0).toLocaleString('en-US') + " MMK";

  const balEl = document.getElementById('hr-pay-balance');
  if (balEl) balEl.innerText = Number(stats.balance || 0).toLocaleString('en-US') + " MMK";

  const countEl = document.getElementById('hr-pay-entries-count');
  if (countEl) countEl.innerText = window.HrState.payrollTotalRows.toLocaleString('en-US');
}

function renderHrPayrollTable() {
  const tableBody = document.getElementById('hr-payroll-table-body');
  if (!tableBody) return;

  const data = window.HrState.payrollData;
  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="16" class="text-center py-8 text-slate-500 font-bold">No payroll expense entries found.</td></tr>`;
    return;
  }

  const isViewer = (window.AppState.currentUserRole === "Viewer");

  tableBody.innerHTML = data.map((row) => {
    let displayDate = row.date || "";
    if (displayDate) {
      let parts = displayDate.split('-');
      if (parts.length === 3) displayDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const lockClass = (row.isLocked && window.AppState.currentUserRole !== "Admin") ? "opacity-30 cursor-not-allowed pointer-events-none" : "hover:text-white";
    const lockTitle = row.isLocked ? "Locked (Older than 7 days)" : "";

    let mailBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-500">Normal Tx</span>`;
    if (row.category === "Full Time Salary" || row.category === "Part Time Salary") {
      if (row.sendMail === "Sent Email") {
        mailBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><i class="fa-solid fa-circle-check"></i> Sent</span>`;
      } else if (row.sendMail === "No Email") {
        mailBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">No Email</span>`;
      } else {
        mailBadge = `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Pending</span>`;
      }
    }

    return `
      <tr class="hover:bg-slate-800/20 text-slate-300">
        <td class="text-center font-semibold text-slate-500">${row.no}</td>
        <td>${escapeHtml(displayDate)}</td>
        <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">${escapeHtml(row.category)}</span></td>
        <td class="font-bold text-slate-200">${escapeHtml(row.id) || '-'}</td>
        <td class="min-w-[250px] max-w-md truncate" title="${escapeHtml(row.description)}">${escapeHtml(row.description)}</td>
        <td class="font-bold">${escapeHtml(row.method) || '-'}</td>
        <td class="text-right text-emerald-400 font-semibold">${row.debit > 0 ? Number(row.debit).toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
        <td class="text-right text-rose-400 font-semibold">${row.credit > 0 ? Number(row.credit).toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
        <td class="text-right text-slate-400 font-bold">${Number(row.balances).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="text-right text-emerald-400 font-bold">${Number(row.unpaidBonus || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="text-right text-teal-400 font-bold">${Number(row.unpaidFund || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="text-center">${mailBadge}</td>
        <td>${escapeHtml(row.vrNo || '-')}</td>
        <td>${escapeHtml(row.my || '-')}</td>
        <td>${escapeHtml(row.fy || '-')}</td>
        <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
          <div class="flex items-center justify-center gap-3 ${isViewer ? 'hidden' : ''}">
            <button onclick="editHrPayrollEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition ${lockClass}" title="${lockTitle}" ${row.isLocked && window.AppState.currentUserRole !== "Admin" ? 'disabled' : ''}>
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="deleteHrPayrollEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition ${lockClass}" title="${lockTitle}" ${row.isLocked && window.AppState.currentUserRole !== "Admin" ? 'disabled' : ''}>
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updatePaginationHrPayroll() {
  const state = window.HrState;
  const info = document.getElementById('hr-pay-pagination-info');
  if (info) {
    const start = state.payrollTotalRows === 0 ? 0 : (state.payrollPage - 1) * state.payrollLimit + 1;
    const end = Math.min(state.payrollPage * state.payrollLimit, state.payrollTotalRows);
    info.innerHTML = `Showing <span class="text-indigo-400 font-extrabold">${start}</span> to <span class="text-indigo-400 font-extrabold">${end}</span> of <span class="text-indigo-400 font-extrabold">${state.payrollTotalRows}</span> entries`;
  }
}

/**
 * 💡 Load Full Time / Part Time Staff List Data
 */
async function loadStaffData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  const cat = window.HrState.staffCategory;

  try {
    const response = await callApi('getStaffData', {
      category: cat,
      page: window.HrState.staffPage,
      limit: window.HrState.staffLimit,
      searchVal: document.getElementById('staff-search-input') ? document.getElementById('staff-search-input').value.trim() : ''
    }, 'GET');

    if (!isSilent) toggleLoading(false);

    if (response && response.data) {
      window.HrState.staffData = response.data;
      window.HrState.staffTotalRows = response.totalRows || 0;

      if (cat === 'Full Time') window.HrState.fullTimeList = response.data;
      else window.HrState.partTimeList = response.data;

      renderStaffTable();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Staff List data:", err);
  }
}

function renderStaffTable() {
  const tableBody = document.getElementById('staff-table-body');
  if (!tableBody) return;

  const data = window.HrState.staffData;
  const isFT = (window.HrState.staffCategory === 'Full Time');

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="${isFT ? 23 : 14}" class="text-center py-8 text-slate-500 font-bold">No staff records found.</td></tr>`;
    return;
  }

  const isViewer = (window.AppState.currentUserRole === "Viewer");

  tableBody.innerHTML = data.map((row) => {
    let displayDate = row.joinDate || "";
    if (displayDate) {
      let parts = displayDate.split('-');
      if (parts.length === 3) displayDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    if (isFT) {
      return `
        <tr class="hover:bg-slate-800/20 text-slate-300">
          <td class="text-center font-semibold text-slate-500">${row.no}</td>
          <td>${escapeHtml(displayDate)}</td>
          <td class="font-bold text-slate-200">${escapeHtml(row.staffIdName)}</td>
          <td>${escapeHtml(row.education)}</td>
          <td>${escapeHtml(row.position)}</td>
          <td>${escapeHtml(row.salaryGrade || '-')}</td>
          <td class="text-right">${row.workingDays || 0}</td>
          <td class="text-right text-emerald-400">${Number(row.basicAmt || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-rose-400">${Number(row.extraAmt || 0).toLocaleString('en-US')}</td>
          <td class="text-right">${Number(row.totalSalary || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-emerald-400">${Number(row.bonus || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-teal-400">${Number(row.fund || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-indigo-400 font-bold">${Number(row.totalNetAmt || 0).toLocaleString('en-US')}</td>
          <td><span class="px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">${escapeHtml(row.status)}</span></td>
          <td>${escapeHtml(row.gender)}</td>
          <td>${escapeHtml(row.nrcNo || '-')}</td>
          <td>${escapeHtml(row.bankAccount || '-')}</td>
          <td>${escapeHtml(row.phoneNo || '-')}</td>
          <td>${escapeHtml(row.email || '-')}</td>
          <td class="text-indigo-400 font-bold">${escapeHtml(row.fundDate || '-')}</td>
          <td class="text-right text-emerald-400">${Number(row.unpaidBonus || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-teal-400">${Number(row.unpaidFund || 0).toLocaleString('en-US')}</td>
          <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
            <div class="flex items-center justify-center gap-3 ${isViewer ? 'hidden' : ''}">
              <button onclick="editStaffEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="deleteStaffEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    } else {
      return `
        <tr class="hover:bg-slate-800/20 text-slate-300">
          <td class="text-center font-semibold text-slate-500">${row.no}</td>
          <td>${escapeHtml(displayDate)}</td>
          <td class="font-bold text-slate-200">${escapeHtml(row.staffIdName)}</td>
          <td>${escapeHtml(row.education)}</td>
          <td>${escapeHtml(row.position)}</td>
          <td class="text-right">${Number(row.totalSalary || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-indigo-400 font-bold">${Number(row.totalNetAmt || 0).toLocaleString('en-US')}</td>
          <td><span class="px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">${escapeHtml(row.status)}</span></td>
          <td>${escapeHtml(row.gender)}</td>
          <td>${escapeHtml(row.nrcNo || '-')}</td>
          <td>${escapeHtml(row.bankAccount || '-')}</td>
          <td>${escapeHtml(row.phoneNo || '-')}</td>
          <td>${escapeHtml(row.email || '-')}</td>
          <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
            <div class="flex items-center justify-center gap-3 ${isViewer ? 'hidden' : ''}">
              <button onclick="editStaffEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition"><i class="fa-solid fa-pen-to-square"></i></button>
              <button onclick="deleteStaffEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition"><i class="fa-solid fa-trash"></i></button>
            </div>
          </td>
        </tr>
      `;
    }
  }).join('');
}

/**
 * 💡 Trigger Payslip Dispatch via Resend API
 */
async function sendMonthlyPayslipsToStaff() {
  if (confirm("ဝန်ထမ်းများထံ ယခုလ လစာရှင်းတမ်း (Payslip) များကို Resend API ဖြင့် ပေးပို့ပါမည်။\n\n(ပို့ပြီးသားသူများနှင့် အီးမေးလ်မရှိသူများကို စနစ်က အလိုအလျောက် ကျော်သွားမည် ဖြစ်ပါသည်။)")) {
    showToast("SUCCESS", "လစာရှင်းတမ်းများ ပေးပို့နေပါသည်...");
    toggleLoading(true);

    try {
      const response = await callApi('sendMonthlyPayslipsToStaff', {});
      toggleLoading(false);

      if (response && response.success) {
        showToast("SUCCESS", response.message || "Payslips ပေးပို့မှု အောင်မြင်စွာ ပြီးစီးပါပြီရှင်။");
        loadHrPayrollData(true);
      } else {
        showToast("ERROR", "မအောင်မြင်ပါ: " + (response.message || ""));
      }
    } catch (err) {
      toggleLoading(false);
      showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
    }
  }
}

/**
 * 💡 Auto Fill Details on Staff ID Change in Payroll Form
 */
function onStaffIdChangePayroll() {
  const staffIdRaw = document.getElementById('hr-pay-staff-id') ? document.getElementById('hr-pay-staff-id').value.trim() : '';
  const category = document.getElementById('hr-pay-category') ? document.getElementById('hr-pay-category').value : '';

  if (!staffIdRaw) return;

  const parsedId = parseInt(staffIdRaw.replace(/[^\d]/g, ""), 10);
  if (isNaN(parsedId)) return;

  const list = (category === 'Part Time Salary') ? window.HrState.partTimeList : window.HrState.fullTimeList;
  const staff = list.find(s => parseInt(String(s.staffId).replace(/[^\d]/g, ""), 10) === parsedId);

  if (staff) {
    document.getElementById('hr-pay-credit').value = staff.totalSalary || 0;
    if (category === 'Full Time Salary') {
      document.getElementById('hr-pay-unpaid-bonus').value = staff.bonus || 0;
      document.getElementById('hr-pay-unpaid-fund').value = staff.fund || 0;
    } else if (category === 'Full Time Bonus') {
      document.getElementById('hr-pay-credit').value = staff.unpaidBonus || 0;
      document.getElementById('hr-pay-unpaid-bonus').value = staff.unpaidBonus || 0;
    } else if (category === 'Full Time Fund') {
      document.getElementById('hr-pay-credit').value = staff.unpaidFund || 0;
      document.getElementById('hr-pay-unpaid-fund').value = staff.unpaidFund || 0;
    }

    const descInput = document.getElementById('hr-pay-description');
    if (descInput && !descInput.value) {
      descInput.value = `${staff.staffIdName}, ${category}`;
    }
  }
}

/**
 * 💡 Save / Update HR Payroll Entry
 */
async function saveHrPayrollForm(e) {
  e.preventDefault();
  closeHrPayrollModal();

  const uniqueId = document.getElementById('hr-pay-uniqueId').value;
  const isAdd = (!uniqueId);

  const entry = {
    uniqueId: uniqueId,
    date: document.getElementById('hr-pay-date').value,
    category: document.getElementById('hr-pay-category').value,
    id: document.getElementById('hr-pay-staff-id').value,
    method: document.getElementById('hr-pay-method').value,
    debit: parseFloat(document.getElementById('hr-pay-debit').value) || 0,
    credit: parseFloat(document.getElementById('hr-pay-credit').value) || 0,
    unpaidBonus: parseFloat(document.getElementById('hr-pay-unpaid-bonus').value) || 0,
    unpaidFund: parseFloat(document.getElementById('hr-pay-unpaid-fund').value) || 0,
    description: document.getElementById('hr-pay-description').value,
    bookName: 'HR Payroll Exp Book',
    createdBy: window.AppState.currentUser || "System"
  };

  const action = isAdd ? 'saveExpenseEntry' : 'updateExpenseEntry';
  showToast("SUCCESS", "စာရင်းအား ဆာဗာတွင် သိမ်းဆည်းနေပါသည်...");

  try {
    const response = await callApi(action, entry);
    if (response && response.success) {
      showToast("SUCCESS", isAdd ? "HR Payroll စာရင်းသစ် သိမ်းဆည်းပြီးပါပြီရှင်။" : "HR Payroll စာရင်း ပြင်ဆင်ပြီးပါပြီရှင်။");
      loadHrPayrollData(true);
    } else {
      showToast("ERROR", "မအောင်မြင်ပါ: " + (response.message || ""));
    }
  } catch (err) {
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
  }
}

function openAddModalHrPayroll() {
  const form = document.getElementById('hr-payroll-form');
  if (form) form.reset();

  document.getElementById('hr-pay-uniqueId').value = "";

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  document.getElementById('hr-pay-date').value = `${yyyy}-${mm}-${dd}`;

  document.getElementById('hr-payroll-modal').classList.remove('hidden');
}

function closeHrPayrollModal() {
  document.getElementById('hr-payroll-modal').classList.add('hidden');
}

/**
 * 💡 Save / Update Staff Member
 */
async function saveStaffForm(e) {
  e.preventDefault();
  closeStaffModal();

  const uniqueId = document.getElementById('staff-uniqueId').value;
  const isAdd = (!uniqueId);

  const entry = {
    uniqueId: uniqueId,
    joinDate: document.getElementById('staff-joindate').value,
    category: window.HrState.staffCategory,
    name: document.getElementById('staff-name').value,
    education: document.getElementById('staff-education').value,
    position: document.getElementById('staff-position').value,
    salaryGrade: document.getElementById('staff-grade') ? document.getElementById('staff-grade').value : '',
    workingDays: parseFloat(document.getElementById('staff-working-days') ? document.getElementById('staff-working-days').value : 26) || 26,
    basicAmt: parseFloat(document.getElementById('staff-basic') ? document.getElementById('staff-basic').value : 0) || 0,
    extraAmt: parseFloat(document.getElementById('staff-extra') ? document.getElementById('staff-extra').value : 0) || 0,
    totalSalary: parseFloat(document.getElementById('staff-total-salary') ? document.getElementById('staff-total-salary').value : 0) || 0,
    nrcNo: document.getElementById('staff-nrc').value,
    bankAccount: document.getElementById('staff-bank').value,
    phoneNo: document.getElementById('staff-phone').value,
    email: document.getElementById('staff-email').value,
    resignedDate: document.getElementById('staff-resigned').value,
    createdBy: window.AppState.currentUser || "System"
  };

  const action = isAdd ? 'saveStaffEntry' : 'updateStaffEntry';
  showToast("SUCCESS", "ဝန်ထမ်းအချက်အလက်အား သိမ်းဆည်းနေပါသည်...");

  try {
    const response = await callApi(action, entry);
    if (response && response.success) {
      showToast("SUCCESS", isAdd ? "ဝန်ထမ်းသစ်မှတ်တမ်း သိမ်းဆည်းပြီးပါပြီရှင်။" : "ဝန်ထမ်းမှတ်တမ်း ပြင်ဆင်ပြီးပါပြီရှင်။");
      loadStaffData(true);
    } else {
      showToast("ERROR", "မအောင်မြင်ပါ: " + (response.message || ""));
    }
  } catch (err) {
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
  }
}

function openAddModalStaff() {
  const form = document.getElementById('staff-form');
  if (form) form.reset();

  document.getElementById('staff-uniqueId').value = "";

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  document.getElementById('staff-joindate').value = `${yyyy}-${mm}-${dd}`;

  loadPayrollSettings();
  document.getElementById('staff-modal').classList.remove('hidden');
}

function closeStaffModal() {
  document.getElementById('staff-modal').classList.add('hidden');
}

/**
 * 💡 Delete Staff Handler
 */
async function deleteStaffEntry(uniqueId) {
  if (confirm("ဤဝန်ထမ်းမှတ်တမ်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလားရှင်?")) {
    showToast("SUCCESS", "မှတ်တမ်းကို ဖျက်သိမ်းနေပါသည်...");
    try {
      const response = await callApi('deleteStaffEntry', {
        uniqueId: uniqueId,
        category: window.HrState.staffCategory
      });

      if (response && response.success) {
        showToast("SUCCESS", "ဝန်ထမ်းမှတ်တမ်းအား ဖျက်သိမ်းပြီးပါပြီ။");
        loadStaffData(true);
      } else {
        showToast("ERROR", "ဖျက်သိမ်းမှု မအောင်မြင်ပါ: " + (response.message || ""));
      }
    } catch (err) {
      showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
    }
  }
}

/**
 * 💡 Export Staff List to CSV
 */
function exportToCSVStaff() {
  const data = window.HrState.staffData;
  if (!data || data.length === 0) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့် ဝန်ထမ်းစာရင်းမျှ မရှိပါရှင်။");
    return;
  }

  const isFT = (window.HrState.staffCategory === "Full Time");
  let csv = "";

  if (isFT) {
    csv = "NO,JOIN DATE,CATEGORY,STAFF ID,NAME,STAFF IDNAME,EDUCATION,POSITION,SALARY GRADE,WORKING DAYS,BASIC AMT,EXTRA AMT,TOTAL SALARY,BONUS,FUND,TOTAL NET AMT,RESIGNED DATE,STATUS,GENDER,NRC NO,BANK ACCOUNT,PHONE NO,EMAIL,UNPAID BONUS,UNPAID FUND,UNIQUEID\n";
    data.forEach(row => {
      csv += `${row.no},${row.joinDate},${row.category},${row.staffId},${row.name},"${row.staffIdName}",${row.education},${row.position},${row.salaryGrade || ''},${row.workingDays || 0},${row.basicAmt || 0},${row.extraAmt || 0},${row.totalSalary || 0},${row.bonus || 0},${row.fund || 0},${row.totalNetAmt || 0},${row.resignedDate || ''},${row.status},${row.gender},${row.nrcNo || ''},${row.bankAccount || ''},${row.phoneNo || ''},${row.email || ''},${row.unpaidBonus || 0},${row.unpaidFund || 0},${row.uniqueId}\n`;
    });
  } else {
    csv = "NO,JOIN DATE,CATEGORY,STAFF ID,NAME,STAFF IDNAME,EDUCATION,POSITION,TOTAL SALARY,TOTAL NET AMT,RESIGNED DATE,STATUS,GENDER,NRC NO,BANK ACCOUNT,PHONE NO,EMAIL,UNIQUEID\n";
    data.forEach(row => {
      csv += `${row.no},${row.joinDate},${row.category},${row.staffId},${row.name},"${row.staffIdName}",${row.education},${row.position},${row.totalSalary || 0},${row.totalNetAmt || 0},${row.resignedDate || ''},${row.status},${row.gender},${row.nrcNo || ''},${row.bankAccount || ''},${row.phoneNo || ''},${row.email || ''},${row.uniqueId}\n`;
    });
  }

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${window.HrState.staffCategory.replace(' ', '_')}_staff_list_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}