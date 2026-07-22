/**
 * GOLDEN ERP SYSTEM - HR PAYROLL EXPENSE MODULE
 * File: js/hr.js
 * 💡 19-Column Schema (ID PID Removed) + Auto-Fill Salary/Bonus/Fund/Description Logic
 */

window.HrPayrollState = {
  page: 1,
  limit: 30,
  totalRows: 0,
  activeData: [],
  searchVal: '',
  stats: { totalIncome: 0, totalExpense: 0, balance: 0 },
  fullTimeCache: [],
  partTimeCache: []
};

/**
 * 💡 Load HR Payroll Expense Data
 */
async function loadHrPayrollData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  const state = window.HrPayrollState;

  try {
    const response = await callApi('getExpenseData', {
      bookName: 'HR Payroll Exp Book',
      page: state.page,
      limit: state.limit,
      searchVal: state.searchVal,
      role: window.AppState.currentUserRole
    }, 'GET');

    if (!isSilent) toggleLoading(false);

    if (response && response.data) {
      state.activeData = response.data;
      state.totalRows = response.totalRows || 0;
      state.stats = response.stats || { totalIncome: 0, totalExpense: 0, balance: 0 };

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
  const stats = window.HrPayrollState.stats;
  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };

  setT('hr-pay-total-income', Number(stats.totalIncome || 0).toLocaleString('en-US') + " MMK");
  setT('hr-pay-total-expense', Number(stats.totalExpense || 0).toLocaleString('en-US') + " MMK");
  setT('hr-pay-balance', Number(stats.balance || 0).toLocaleString('en-US') + " MMK");
  setT('hr-pay-entries-count', window.HrPayrollState.totalRows.toLocaleString('en-US'));
}

/**
 * 💡 Render Payroll Table (15 Visual Columns - ID PID Removed)
 */
