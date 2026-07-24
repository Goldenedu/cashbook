/**
 * GOLDEN ERP SYSTEM - HR & PAYROLL MODULE
 * File: js/hr.js
 */

var hrPayPage = 1;
var hrPayLimit = 30;
var hrPayTotalRows = 0;
var hrPayActiveData = [];

/**
 * 💡 Switch HR Sub-Tabs
 */
function switchHrSubTab(tabName) {
  const payrollSec = document.getElementById('hr-payroll-section');
  const staffSec = document.getElementById('hr-staff-section');

  const btnPay = document.getElementById('hr-tab-payroll');
  const btnFt = document.getElementById('hr-tab-fulltime');
  const btnPt = document.getElementById('hr-tab-parttime');

  // Reset Button Styles
  [btnPay, btnFt, btnPt].forEach(btn => {
    if (btn) {
      btn.className = "hr-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-slate-800 text-slate-400 hover:text-white flex items-center gap-2";
    }
  });

  if (tabName === 'payroll') {
    if (payrollSec) payrollSec.classList.remove('hidden');
    if (staffSec) staffSec.classList.add('hidden');
    if (btnPay) btnPay.className = "hr-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-teal-600 text-white flex items-center gap-2 shadow-lg shadow-teal-600/10";
    loadHrPayrollData(false);

  } else if (tabName === 'fulltime') {
    if (payrollSec) payrollSec.classList.add('hidden');
    if (staffSec) staffSec.classList.remove('hidden');
    if (btnFt) btnFt.className = "hr-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/10";
    if (typeof switchStaffCategory === 'function') switchStaffCategory('Full Time');

  } else if (tabName === 'parttime') {
    if (payrollSec) payrollSec.classList.add('hidden');
    if (staffSec) staffSec.classList.remove('hidden');
    if (btnPt) btnPt.className = "hr-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white flex items-center gap-2 shadow-lg shadow-indigo-600/10";
    if (typeof switchStaffCategory === 'function') switchStaffCategory('Part Time');
  }
}

/**
 * 💡 Load HR Payroll Data
 */
async function loadHrPayrollData(isSilent = false) {
  const token = localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token');
  if (!token) return;

  try {
    if (!isSilent) toggleLoading(true);

    const searchInput = document.getElementById('hr-payroll-search');
    const searchVal = searchInput ? searchInput.value.trim() : '';

    const res = await callApi('getExpenseData', {
      bookName: 'HR Payroll Exp Book',
      page: hrPayPage,
      limit: hrPayLimit,
      searchVal: searchVal
    });

    if (!res || !res.success) {
      throw new Error(res?.message || "Failed to load HR payroll data.");
    }

    hrPayActiveData = res.data || [];
    hrPayTotalRows = res.totalRows || 0;

    renderStatsHrPayroll(res.stats || { totalIncome: 0, totalExpense: 0, balance: 0 });
    renderTableHrPayroll();
    updatePaginationUIHrPayroll();

  } catch (err) {
    console.error("HR Payroll Load Error:", err);
    if (!isSilent) showToast("ERROR", "HR စာရင်းများ ဆွဲယူ၍ မရပါ: " + err.message);
  } finally {
    if (!isSilent) toggleLoading(false);
  }
}

function renderStatsHrPayroll(stats) {
  const incEl = document.getElementById('hr-pay-total-income');
  const expEl = document.getElementById('hr-pay-total-expense');
  const balEl = document.getElementById('hr-pay-balance');
  const cntEl = document.getElementById('hr-pay-entries-count');

  if (incEl) incEl.textContent = Number(stats.totalIncome || 0).toLocaleString('en-US') + ' MMK';
  if (expEl) expEl.textContent = Number(stats.totalExpense || 0).toLocaleString('en-US') + ' MMK';
  if (balEl) balEl.textContent = Number(stats.balance || 0).toLocaleString('en-US') + ' MMK';
  if (cntEl) cntEl.textContent = Number(hrPayTotalRows || 0).toLocaleString('en-US');
}

