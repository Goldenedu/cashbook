/**
 * GOLDEN ERP SYSTEM - STAFF MODULE
 * File: js/staff.js
 */

// 💡 Loading & Toast Safe Guards
if (typeof window.showLoading !== 'function') {
  window.showLoading = function(show) {
    const el = document.getElementById('loading-overlay');
    if (el) el.classList.toggle('hidden', !show);
  };
}

if (typeof window.showToast !== 'function') {
  window.showToast = function(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (container) {
      const toast = document.createElement('div');
      toast.className = `p-3 rounded-lg text-xs font-bold text-white shadow-xl ${
        type === 'error' ? 'bg-rose-600' : type === 'success' ? 'bg-emerald-600' : 'bg-indigo-600'
      }`;
      toast.textContent = msg;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } else {
      console.log(`[Toast - ${type}]: ${msg}`);
    }
  };
}

let gStaffCategory = 'Full Time'; // 'Full Time' or 'Part Time'
let gStaffPage = 1;
let gStaffLimit = 30;
let gStaffSearch = '';
let gStaffData = [];

// Dynamic Payroll Settings cache read from FullTime!I1:U2
let gPayrollSettings = { grades: {}, bonus: 0, fundRate: 0 };

async function switchStaffCategory(category) {
  gStaffCategory = category;
  gStaffPage = 1;

  const btnFT = document.getElementById('staff-tab-ft');
  const btnPT = document.getElementById('staff-tab-pt');
  const pageTitle = document.getElementById('staff-page-title');

  if (category === 'Full Time') {
    if (btnFT) btnFT.className = "px-4 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/10";
    if (btnPT) btnPT.className = "px-4 py-2 rounded-lg text-xs font-bold transition-all bg-slate-800 text-slate-400 hover:text-white";
    if (pageTitle) pageTitle.innerHTML = `<i class="fa-solid fa-users text-indigo-400"></i> Full Time Staff List (FID)`;
  } else {
    if (btnFT) btnFT.className = "px-4 py-2 rounded-lg text-xs font-bold transition-all bg-slate-800 text-slate-400 hover:text-white";
    if (btnPT) btnPT.className = "px-4 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white shadow-lg shadow-indigo-600/10";
    if (pageTitle) pageTitle.innerHTML = `<i class="fa-solid fa-user-clock text-indigo-400"></i> Part Time Staff List (PID)`;
  }

  renderStaffTableHead();
  await loadStaffData(false);
}

function renderStaffTableHead() {
  const thead = document.getElementById('staff-table-head');
  if (!thead) return;

  if (gStaffCategory === 'Full Time') {
    thead.innerHTML = `
      <tr class="bg-[#0e172a]">
        <th scope="col" class="w-12 text-center text-slate-400 text-xs py-3">NO</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">JOIN DATE</th>
        <th scope="col" class="min-w-[200px] text-slate-400 text-xs py-3">STAFF IDNAME</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">EDUCATION</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">POSITION</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">SALARY GRADE</th>
        <th scope="col" class="w-28 text-right text-slate-400 text-xs py-3">WORKING DAYS</th>
        <th scope="col" class="w-32 text-right text-slate-400 text-xs py-3">BASIC AMT</th>
        <th scope="col" class="w-32 text-right text-slate-400 text-xs py-3">EXTRA AMT</th>
        <th scope="col" class="w-32 text-right text-slate-400 text-xs py-3">TOTAL SALARY</th>
        <th scope="col" class="w-28 text-right text-emerald-400 text-xs py-3">BONUS</th>
        <th scope="col" class="w-28 text-right text-teal-400 text-xs py-3">FUND</th>
        <th scope="col" class="w-36 text-right text-indigo-400 text-xs py-3">TOTAL NET AMT</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">STATUS</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">GENDER</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">NRC NO</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">BANK ACCOUNT</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">PHONE NO</th>
        <th scope="col" class="w-44 text-slate-400 text-xs py-3">EMAIL</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">FUND DATE</th>
        <th scope="col" class="w-32 text-right text-emerald-400 text-xs py-3">UNPAID BONUS</th>
        <th scope="col" class="w-32 text-right text-teal-400 text-xs py-3">UNPAID FUND</th>
        <th scope="col" class="w-24 text-center text-slate-400 text-xs py-3 right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg">ACTION</th>
      </tr>`;
  } else {
    thead.innerHTML = `
      <tr class="bg-[#0e172a]">
        <th scope="col" class="w-12 text-center text-slate-400 text-xs py-3">NO</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">JOIN DATE</th>
        <th scope="col" class="min-w-[200px] text-slate-400 text-xs py-3">STAFF IDNAME</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">EDUCATION</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">POSITION</th>
        <th scope="col" class="w-32 text-right text-indigo-400 text-xs py-3">TOTAL SALARY</th>
        <th scope="col" class="w-36 text-right text-indigo-400 text-xs py-3">TOTAL NET AMT</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">STATUS</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">GENDER</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">NRC NO</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">BANK ACCOUNT</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">PHONE NO</th>
        <th scope="col" class="w-44 text-slate-400 text-xs py-3">EMAIL</th>
        <th scope="col" class="w-24 text-center text-slate-400 text-xs py-3 right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg">ACTION</th>
      </tr>`;
  }
}

