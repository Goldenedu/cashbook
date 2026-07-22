/**
 * GOLDEN ERP SYSTEM - STAFF LIST MANAGEMENT MODULE (FULL TIME & PART TIME)
 * File: js/staff.js
 */

window.StaffState = {
  category: 'Full Time', // 'Full Time' or 'Part Time'
  page: 1,
  limit: 50,
  totalRows: 0,
  activeData: [],
  searchVal: '',
  stats: { totalSalary: 0, totalBonus: 0, totalFund: 0, totalNetAmt: 0, maleCount: 0, femaleCount: 0, activeCount: 0 },
  payrollSettings: { grades: {}, bonus: 46000, fundRate: 0.05 }
};

/**
 * 💡 Switch Category (Full Time vs Part Time Staff)
 */
function switchStaffCategory(category) {
  window.StaffState.category = category;
  window.StaffState.page = 1;

  const titleEl = document.getElementById('staff-page-title');
  if (titleEl) titleEl.innerText = `${category} Staff List`;

  const ftFields = document.getElementById('staff-fulltime-fields');
  const ptFields = document.getElementById('staff-parttime-fields');

  if (category === 'Full Time') {
    if (ftFields) ftFields.classList.remove('hidden');
    if (ptFields) ptFields.classList.add('hidden');
  } else {
    if (ftFields) ftFields.classList.add('hidden');
    if (ptFields) ptFields.classList.remove('hidden');
  }

  loadStaffData(false);
}

/**
 * 💡 Load Staff List Data from Server
 */
async function loadStaffData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  const state = window.StaffState;

  try {
    const response = await callApi('getStaffData', {
      category: state.category,
      page: state.page,
      limit: state.limit,
      searchVal: state.searchVal
    }, 'GET');

    if (!isSilent) toggleLoading(false);

    if (response && response.data) {
      state.activeData = response.data;
      state.totalRows = response.totalRows || 0;
      state.stats = response.stats || {};

      updateStatsStaff();
      renderStaffTable();
      updatePaginationStaff();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Staff List:", err);
  }
}

/**
 * 💡 Load Payroll Settings (Grades A-J Rates)
 */
async function loadPayrollSettingsStaff() {
  try {
    const res = await callApi('getPayrollSettings', {}, 'GET');
    if (res && res.grades) {
      window.StaffState.payrollSettings = res;
    }
  } catch (err) {
    console.warn("Failed to load payroll settings:", err);
  }
}

/**
 * 💡 Auto-fill Basic Salary on Grade Selection
 */
function onSalaryGradeChangeStaff() {
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

  if (window.StaffState.payrollSettings && window.StaffState.payrollSettings.grades) {
    const rate = window.StaffState.payrollSettings.grades[key] || 0;
    if (basicInput) basicInput.value = rate;
  }
}

/**
 * 💡 Update Top KPI Stats Cards
 */
