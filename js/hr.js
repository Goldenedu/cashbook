/**
 * GOLDEN ERP SYSTEM - HR MODULE
 * File: js/hr.js
 */

let gHrSubTab = 'payroll'; // 'payroll', 'fulltime', 'parttime'
let gPayrollPage = 1;
let gPayrollLimit = 30;
let gPayrollSearch = '';
let gPayrollData = [];

function initHrPage() {
  switchHrSubTab('payroll');
}

function switchHrSubTab(subTab) {
  gHrSubTab = subTab;

  const btnPayroll = document.getElementById('hr-tab-payroll');
  const btnFulltime = document.getElementById('hr-tab-fulltime');
  const btnParttime = document.getElementById('hr-tab-parttime');

  const secPayroll = document.getElementById('hr-payroll-section');
  const secStaff = document.getElementById('hr-staff-section');

  // Reset Button Styles
  [btnPayroll, btnFulltime, btnParttime].forEach(btn => {
    if (btn) {
      btn.className = "hr-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-slate-800 text-slate-400 hover:text-white flex items-center gap-2";
    }
  });

  if (subTab === 'payroll') {
    if (btnPayroll) btnPayroll.className = "hr-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-teal-600 text-white flex items-center gap-2";
    if (secPayroll) secPayroll.classList.remove('hidden');
    if (secStaff) secStaff.classList.add('hidden');
    loadHrPayrollData(false);
  } else {
    if (subTab === 'fulltime' && btnFulltime) {
      btnFulltime.className = "hr-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white flex items-center gap-2";
    } else if (subTab === 'parttime' && btnParttime) {
      btnParttime.className = "hr-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white flex items-center gap-2";
    }
    
    if (secPayroll) secPayroll.classList.add('hidden');
    if (secStaff) secStaff.classList.remove('hidden');

    // Delegate to staff module
    if (typeof switchStaffCategory === 'function') {
      switchStaffCategory(subTab === 'fulltime' ? 'Full Time' : 'Part Time');
    }
  }
}

async function loadHrPayrollData(useCache = false) {
  try {
    showLoading(true);
    const res = await callApi({
      action: 'getExpenseData',
      bookName: 'HR Payroll Exp Book',
      page: gPayrollPage,
      limit: gPayrollLimit,
      searchVal: gPayrollSearch
    });

    if (res && res.success) {
      gPayrollData = res.data || [];
      renderHrPayrollCards(res.stats || {});
      renderHrPayrollTable(gPayrollData);
      renderHrPayrollPagination(res.totalRows || 0);
    } else {
      showToast(res.message || "Payroll ဒေတာ ရယူ၍ မရပါ", "error");
    }
  } catch (err) {
    showToast("Error loading Payroll data: " + err.message, "error");
  } finally {
    showLoading(false);
  }
}

function renderHrPayrollCards(stats) {
  const inc = document.getElementById('hr-pay-total-income');
  const exp = document.getElementById('hr-pay-total-expense');
  const bal = document.getElementById('hr-pay-balance');
  const cnt = document.getElementById('hr-pay-entries-count');

  if (inc) inc.textContent = `${(stats.totalIncome || 0).toLocaleString()} MMK`;
  if (exp) exp.textContent = `${(stats.totalExpense || 0).toLocaleString()} MMK`;
  if (bal) bal.textContent = `${(stats.balance || 0).toLocaleString()} MMK`;
  if (cnt) cnt.textContent = (gPayrollData ? gPayrollData.length : 0);
}