function renderHrPayrollTable() {
  const tableBody = document.getElementById('hr-payroll-table-body');
  if (!tableBody) return;

  const data = window.HrPayrollState.activeData;

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="15" class="text-center py-8 text-slate-500 font-bold">No payroll expense entries found.</td></tr>`;
    return;
  }

  const isViewer = (window.AppState ? window.AppState.currentUserRole === "Viewer" : false);

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
        <td class="min-w-[280px] max-w-md truncate" title="${escapeHtml(row.description)}">${escapeHtml(row.description)}</td>
        <td class="font-bold">${escapeHtml(row.method) || '-'}</td>
        <td class="text-right text-emerald-400 font-semibold">${row.debit > 0 ? Number(row.debit).toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
        <td class="text-right text-rose-400 font-semibold">${row.credit > 0 ? Number(row.credit).toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
        <td class="text-right text-slate-400 font-bold">${Number(row.balances).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="text-right text-emerald-400 font-bold">${Number(row.unpaidBonus || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="text-right text-teal-400 font-bold">${Number(row.unpaidFund || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="text-center">${mailBadge}</td>
        <td class="font-mono text-indigo-300">${escapeHtml(row.vrNo || '-')}</td>
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
  const state = window.HrPayrollState;
  const info = document.getElementById('hr-pay-pagination-info');
  if (info) {
    const start = state.totalRows === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.totalRows);
    info.innerHTML = `Showing <span class="text-indigo-400 font-extrabold">${start}</span> to <span class="text-indigo-400 font-extrabold">${end}</span> of <span class="text-indigo-400 font-extrabold">${state.totalRows}</span> entries`;
  }

  const prevBtn = document.getElementById('hr-pay-btn-prev');
  if (prevBtn) prevBtn.disabled = (state.page === 1);

  const nextBtn = document.getElementById('hr-pay-btn-next');
  if (nextBtn) nextBtn.disabled = (state.page * state.limit >= state.totalRows);
}

function changePageHrPayroll(dir) {
  const state = window.HrPayrollState;
  if (dir === -1 && state.page > 1) {
    state.page--;
    loadHrPayrollData(false);
  } else if (dir === 1 && (state.page * state.limit) < state.totalRows) {
    state.page++;
    loadHrPayrollData(false);
  }
}

let searchTimeoutHrPay;
function onSearchInputHrPayroll() {
  clearTimeout(searchTimeoutHrPay);
  searchTimeoutHrPay = setTimeout(() => {
    const input = document.getElementById('hr-payroll-search');
    window.HrPayrollState.searchVal = input ? input.value.trim() : '';
    window.HrPayrollState.page = 1;
    loadHrPayrollData(true);
  }, 300);
}

/**
 * 💡 Fetch Staff Lists for Auto-Fill Lookups
 */
async function ensureStaffCachesLoaded() {
  if (window.HrPayrollState.fullTimeCache.length === 0) {
    try {
      const ftRes = await callApi('getStaffData', { category: 'Full Time', page: 1, limit: 1000 }, 'GET');
      if (ftRes && ftRes.data) window.HrPayrollState.fullTimeCache = ftRes.data;
    } catch (e) { console.warn("FT Cache Error:", e); }
  }

  if (window.HrPayrollState.partTimeCache.length === 0) {
    try {
      const ptRes = await callApi('getStaffData', { category: 'Part Time', page: 1, limit: 1000 }, 'GET');
      if (ptRes && ptRes.data) window.HrPayrollState.partTimeCache = ptRes.data;
    } catch (e) { console.warn("PT Cache Error:", e); }
  }
}

/**
 * 💡 AUTO-FILL SALARY, BONUS, FUND & DESCRIPTION ON STAFF ID / CATEGORY CHANGE
 */
async function onStaffIdChangePayroll() {
  const staffIdRaw = document.getElementById('hr-pay-staff-id') ? document.getElementById('hr-pay-staff-id').value.trim() : '';
  const category = document.getElementById('hr-pay-category') ? document.getElementById('hr-pay-category').value : '';
  const dateVal = document.getElementById('hr-pay-date') ? document.getElementById('hr-pay-date').value : '';

  if (!staffIdRaw) return;

  const parsedId = parseInt(staffIdRaw.replace(/[^\d]/g, ""), 10);
  if (isNaN(parsedId)) return;

  // Calculate Month-Year suffix (e.g. 2026-07-22 -> Jul-26)
  let mySuffix = "MMM-yy";
  if (dateVal) {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      mySuffix = `${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
    }
  }

  await ensureStaffCachesLoaded();

  const creditInput = document.getElementById('hr-pay-credit');
  const bonusInput = document.getElementById('hr-pay-unpaid-bonus');
  const fundInput = document.getElementById('hr-pay-unpaid-fund');
  const descInput = document.getElementById('hr-pay-description');

  // 1. Full Time Salary
  if (category === "Full Time Salary") {
    const staff = window.HrPayrollState.fullTimeCache.find(s => parseInt(String(s.staffId).replace(/[^\d]/g, ""), 10) === parsedId);
    if (staff) {
      if (creditInput) creditInput.value = staff.totalSalary || 0;
      if (bonusInput) bonusInput.value = staff.bonus || 0;
      if (fundInput) fundInput.value = staff.fund || 0;
      if (descInput) descInput.value = `${staff.staffIdName}, Salary ${mySuffix}`;
    }
  }
  // 2. Part Time Salary
  else if (category === "Part Time Salary") {
    const staff = window.HrPayrollState.partTimeCache.find(s => parseInt(String(s.staffId).replace(/[^\d]/g, ""), 10) === parsedId);
    if (staff) {
      if (creditInput) creditInput.value = staff.totalSalary || 0;
      if (bonusInput) bonusInput.value = 0;
      if (fundInput) fundInput.value = 0;
      if (descInput) descInput.value = `${staff.staffIdName}, Salary ${mySuffix}`;
    }
  }
  // 3. Full Time Bonus
  else if (category === "Full Time Bonus") {
    const staff = window.HrPayrollState.fullTimeCache.find(s => parseInt(String(s.staffId).replace(/[^\d]/g, ""), 10) === parsedId);
    if (staff) {
      if (creditInput) creditInput.value = staff.unpaidBonus || 0;
      if (bonusInput) bonusInput.value = staff.unpaidBonus || 0;
      if (fundInput) fundInput.value = 0;
      if (descInput) descInput.value = `${staff.staffIdName}, Bonus ${mySuffix}`;
    }
  }
  // 4. Full Time Fund
  else if (category === "Full Time Fund") {
    const staff = window.HrPayrollState.fullTimeCache.find(s => parseInt(String(s.staffId).replace(/[^\d]/g, ""), 10) === parsedId);
    if (staff) {
      if (creditInput) creditInput.value = staff.unpaidFund || 0;
      if (bonusInput) bonusInput.value = 0;
      if (fundInput) fundInput.value = staff.unpaidFund || 0;
      if (descInput) descInput.value = `${staff.staffIdName}, Fund ${mySuffix}`;
    }
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

  ensureStaffCachesLoaded();
  document.getElementById('hr-payroll-modal').classList.remove('hidden');
}