function updateStatsStaff() {
  const stats = window.StaffState.stats;
  const isFT = (window.StaffState.category === 'Full Time');
  const grid = document.getElementById('staff-kpi-grid');
  if (!grid) return;

  if (isFT) {
    grid.innerHTML = `
      <div class="stats-card p-5 rounded-xl flex items-start gap-4">
        <div class="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-400"><i class="fa-solid fa-money-bill-wave text-xl"></i></div>
        <div><p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Salary</p><h3 class="text-base font-extrabold text-white mt-1">${Number(stats.totalSalary || 0).toLocaleString('en-US')} MMK</h3></div>
      </div>
      <div class="stats-card p-5 rounded-xl flex items-start gap-4">
        <div class="p-3.5 rounded-lg bg-indigo-500/10 text-indigo-400"><i class="fa-solid fa-gift text-xl"></i></div>
        <div><p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Accrued Bonus</p><h3 class="text-base font-extrabold text-white mt-1">${Number(stats.totalBonus || 0).toLocaleString('en-US')} MMK</h3></div>
      </div>
      <div class="stats-card p-5 rounded-xl flex items-start gap-4">
        <div class="p-3.5 rounded-lg bg-teal-500/10 text-teal-400"><i class="fa-solid fa-piggy-bank text-xl"></i></div>
        <div><p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Accrued Fund</p><h3 class="text-base font-extrabold text-white mt-1">${Number(stats.totalFund || 0).toLocaleString('en-US')} MMK</h3></div>
      </div>
      <div class="stats-card p-5 rounded-xl flex items-start gap-4">
        <div class="p-3.5 rounded-lg bg-sky-500/10 text-sky-400"><i class="fa-solid fa-wallet text-xl"></i></div>
        <div><p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Net Amount</p><h3 class="text-base font-extrabold text-white mt-1">${Number(stats.totalNetAmt || 0).toLocaleString('en-US')} MMK</h3></div>
      </div>
    `;
  } else {
    grid.innerHTML = `
      <div class="stats-card p-5 rounded-xl flex items-start gap-4">
        <div class="p-3.5 rounded-lg bg-indigo-500/10 text-indigo-400"><i class="fa-solid fa-wallet text-xl"></i></div>
        <div><p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Net Amount</p><h3 class="text-base font-extrabold text-white mt-1">${Number(stats.totalNetAmt || 0).toLocaleString('en-US')} MMK</h3></div>
      </div>
      <div class="stats-card p-5 rounded-xl flex items-start gap-4">
        <div class="p-3.5 rounded-lg bg-blue-500/10 text-blue-400"><i class="fa-solid fa-mars text-xl"></i></div>
        <div><p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Male</p><h3 class="text-base font-extrabold text-white mt-1">${stats.maleCount || 0}</h3></div>
      </div>
      <div class="stats-card p-5 rounded-xl flex items-start gap-4">
        <div class="p-3.5 rounded-lg bg-rose-500/10 text-rose-400"><i class="fa-solid fa-venus text-xl"></i></div>
        <div><p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Female</p><h3 class="text-base font-extrabold text-white mt-1">${stats.femaleCount || 0}</h3></div>
      </div>
      <div class="stats-card p-5 rounded-xl flex items-start gap-4">
        <div class="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-400"><i class="fa-solid fa-user-check text-xl"></i></div>
        <div><p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active Staff</p><h3 class="text-base font-extrabold text-white mt-1">${stats.activeCount || 0}</h3></div>
      </div>
    `;
  }
}

/**
 * 💡 Render Table Grid Rows
 */