function renderHrPayrollTable(data) {
  const tbody = document.getElementById('hr-payroll-table-body');
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="15" class="text-center py-8 text-slate-500 font-bold">Payroll စာရင်း မရှိသေးပါ</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((item, idx) => `
    <tr class="hover:bg-slate-800/40 transition">
      <td class="text-center text-slate-400 py-3">${item.no || (idx + 1)}</td>
      <td class="font-mono text-slate-300 py-3">${item.date || ''}</td>
      <td class="font-bold text-teal-400 py-3">${item.category || ''}</td>
      <td class="text-slate-200 py-3 font-semibold">${item.description || ''}</td>
      <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.method === 'Bank' ? 'bg-sky-500/10 text-sky-400' : 'bg-amber-500/10 text-amber-400'}">${item.method || 'Cash'}</span></td>
      <td class="text-right font-bold text-emerald-400 py-3">${(item.debit || 0).toLocaleString()}</td>
      <td class="text-right font-bold text-rose-400 py-3">${(item.credit || 0).toLocaleString()}</td>
      <td class="text-right font-bold text-slate-200 py-3">${(item.balances || 0).toLocaleString()}</td>
      <td class="text-right font-bold text-emerald-400 py-3">${(item.unpaidBonus || 0).toLocaleString()}</td>
      <td class="text-right font-bold text-teal-400 py-3">${(item.unpaidFund || 0).toLocaleString()}</td>
      <td class="text-center py-3">${item.sendMail ? '<i class="fa-solid fa-circle-check text-emerald-400"></i>' : '<i class="fa-solid fa-circle-minus text-slate-600"></i>'}</td>
      <td class="font-mono text-xs text-indigo-300 py-3">${item.vrNo || ''}</td>
      <td class="text-slate-400 py-3">${item.my || ''}</td>
      <td class="text-slate-400 py-3">${item.fy || ''}</td>
      <td class="text-center py-3 right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg">
        <div class="flex items-center justify-center gap-2">
          ${item.isLocked ? '<span class="text-[10px] text-slate-500 font-bold">Locked</span>' : `
            <button onclick="editHrPayrollEntry('${item.uniqueId}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded transition"><i class="fa-solid fa-pen-to-square text-xs"></i></button>
            <button onclick="deleteHrPayrollEntry('${item.uniqueId}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded transition"><i class="fa-solid fa-trash-can text-xs"></i></button>
          `}
        </div>
      </td>
    </tr>
  `).join('');
}

function renderHrPayrollPagination(totalRows) {
  const info = document.getElementById('hr-pay-pagination-info');
  const btnPrev = document.getElementById('hr-pay-btn-prev');
  const btnNext = document.getElementById('hr-pay-btn-next');

  const totalPages = Math.ceil(totalRows / gPayrollLimit) || 1;
  if (info) info.textContent = `Showing Page ${gPayrollPage} of ${totalPages} (${totalRows} total entries)`;

  if (btnPrev) btnPrev.disabled = (gPayrollPage <= 1);
  if (btnNext) btnNext.disabled = (gPayrollPage >= totalPages);
}

function changePageHrPayroll(delta) {
  gPayrollPage += delta;
  if (gPayrollPage < 1) gPayrollPage = 1;
  loadHrPayrollData(false);
}

function onSearchInputHrPayroll() {
  const input = document.getElementById('hr-payroll-search');
  gPayrollSearch = input ? input.value : '';
  gPayrollPage = 1;
  loadHrPayrollData(false);
}