function closeHrPayrollModal() {
  document.getElementById('hr-payroll-modal').classList.add('hidden');
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
  showToast("SUCCESS", "လစာစာရင်းအား သိမ်းဆည်းနေပါသည်...");
  toggleLoading(true);

  try {
    const response = await callApi(action, entry);
    toggleLoading(false);

    if (response && response.success) {
      showToast("SUCCESS", isAdd ? "HR Payroll စာရင်းသစ် သိမ်းဆည်းပြီးပါပြီရှင်။" : "HR Payroll စာရင်း ပြင်ဆင်ပြီးပါပြီရှင်။");
      loadHrPayrollData(true);
    } else {
      showToast("ERROR", "မအောင်မြင်ပါ: " + (response ? response.message : ""));
    }
  } catch (err) {
    toggleLoading(false);
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
  }
}

function editHrPayrollEntry(uniqueId) {
  const row = window.HrPayrollState.activeData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "မူရင်းဒေတာကို ရှာမတွေ့ပါရှင်။");
    return;
  }

  openAddModalHrPayroll();

  document.getElementById('hr-pay-uniqueId').value = row.uniqueId;
  document.getElementById('hr-pay-date').value = row.date;
  document.getElementById('hr-pay-category').value = row.category;
  document.getElementById('hr-pay-staff-id').value = row.id || "";
  document.getElementById('hr-pay-method').value = row.method || "Cash";
  document.getElementById('hr-pay-debit').value = row.debit || 0;
  document.getElementById('hr-pay-credit').value = row.credit || 0;
  document.getElementById('hr-pay-unpaid-bonus').value = row.unpaidBonus || 0;
  document.getElementById('hr-pay-unpaid-fund').value = row.unpaidFund || 0;
  document.getElementById('hr-pay-description').value = row.description || "";
}

async function deleteHrPayrollEntry(uniqueId) {
  if (confirm("ဤ HR Payroll စာရင်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလားရှင်?")) {
    showToast("SUCCESS", "စာရင်းကို ဖျက်သိမ်းနေပါသည်...");
    toggleLoading(true);

    try {
      const response = await callApi('deleteExpenseEntry', {
        uniqueId: uniqueId,
        bookName: 'HR Payroll Exp Book'
      });

      toggleLoading(false);

      if (response && response.success) {
        showToast("SUCCESS", "စာရင်းအား အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီရှင်။");
        loadHrPayrollData(true);
      } else {
        showToast("ERROR", "ဖျက်သိမ်းမှု မအောင်မြင်ပါ: " + (response ? response.message : ""));
      }
    } catch (err) {
      toggleLoading(false);
      showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
    }
  }
}

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
        showToast("ERROR", "မအောင်မြင်ပါ: " + (response ? response.message : ""));
      }
    } catch (err) {
      toggleLoading(false);
      showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
    }
  }
}

function exportToCSVHrPayroll() {
  const data = window.HrPayrollState.activeData;
  if (!data || data.length === 0) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှ မရှိပါရှင်။");
    return;
  }

  let csv = "NO,DATE,CATEGORY,DESCRIPTION,METHOD,DEBIT,CREDIT,BALANCES,UNPAID BONUS,UNPAID FUND,SEND MAIL,VR NO,MY,FY,UNIQUEID\n";
  data.forEach(row => {
    let desc = `"${(row.description || '').replace(/"/g, '""')}"`;
    csv += `${row.no},${row.date},${row.category},${desc},${row.method},${row.debit},${row.credit},${row.balances},${row.unpaidBonus || 0},${row.unpaidFund || 0},${row.sendMail || ''},${row.vrNo || ''},${row.my || ''},${row.fy || ''},${row.uniqueId}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `hr_payroll_expense_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