function renderStaffTable() {
  const tableBody = document.getElementById('staff-table-body');
  if (!tableBody) return;

  const data = window.StaffState.activeData;
  const isFT = (window.StaffState.category === 'Full Time');

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="${isFT ? 23 : 14}" class="text-center py-8 text-slate-500 font-bold">No staff members found.</td></tr>`;
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
          <td>${escapeHtml(row.education || '-')}</td>
          <td>${escapeHtml(row.position || '-')}</td>
          <td>${escapeHtml(row.salaryGrade || '-')}</td>
          <td class="text-right">${row.workingDays || 0}</td>
          <td class="text-right text-emerald-400">${Number(row.basicAmt || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-rose-400">${Number(row.extraAmt || 0).toLocaleString('en-US')}</td>
          <td class="text-right">${Number(row.totalSalary || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-emerald-400">${Number(row.bonus || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-teal-400">${Number(row.fund || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-indigo-400 font-bold">${Number(row.totalNetAmt || 0).toLocaleString('en-US')}</td>
          <td><span class="px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">${escapeHtml(row.status)}</span></td>
          <td>${escapeHtml(row.gender || '-')}</td>
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
          <td>${escapeHtml(row.education || '-')}</td>
          <td>${escapeHtml(row.position || '-')}</td>
          <td class="text-right">${Number(row.totalSalary || 0).toLocaleString('en-US')}</td>
          <td class="text-right text-indigo-400 font-bold">${Number(row.totalNetAmt || 0).toLocaleString('en-US')}</td>
          <td><span class="px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">${escapeHtml(row.status)}</span></td>
          <td>${escapeHtml(row.gender || '-')}</td>
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

function updatePaginationStaff() {
  const state = window.StaffState;
  const info = document.getElementById('staff-pagination-info');
  if (info) {
    const start = state.totalRows === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.totalRows);
    info.innerHTML = `Showing <span class="text-indigo-400 font-extrabold">${start}</span> to <span class="text-indigo-400 font-extrabold">${end}</span> of <span class="text-indigo-400 font-extrabold">${state.totalRows}</span> entries`;
  }
}

function changePageStaff(dir) {
  const state = window.StaffState;
  if (dir === -1 && state.page > 1) {
    state.page--;
    loadStaffData(false);
  } else if (dir === 1 && (state.page * state.limit) < state.totalRows) {
    state.page++;
    loadStaffData(false);
  }
}

let searchTimeoutStaff;
function onSearchInputStaff() {
  clearTimeout(searchTimeoutStaff);
  searchTimeoutStaff = setTimeout(() => {
    const input = document.getElementById('staff-search');
    window.StaffState.searchVal = input ? input.value.trim() : '';
    window.StaffState.page = 1;
    loadStaffData(true);
  }, 300);
}

/**
 * 💡 Open Modal for New Staff
 */
function openAddModalStaff() {
  const form = document.getElementById('staff-form');
  if (form) form.reset();

  document.getElementById('staff-uniqueId').value = "";

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  document.getElementById('staff-joindate').value = `${yyyy}-${mm}-${dd}`;

  loadPayrollSettingsStaff();
  document.getElementById('staff-modal').classList.remove('hidden');
}

function closeStaffModal() {
  document.getElementById('staff-modal').classList.add('hidden');
}

/**
 * 💡 Save / Update Staff Entry
 */
async function saveStaffForm(e) {
  e.preventDefault();
  closeStaffModal();

  const uniqueId = document.getElementById('staff-uniqueId').value;
  const isAdd = (!uniqueId);

  const entry = {
    uniqueId: uniqueId,
    joinDate: document.getElementById('staff-joindate').value,
    category: window.StaffState.category,
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

/**
 * 💡 Edit Staff Member
 */
function editStaffEntry(uniqueId) {
  const row = window.StaffState.activeData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "မူရင်းဒေတာကို ရှာမတွေ့ပါရှင်။");
    return;
  }

  openAddModalStaff();

  document.getElementById('staff-uniqueId').value = row.uniqueId;
  document.getElementById('staff-joindate').value = row.joinDate;
  document.getElementById('staff-name').value = row.name || "";
  document.getElementById('staff-education').value = row.education || "";
  document.getElementById('staff-position').value = row.position || "";
  document.getElementById('staff-nrc').value = row.nrcNo || "";
  document.getElementById('staff-bank').value = row.bankAccount || "";
  document.getElementById('staff-phone').value = row.phoneNo || "";
  document.getElementById('staff-email').value = row.email || "";
  document.getElementById('staff-resigned').value = row.resignedDate || "";

  if (window.StaffState.category === 'Full Time') {
    if (document.getElementById('staff-grade')) document.getElementById('staff-grade').value = row.salaryGrade || "";
    if (document.getElementById('staff-working-days')) document.getElementById('staff-working-days').value = row.workingDays || 26;
    if (document.getElementById('staff-basic')) document.getElementById('staff-basic').value = row.basicAmt || 0;
    if (document.getElementById('staff-extra')) document.getElementById('staff-extra').value = row.extraAmt || 0;
  } else {
    if (document.getElementById('staff-total-salary')) document.getElementById('staff-total-salary').value = row.totalSalary || 0;
  }
}

/**
 * 💡 Delete Staff Member
 */
async function deleteStaffEntry(uniqueId) {
  if (confirm("ဤဝန်ထမ်းမှတ်တမ်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလားရှင်?")) {
    showToast("SUCCESS", "မှတ်တမ်းကို ဖျက်သိမ်းနေပါသည်...");
    try {
      const response = await callApi('deleteStaffEntry', {
        uniqueId: uniqueId,
        category: window.StaffState.category
      });

      if (response && response.success) {
        showToast("SUCCESS", "ဝန်ထမ်းမှတ်တမ်းအား ဖျက်သိမ်းပြီးပါပြီရှင်။");
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
 * 💡 CSV Export
 */
function exportToCSVStaff() {
  const data = window.StaffState.activeData;
  if (!data || data.length === 0) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့် ဝန်ထမ်းစာရင်းမျှ မရှိပါရှင်။");
    return;
  }

  const isFT = (window.StaffState.category === "Full Time");
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
  link.setAttribute("download", `${window.StaffState.category.replace(' ', '_')}_staff_list_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}