function openAddModalHrPayroll() {
  const form = document.getElementById('hr-payroll-form');
  if (form) form.reset();
  const uid = document.getElementById('hr-pay-uniqueId');
  if (uid) uid.value = '';

  const dateInput = document.getElementById('hr-pay-date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

  const title = document.getElementById('hr-payroll-form-title');
  if (title) title.textContent = 'Add HR Payroll Entry';

  const modal = document.getElementById('hr-payroll-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeHrPayrollModal() {
  const modal = document.getElementById('hr-payroll-modal');
  if (modal) modal.classList.add('hidden');
}

async function onStaffIdChangePayroll() {
  const staffIdInput = document.getElementById('hr-pay-staff-id');
  const categoryInput = document.getElementById('hr-pay-category');
  const dateInput = document.getElementById('hr-pay-date');

  const staffId = staffIdInput ? parseInt(staffIdInput.value, 10) : 0;
  const category = categoryInput ? categoryInput.value : '';
  const dateVal = dateInput ? dateInput.value : '';

  if (!staffId || isNaN(staffId)) return;

  const isFT = category.startsWith('Full Time');
  const staffCat = isFT ? 'Full Time' : 'Part Time';

  try {
    const res = await callApi({ action: 'getStaffData', category: staffCat, page: 1, limit: 1000 });
    if (res && res.data) {
      const staffObj = res.data.find(s => parseInt(s.staffId, 10) === staffId);
      if (staffObj) {
        const unpaidBonusInput = document.getElementById('hr-pay-unpaid-bonus');
        const unpaidFundInput = document.getElementById('hr-pay-unpaid-fund');
        const creditInput = document.getElementById('hr-pay-credit');
        const descInput = document.getElementById('hr-pay-description');

        if (unpaidBonusInput) unpaidBonusInput.value = staffObj.unpaidBonus || 0;
        if (unpaidFundInput) unpaidFundInput.value = staffObj.unpaidFund || 0;

        let autoCredit = 0;
        if (category === 'Full Time Salary' || category === 'Part Time Salary') {
          autoCredit = staffObj.totalSalary || 0;
        } else if (category === 'Full Time Bonus') {
          autoCredit = staffObj.unpaidBonus || 0;
        } else if (category === 'Full Time Fund') {
          autoCredit = staffObj.unpaidFund || 0;
        }

        if (creditInput) creditInput.value = autoCredit;

        // Auto Description
        const d = new Date(dateVal || Date.now());
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const myStr = `${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
        
        if (descInput) {
          descInput.value = `[${staffObj.staffIdName || staffObj.name}, ${category} ${myStr}]`;
        }
      }
    }
  } catch (err) {
    console.warn("Error matching staff ID:", err);
  }
}

async function saveHrPayrollForm(event) {
  event.preventDefault();
  
  const uid = document.getElementById('hr-pay-uniqueId')?.value || '';
  const payload = {
    action: uid ? 'updateExpenseEntry' : 'saveExpenseEntry',
    bookName: 'HR Payroll Exp Book',
    uniqueId: uid,
    date: document.getElementById('hr-pay-date')?.value || '',
    category: document.getElementById('hr-pay-category')?.value || '',
    id: document.getElementById('hr-pay-staff-id')?.value || '',
    method: document.getElementById('hr-pay-method')?.value || 'Cash',
    debit: parseFloat(document.getElementById('hr-pay-debit')?.value || 0),
    credit: parseFloat(document.getElementById('hr-pay-credit')?.value || 0),
    unpaidBonus: parseFloat(document.getElementById('hr-pay-unpaid-bonus')?.value || 0),
    unpaidFund: parseFloat(document.getElementById('hr-pay-unpaid-fund')?.value || 0),
    description: document.getElementById('hr-pay-description')?.value || ''
  };

  try {
    showLoading(true);
    const res = await callApi(payload);
    if (res && res.success) {
      showToast("Payroll စာရင်း အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ", "success");
      closeHrPayrollModal();
      loadHrPayrollData(false);
    } else {
      showToast(res.message || "သိမ်းဆည်းမှု မအောင်မြင်ပါ", "error");
    }
  } catch (err) {
    showToast("Save Error: " + err.message, "error");
  } finally {
    showLoading(false);
  }
}

function exportToCSVHrPayroll() {
  if (!gPayrollData || gPayrollData.length === 0) {
    showToast("Export ပြုလုပ်ရန် စာရင်း မရှိပါ", "warning");
    return;
  }
  let csv = "NO,DATE,CATEGORY,DESCRIPTION,METHOD,DEBIT,CREDIT,BALANCES,VR_NO\n";
  gPayrollData.forEach(r => {
    csv += `"${r.no}","${r.date}","${r.category}","${r.description}","${r.method}",${r.debit},${r.credit},${r.balances},"${r.vrNo}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Payroll_Export_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

function sendMonthlyPayslipsToStaff() {
  showToast("Resend API ဖြင့် မေးလ်ပို့ဆောင်ခြင်း စတင်နေပါပြီ...", "info");
}