function renderTableHrPayroll() {
  const tbody = document.getElementById('hr-payroll-table-body');
  if (!tbody) return;

  if (!hrPayActiveData || hrPayActiveData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="14" class="text-center py-8 text-slate-500 font-bold">HR Payroll စာရင်းများ မရှိသေးပါ။</td></tr>`;
    return;
  }

  tbody.innerHTML = hrPayActiveData.map((row) => {
    const isViewer = (localStorage.getItem('golden_user_role') === "Viewer");
    const lockClass = (row.isLocked || isViewer) ? "opacity-30 cursor-not-allowed pointer-events-none" : "hover:text-white";

    return `
      <tr class="hover:bg-slate-800/30 text-slate-300">
        <td class="text-center font-semibold text-slate-500">${row.no || '-'}</td>
        <td class="font-mono text-xs">${escapeHtml(row.date) || '-'}</td>
        <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">${escapeHtml(row.category) || '-'}</span></td>
        <td class="font-bold text-slate-100 max-w-sm truncate" title="${escapeHtml(row.description)}">${escapeHtml(row.description) || '-'}</td>
        <td class="font-bold text-slate-400">${escapeHtml(row.method) || '-'}</td>
        <td class="text-right text-emerald-400 font-mono font-bold">${row.debit > 0 ? Number(row.debit).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-rose-400 font-mono font-bold">${row.credit > 0 ? Number(row.credit).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-slate-200 font-mono font-bold">${Number(row.balances || 0).toLocaleString('en-US')}</td>
        <td class="text-right text-emerald-400 font-mono">${row.unpaidBonus > 0 ? Number(row.unpaidBonus).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-teal-400 font-mono">${row.unpaidFund > 0 ? Number(row.unpaidFund).toLocaleString('en-US') : '-'}</td>
        <td class="font-mono text-xs text-slate-400">${escapeHtml(row.vrNo) || '-'}</td>
        <td class="font-mono text-xs">${escapeHtml(row.my) || '-'}</td>
        <td class="font-mono text-xs">${escapeHtml(row.fy) || '-'}</td>
        <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
          <div class="flex items-center justify-center gap-3">
            <button onclick="printPayslip('${row.uniqueId}')" class="text-teal-400 hover:text-teal-300 transition" title="Print Payslip">
              <i class="fa-solid fa-print"></i>
            </button>
            <button onclick="editHrPayrollEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition ${lockClass}" ${row.isLocked || isViewer ? 'disabled' : ''}>
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="deleteHrPayrollEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition ${lockClass}" ${row.isLocked || isViewer ? 'disabled' : ''}>
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 💡 PAYSLIP PRINTER ENGINE (TARGETS PAYSLIP PRINT AREA ONLY)
 */
function printPayslip(uniqueId) {
  const row = hrPayActiveData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "Payslip ထုတ်ယူရန် ဒေတာရှာမတွေ့ပါ!");
    return;
  }

  // 💡 [CRITICAL FIX] Activate ONLY Payslip Print Area and deactivate Invoice
  const invArea = document.getElementById('invoice-print-area');
  const payArea = document.getElementById('payslip-print-area');

  if (invArea) invArea.classList.remove('active-print');
  if (payArea) payArea.classList.add('active-print');

  const netAmount = row.credit > 0 ? row.credit : row.debit;

  ['top', 'bot'].forEach(pos => {
    const descEl = document.getElementById(`print-pay-desc-${pos}`);
    if (descEl) descEl.textContent = row.description || '-';

    const catEl = document.getElementById(`print-pay-cat-${pos}`);
    if (catEl) catEl.textContent = row.category || '-';

    const dateEl = document.getElementById(`print-pay-date-${pos}`);
    if (dateEl) dateEl.textContent = row.date || '-';

    const monthEl = document.getElementById(`print-pay-month-${pos}`);
    if (monthEl) monthEl.textContent = row.my || '-';

    const netEl = document.getElementById(`print-pay-net-${pos}`);
    if (netEl) netEl.textContent = Number(netAmount || 0).toLocaleString('en-US') + " MMK";

    const bonusEl = document.getElementById(`print-pay-bonus-${pos}`);
    if (bonusEl) bonusEl.textContent = Number(row.unpaidBonus || 0).toLocaleString('en-US') + " MMK";

    const fundEl = document.getElementById(`print-pay-fund-${pos}`);
    if (fundEl) fundEl.textContent = Number(row.unpaidFund || 0).toLocaleString('en-US') + " MMK";
  });

  // Trigger Print
  window.print();
}

/**
 * 💡 HR Payroll Modal Controls
 */
function openAddModalHrPayroll() {
  const form = document.getElementById('hr-payroll-form');
  if (form) form.reset();

  document.getElementById('hr-pay-uniqueId').value = "";
  document.getElementById('hr-pay-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('hr-payroll-form-title').innerText = "Add HR Payroll Entry";
  document.getElementById('hr-payroll-modal').classList.remove('hidden');
}

function closeHrPayrollModal() {
  const modal = document.getElementById('hr-payroll-modal');
  if (modal) modal.classList.add('hidden');
}

function changePageHrPayroll(dir) {
  if (dir === -1 && hrPayPage > 1) {
    hrPayPage--;
    loadHrPayrollData(false);
  } else if (dir === 1 && (hrPayPage * hrPayLimit) < hrPayTotalRows) {
    hrPayPage++;
    loadHrPayrollData(false);
  }
}

function updatePaginationUIHrPayroll() {
  const info = document.getElementById('hr-pay-pagination-info');
  if (info) {
    const start = hrPayTotalRows === 0 ? 0 : (hrPayPage - 1) * hrPayLimit + 1;
    const end = Math.min(hrPayPage * hrPayLimit, hrPayTotalRows);
    info.innerHTML = `Showing <span class="text-teal-400 font-extrabold">${start}</span> to <span class="text-teal-400 font-extrabold">${end}</span> of <span class="text-teal-400 font-extrabold">${hrPayTotalRows}</span> entries`;
  }

  const prevBtn = document.getElementById('hr-pay-btn-prev');
  if (prevBtn) prevBtn.disabled = (hrPayPage === 1);

  const nextBtn = document.getElementById('hr-pay-btn-next');
  if (nextBtn) nextBtn.disabled = (hrPayPage * hrPayLimit >= hrPayTotalRows);
}

function onSearchInputHrPayroll() {
  if (window.searchTimeoutHrPay) clearTimeout(window.searchTimeoutHrPay);
  window.searchTimeoutHrPay = setTimeout(() => {
    hrPayPage = 1;
    loadHrPayrollData(false);
  }, 300);
}