async function loadStaffData(useCache = false) {
  try {
    showLoading(true);
    renderStaffTableHead();

    const res = await callApi({
      action: 'getStaffData',
      category: gStaffCategory,
      page: gStaffPage,
      limit: gStaffLimit,
      searchVal: gStaffSearch
    });

    if (res && res.success) {
      gStaffData = res.data || [];
      renderStaffKpis(res.stats || {});
      renderStaffTable(gStaffData);
      renderStaffPagination(res.totalRows || 0);
    } else {
      showToast(res.message || "Staff ဒေတာ ရယူ၍ မရပါ", "error");
    }
  } catch (err) {
    showToast("Error loading staff data: " + err.message, "error");
  } finally {
    showLoading(false);
  }
}

function renderStaffKpis(stats) {
  const grid = document.getElementById('staff-kpi-grid');
  if (!grid) return;

  grid.innerHTML = `
    <div class="stats-card p-5 rounded-xl flex items-start gap-4">
      <div class="p-3.5 rounded-lg bg-indigo-500/10 text-indigo-400"><i class="fa-solid fa-users text-xl"></i></div>
      <div>
        <p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active Force</p>
        <h3 class="text-base font-extrabold text-white mt-1">${stats.activeCount || 0}</h3>
      </div>
    </div>
    <div class="stats-card p-5 rounded-xl flex items-start gap-4">
      <div class="p-3.5 rounded-lg bg-emerald-500/10 text-emerald-400"><i class="fa-solid fa-money-bill-wave text-xl"></i></div>
      <div>
        <p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Total Net Payroll</p>
        <h3 class="text-base font-extrabold text-white mt-1">${(stats.totalNetAmt || 0).toLocaleString()} MMK</h3>
      </div>
    </div>
    <div class="stats-card p-5 rounded-xl flex items-start gap-4">
      <div class="p-3.5 rounded-lg bg-sky-500/10 text-sky-400"><i class="fa-solid fa-mars text-xl"></i></div>
      <div>
        <p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Male Staff</p>
        <h3 class="text-base font-extrabold text-white mt-1">${stats.maleCount || 0}</h3>
      </div>
    </div>
    <div class="stats-card p-5 rounded-xl flex items-start gap-4">
      <div class="p-3.5 rounded-lg bg-rose-500/10 text-rose-400"><i class="fa-solid fa-venus text-xl"></i></div>
      <div>
        <p class="text-[10px] uppercase font-bold tracking-wider text-slate-500">Female Staff</p>
        <h3 class="text-base font-extrabold text-white mt-1">${stats.femaleCount || 0}</h3>
      </div>
    </div>
  `;
}

function renderStaffTable(data) {
  const tbody = document.getElementById('staff-table-body');
  if (!tbody) return;

  if (!data || data.length === 0) {
    const colSpan = (gStaffCategory === 'Full Time') ? 23 : 14;
    tbody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center py-8 text-slate-500 font-bold">Staff စာရင်း မရှိသေးပါ</td></tr>`;
    return;
  }

  if (gStaffCategory === 'Full Time') {
    tbody.innerHTML = data.map((item, idx) => `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="text-center text-slate-400 py-3">${item.no || (idx + 1)}</td>
        <td class="font-mono text-slate-300 py-3">${item.joinDate || ''}</td>
        <td class="font-bold text-white py-3">${item.staffIdName || item.name}</td>
        <td class="text-slate-300 py-3">${item.education || ''}</td>
        <td class="text-indigo-300 font-semibold py-3">${item.position || ''}</td>
        <td class="font-bold text-amber-400 py-3">${item.salaryGrade || 'Non'}</td>
        <td class="text-right font-bold text-slate-200 py-3">${item.workingDays || 0}</td>
        <td class="text-right font-bold text-emerald-400 py-3">${(item.basicAmt || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-rose-400 py-3">${(item.extraAmt || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-slate-200 py-3">${(item.totalSalary || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-emerald-400 py-3">${(item.bonus || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-teal-400 py-3">${(item.fund || 0).toLocaleString()}</td>
        <td class="text-right font-extrabold text-indigo-400 py-3">${(item.totalNetAmt || 0).toLocaleString()}</td>
        <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}">${item.status || 'Active'}</span></td>
        <td class="text-slate-300 py-3">${item.gender || 'Male'}</td>
        <td class="font-mono text-xs text-slate-300 py-3">${item.nrcNo || ''}</td>
        <td class="font-mono text-xs text-slate-300 py-3">${item.bankAccount || ''}</td>
        <td class="font-mono text-xs text-slate-300 py-3">${item.phoneNo || ''}</td>
        <td class="font-mono text-xs text-slate-300 py-3">${item.email || ''}</td>
        <td class="font-mono text-xs text-slate-300 py-3">${item.fundDate || ''}</td>
        <td class="text-right font-bold text-emerald-400 py-3">${(item.unpaidBonus || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-teal-400 py-3">${(item.unpaidFund || 0).toLocaleString()}</td>
        <td class="text-center py-3 right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg">
          <div class="flex items-center justify-center gap-2">
            <button onclick="editStaffEntry('${item.uniqueId}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded transition"><i class="fa-solid fa-pen-to-square text-xs"></i></button>
            <button onclick="deleteStaffEntry('${item.uniqueId}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded transition"><i class="fa-solid fa-trash-can text-xs"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  } else {
    tbody.innerHTML = data.map((item, idx) => `
      <tr class="hover:bg-slate-800/40 transition">
        <td class="text-center text-slate-400 py-3">${item.no || (idx + 1)}</td>
        <td class="font-mono text-slate-300 py-3">${item.joinDate || ''}</td>
        <td class="font-bold text-white py-3">${item.staffIdName || item.name}</td>
        <td class="text-slate-300 py-3">${item.education || ''}</td>
        <td class="text-indigo-300 font-semibold py-3">${item.position || ''}</td>
        <td class="text-right font-bold text-indigo-400 py-3">${(item.totalSalary || 0).toLocaleString()}</td>
        <td class="text-right font-extrabold text-indigo-400 py-3">${(item.totalNetAmt || 0).toLocaleString()}</td>
        <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}">${item.status || 'Active'}</span></td>
        <td class="text-slate-300 py-3">${item.gender || 'Male'}</td>
        <td class="font-mono text-xs text-slate-300 py-3">${item.nrcNo || ''}</td>
        <td class="font-mono text-xs text-slate-300 py-3">${item.bankAccount || ''}</td>
        <td class="font-mono text-xs text-slate-300 py-3">${item.phoneNo || ''}</td>
        <td class="font-mono text-xs text-slate-300 py-3">${item.email || ''}</td>
        <td class="text-center py-3 right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg">
          <div class="flex items-center justify-center gap-2">
            <button onclick="editStaffEntry('${item.uniqueId}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded transition"><i class="fa-solid fa-pen-to-square text-xs"></i></button>
            <button onclick="deleteStaffEntry('${item.uniqueId}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded transition"><i class="fa-solid fa-trash-can text-xs"></i></button>
          </div>
        </td>
      </tr>
    `).join('');
  }
}

function renderStaffPagination(totalRows) {
  const info = document.getElementById('staff-pagination-info');
  const btnPrev = document.getElementById('staff-btn-prev');
  const btnNext = document.getElementById('staff-btn-next');

  const totalPages = Math.ceil(totalRows / gStaffLimit) || 1;
  if (info) info.textContent = `Showing Page ${gStaffPage} of ${totalPages} (${totalRows} total entries)`;

  if (btnPrev) btnPrev.disabled = (gStaffPage <= 1);
  if (btnNext) btnNext.disabled = (gStaffPage >= totalPages);
}

function changePageStaff(delta) {
  gStaffPage += delta;
  if (gStaffPage < 1) gStaffPage = 1;
  loadStaffData(false);
}

function onSearchInputStaff() {
  const input = document.getElementById('staff-search-input');
  gStaffSearch = input ? input.value : '';
  gStaffPage = 1;
  loadStaffData(false);
}

async function populateDropdownsStaff() {
  try {
    const res = await callApi({ action: 'getPayrollSettings' });
    if (res && res.success && res.data) {
      gPayrollSettings = res.data;
    }
  } catch (err) {
    console.warn("Could not load payroll settings from API:", err);
  }

  // 1. Education Dropdown
  const eduSelect = document.getElementById('staff-education');
  if (eduSelect) {
    const list = ["Master", "Bachelor Degree", "Undergraduate", "Diploma", "High School", "Middle School", "Primary School", "Other"];
    eduSelect.innerHTML = list.map(e => `<option value="${e}">${e}</option>`).join('');
  }

  // 2. Position Dropdown
  const posSelect = document.getElementById('staff-position');
  if (posSelect) {
    const list = [
      "Principal", "Vice Principal", "Head Teacher", "Senior Teacher", "Junior Teacher",
      "Primary Teacher", "Pre School Teacher", "Assistant Teacher", "Office Staff",
      "Accountant", "Cashier", "HR Staff", "IT Support", "Driver", "Security", "Cleaner", "Kitchen Staff"
    ];
    posSelect.innerHTML = list.map(p => `<option value="${p}">${p}</option>`).join('');
  }

  // 3. Salary Grade Dropdown (Sheet မှ ရရှိသော dynamic grades)
  const gradeSelect = document.getElementById('staff-grade');
  if (gradeSelect) {
    let html = '<option value="Non">Non-Grade</option>';
    const grades = gPayrollSettings.grades || {};
    Object.keys(grades).forEach(g => {
      html += `<option value="${g}">${g} (${grades[g].toLocaleString()} MMK)</option>`;
    });
    gradeSelect.innerHTML = html;
  }
}

function onSalaryGradeChangeStaff() {
  const gradeVal = document.getElementById('staff-grade')?.value || 'Non';
  const basicInput = document.getElementById('staff-basic');
  
  if (basicInput && gPayrollSettings.grades && gPayrollSettings.grades[gradeVal]) {
    basicInput.value = gPayrollSettings.grades[gradeVal];
  } else if (basicInput && gradeVal === 'Non') {
    basicInput.value = 0;
  }
  
  calculateLiveStaffSalary();
}

function calculateLiveStaffSalary() {
  const basic = parseFloat(document.getElementById('staff-basic')?.value || 0);
  const extra = parseFloat(document.getElementById('staff-extra')?.value || 0);
  const days = parseFloat(document.getElementById('staff-working-days')?.value || 26);
  const isResigned = !!document.getElementById('staff-resigned')?.value;

  const bonusConfig = gPayrollSettings.bonus || 0;
  const fundRateConfig = gPayrollSettings.fundRate || 0;

  const totalSalary = isResigned ? 0 : Math.round((basic + extra) * (days / 26));
  const bonus = isResigned ? 0 : bonusConfig;
  const fund = isResigned ? 0 : Math.round(totalSalary * fundRateConfig);
  const totalNet = totalSalary + bonus + fund;

  const pSalary = document.getElementById('preview-total-salary');
  const pBonus = document.getElementById('preview-bonus');
  const pFund = document.getElementById('preview-fund');
  const pNet = document.getElementById('preview-total-net');

  if (pSalary) pSalary.textContent = `${totalSalary.toLocaleString()} MMK`;
  if (pBonus) pBonus.textContent = `${bonus.toLocaleString()} MMK`;
  if (pFund) pFund.textContent = `${fund.toLocaleString()} MMK`;
  if (pNet) pNet.textContent = `${totalNet.toLocaleString()} MMK`;
}

async function openAddModalStaff() {
  await populateDropdownsStaff();

  const form = document.getElementById('staff-form');
  if (form) form.reset();

  const uid = document.getElementById('staff-uniqueId');
  if (uid) uid.value = '';

  const joinDate = document.getElementById('staff-joindate');
  if (joinDate) joinDate.value = new Date().toISOString().slice(0, 10);

  const title = document.getElementById('staff-form-title');
  if (title) title.textContent = `Add ${gStaffCategory} Record`;

  const ftFields = document.getElementById('staff-fulltime-fields');
  const ptFields = document.getElementById('staff-parttime-fields');

  if (gStaffCategory === 'Full Time') {
    if (ftFields) ftFields.classList.remove('hidden');
    if (ptFields) ptFields.classList.add('hidden');
  } else {
    if (ftFields) ftFields.classList.add('hidden');
    if (ptFields) ptFields.classList.remove('hidden');
  }

  calculateLiveStaffSalary();
  const modal = document.getElementById('staff-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeStaffModal() {
  const modal = document.getElementById('staff-modal');
  if (modal) modal.classList.add('hidden');
}

async function editStaffEntry(uniqueId) {
  const item = gStaffData.find(s => s.uniqueId === uniqueId);
  if (!item) return;

  await openAddModalStaff();

  const title = document.getElementById('staff-form-title');
  if (title) title.textContent = `Edit ${gStaffCategory} Record`;

  document.getElementById('staff-uniqueId').value = item.uniqueId;
  document.getElementById('staff-joindate').value = item.joinDate || '';
  document.getElementById('staff-name').value = item.name || '';
  document.getElementById('staff-education').value = item.education || '';
  document.getElementById('staff-position').value = item.position || '';

  if (gStaffCategory === 'Full Time') {
    document.getElementById('staff-grade').value = item.salaryGrade || 'Non';
    document.getElementById('staff-working-days').value = item.workingDays || 26;
    document.getElementById('staff-basic').value = item.basicAmt || 0;
    document.getElementById('staff-extra').value = item.extraAmt || 0;
  } else {
    document.getElementById('staff-total-salary').value = item.totalSalary || 0;
  }

  document.getElementById('staff-nrc').value = item.nrcNo || '';
  document.getElementById('staff-bank').value = item.bankAccount || '';
  document.getElementById('staff-phone').value = item.phoneNo || '';
  document.getElementById('staff-email').value = item.email || '';
  document.getElementById('staff-resigned').value = item.resignedDate || '';

  calculateLiveStaffSalary();
}

async function saveStaffForm(event) {
  event.preventDefault();

  const uid = document.getElementById('staff-uniqueId')?.value || '';
  const payload = {
    action: uid ? 'updateStaffEntry' : 'saveStaffEntry',
    category: gStaffCategory,
    uniqueId: uid,
    joinDate: document.getElementById('staff-joindate')?.value || '',
    name: document.getElementById('staff-name')?.value || '',
    education: document.getElementById('staff-education')?.value || '',
    position: document.getElementById('staff-position')?.value || '',
    salaryGrade: document.getElementById('staff-grade')?.value || 'Non',
    workingDays: parseFloat(document.getElementById('staff-working-days')?.value || 26),
    basicAmt: parseFloat(document.getElementById('staff-basic')?.value || 0),
    extraAmt: parseFloat(document.getElementById('staff-extra')?.value || 0),
    totalSalary: parseFloat(document.getElementById('staff-total-salary')?.value || 0),
    nrcNo: document.getElementById('staff-nrc')?.value || '',
    bankAccount: document.getElementById('staff-bank')?.value || '',
    phoneNo: document.getElementById('staff-phone')?.value || '',
    email: document.getElementById('staff-email')?.value || '',
    resignedDate: document.getElementById('staff-resigned')?.value || ''
  };

  try {
    showLoading(true);
    const res = await callApi(payload);
    if (res && res.success) {
      showToast("ဝန်ထမ်းအချက်အလက် သိမ်းဆည်းပြီးပါပြီ", "success");
      closeStaffModal();
      loadStaffData(false);
    } else {
      showToast(res.message || "သိမ်းဆည်းမှု မအောင်မြင်ပါ", "error");
    }
  } catch (err) {
    showToast("Save Error: " + err.message, "error");
  } finally {
    showLoading(false);
  }
}

async function deleteStaffEntry(uniqueId) {
  if (!confirm("ဤဝန်ထမ်းမှတ်တမ်းကို ဖျက်ရန် သေချာပါသလား?")) return;

  try {
    showLoading(true);
    const res = await callApi({
      action: 'deleteStaffEntry',
      uniqueId: uniqueId,
      category: gStaffCategory
    });

    if (res && res.success) {
      showToast("ဝန်ထမ်းမှတ်တမ်း ဖျက်ပြီးပါပြီ", "success");
      loadStaffData(false);
    } else {
      showToast(res.message || "ဖျက်ဆီးမှု မအောင်မြင်ပါ", "error");
    }
  } catch (err) {
    showToast("Delete Error: " + err.message, "error");
  } finally {
    showLoading(false);
  }
}

function exportToCSVStaff() {
  if (!gStaffData || gStaffData.length === 0) {
    showToast("Export ပြုလုပ်ရန် ဒေတာ မရှိပါ", "warning");
    return;
  }
  let csv = "NO,JOIN_DATE,STAFF_IDNAME,POSITION,PHONE,STATUS\n";
  gStaffData.forEach(r => {
    csv += `"${r.no}","${r.joinDate}","${r.staffIdName || r.name}","${r.position}","${r.phoneNo}","${r.status}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Staff_${gStaffCategory}_Export_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}
