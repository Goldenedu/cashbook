/**
 * GOLDEN ERP SYSTEM - MAIN INCOME BOOK & INVOICING MODULE
 * File: js/income.js
 */

window.IncomeState = {
  page: 1,
  limit: 200,
  totalRows: 0,
  activeData: [],
  searchVal: '',
  stats: { totalIncome: 0, totalExpense: 0, balance: 0 },
  studentLookupCache: []
};

/**
 * 💡 Load Main Income Data
 */
async function loadIncomeData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  const state = window.IncomeState;

  try {
    const response = await callApi('getIncomeData', {
      bookName: 'Income Book',
      page: state.page,
      limit: state.limit,
      searchVal: state.searchVal
    }, 'GET');

    if (!isSilent) toggleLoading(false);

    if (response && response.data) {
      state.activeData = response.data;
      state.totalRows = response.totalRows || 0;
      state.stats = response.stats || { totalIncome: 0, totalExpense: 0, balance: 0 };

      updateStatsIncome();
      renderIncomeTable();
      updatePaginationIncome();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Income data:", err);
  }
}

function updateStatsIncome() {
  const stats = window.IncomeState.stats;

  const incEl = document.getElementById('inc-total-income');
  if (incEl) incEl.innerText = Number(stats.totalIncome || 0).toLocaleString('en-US') + " MMK";

  const expEl = document.getElementById('inc-total-expense');
  if (expEl) expEl.innerText = Number(stats.totalExpense || 0).toLocaleString('en-US') + " MMK";

  const balEl = document.getElementById('inc-balance');
  if (balEl) balEl.innerText = Number(stats.balance || 0).toLocaleString('en-US') + " MMK";

  const countEl = document.getElementById('inc-entries-count');
  if (countEl) countEl.innerText = window.IncomeState.totalRows.toLocaleString('en-US');
}

/**
 * 💡 Render Income Table Rows
 */
function renderIncomeTable() {
  const tableBody = document.getElementById('income-table-body');
  if (!tableBody) return;

  const data = window.IncomeState.activeData;

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="19" class="text-center py-8 text-slate-500 font-bold">No income entries found.</td></tr>`;
    return;
  }

  const isViewer = (window.AppState.currentUserRole === "Viewer");

  tableBody.innerHTML = data.map((row) => {
    let displayDate = row.date || "";
    if (displayDate) {
      let parts = displayDate.split('-');
      if (parts.length === 3) displayDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    let displayEffDate = row.effDate || "";
    if (displayEffDate) {
      let parts = displayEffDate.split('-');
      if (parts.length === 3) displayEffDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    const lockClass = (row.isLocked && window.AppState.currentUserRole !== "Admin") ? "opacity-30 cursor-not-allowed pointer-events-none" : "hover:text-white";
    const lockTitle = row.isLocked ? "Locked (Older than 7 days)" : "";

    return `
      <tr class="hover:bg-slate-800/20 text-slate-300">
        <td class="text-center font-semibold text-slate-500">${row.no}</td>
        <td>${escapeHtml(displayEffDate) || '-'}</td>
        <td>${escapeHtml(displayDate)}</td>
        <td>${escapeHtml(row.fy || '-')}</td>
        <td>${escapeHtml(row.id || '-')}</td>
        <td class="font-bold text-slate-200">${escapeHtml(row.fyid || '-')}</td>
        <td class="font-bold text-slate-100">${escapeHtml(row.fyidName || '-')}</td>
        <td>${escapeHtml(row.class || '-')}</td>
        <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">${escapeHtml(row.category)}</span></td>
        <td>${escapeHtml(row.accountName || '-')}</td>
        <td class="font-bold text-slate-400">${escapeHtml(row.method || '-')}</td>
        <td class="text-right text-rose-400 font-semibold">${row.debit > 0 ? Number(row.debit).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-emerald-400 font-semibold">${row.credit > 0 ? Number(row.credit).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-indigo-400 font-bold">${row.autAmount > 0 ? Number(row.autAmount).toLocaleString('en-US') : '-'}</td>
        <td>${escapeHtml(row.promo || '-')}</td>
        <td>${escapeHtml(row.my || '-')}</td>
        <td>${escapeHtml(row.vrNo || '-')}</td>
        <td class="max-w-xs truncate" title="${escapeHtml(row.remark || '')}">${escapeHtml(row.remark || '-')}</td>
        <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
          <div class="flex items-center justify-center gap-3">
            <button onclick="printInvoiceIncome('${row.uniqueId}')" class="text-emerald-400 hover:text-emerald-300 transition" title="Print Invoice">
              <i class="fa-solid fa-print"></i>
            </button>
            <div class="${isViewer ? 'hidden' : 'inline-flex items-center gap-3'}">
              <button onclick="editIncomeEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition ${lockClass}" title="${lockTitle}" ${row.isLocked && window.AppState.currentUserRole !== "Admin" ? 'disabled' : ''}>
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button onclick="deleteIncomeEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition ${lockClass}" title="${lockTitle}" ${row.isLocked && window.AppState.currentUserRole !== "Admin" ? 'disabled' : ''}>
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updatePaginationIncome() {
  const state = window.IncomeState;
  const info = document.getElementById('inc-pagination-info');
  if (info) {
    const start = state.totalRows === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.totalRows);
    info.innerHTML = `Showing <span class="text-indigo-400 font-extrabold">${start}</span> to <span class="text-indigo-400 font-extrabold">${end}</span> of <span class="text-indigo-400 font-extrabold">${state.totalRows}</span> entries`;
  }
}

function changePageIncome(dir) {
  const state = window.IncomeState;
  if (dir === -1 && state.page > 1) {
    state.page--;
    loadIncomeData(false);
  } else if (dir === 1 && (state.page * state.limit) < state.totalRows) {
    state.page++;
    loadIncomeData(false);
  }
}

let searchTimeoutIncome;
function onSearchInputIncome() {
  clearTimeout(searchTimeoutIncome);
  searchTimeoutIncome = setTimeout(() => {
    const input = document.getElementById('income-search');
    window.IncomeState.searchVal = input ? input.value.trim() : '';
    window.IncomeState.page = 1;
    loadIncomeData(true);
  }, 300);
}

/**
 * 💡 Student ID & FY Lookup
 */
async function onStudentIdOrFYChangeIncome() {
  const fyVal = document.getElementById('inc-fy') ? document.getElementById('inc-fy').value : '';
  const idVal = document.getElementById('inc-id-search') ? document.getElementById('inc-id-search').value.trim() : '';

  if (!fyVal || !idVal) return;

  const parts = fyVal.split("-");
  const fyShort = parts[0].slice(-2) + "-" + (parts[1] ? parts[1].slice(-2) : "");
  const paddedId = String(idVal).padStart(4, '0');
  const targetFyid = "ID " + fyShort + " " + paddedId;

  if (window.IncomeState.studentLookupCache.length === 0) {
    try {
      const res = await callApi('getStudentData', { page: 1, limit: 5000 }, 'GET');
      if (res && res.data) {
        window.IncomeState.studentLookupCache = res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch students lookup list:", err);
    }
  }

  const student = window.IncomeState.studentLookupCache.find(s => s.fyid === targetFyid);

  const fyidShow = document.getElementById('inc-fyid-show');
  const fyidNameShow = document.getElementById('inc-fyidname-show');

  if (student) {
    if (fyidShow) fyidShow.value = student.fyid;
    if (fyidNameShow) fyidNameShow.value = student.fyidName;

    document.getElementById('inc-class').value = student.class || "";
    document.getElementById('inc-category').value = student.category || "";
    document.getElementById('inc-promo').value = student.promo || "";

    onAccountNameOrCategoryChangeIncome();
  } else {
    if (fyidShow) fyidShow.value = "Not Found";
    if (fyidNameShow) fyidNameShow.value = "ကျောင်းသား ရှာမတွေ့ပါရှင်!";

    document.getElementById('inc-class').value = "";
    document.getElementById('inc-promo').value = "";
    document.getElementById('inc-autamount').value = 0;
  }
}

/**
 * 💡 Calculate Auto Amount from Promo Matrix
 */
async function onAccountNameOrCategoryChangeIncome() {
  const accountName = document.getElementById('inc-account').value;
  const classVal = document.getElementById('inc-class').value;
  const categoryVal = document.getElementById('inc-category').value;
  const promoVal = document.getElementById('inc-promo').value;

  if (accountName !== "Registration" && accountName !== "Services") {
    document.getElementById('inc-autamount').value = 0;
    return;
  }

  try {
    const res = await callApi('getAutoAmountFromPromo', {
      accountName, classVal, categoryVal, promoVal
    }, 'GET');

    if (res && res.amount !== undefined) {
      document.getElementById('inc-autamount').value = res.amount;
    }
  } catch (err) {
    console.warn("Auto amount lookup error:", err);
  }
}

/**
 * 💡 Toggle Split Payment Inputs
 */
function toggleSplitPaymentIncome() {
  const isSplit = document.getElementById('inc-is-split').checked;
  const normalDiv = document.getElementById('inc-normal-payment-div');
  const splitDiv = document.getElementById('inc-split-payment-div');

  if (isSplit) {
    if (normalDiv) normalDiv.classList.add('hidden');
    if (splitDiv) splitDiv.classList.remove('hidden');
  } else {
    if (normalDiv) normalDiv.classList.remove('hidden');
    if (splitDiv) splitDiv.classList.add('hidden');
  }
}

/**
 * 💡 Save / Update Income Entry
 */
async function saveIncomeForm(e) {
  e.preventDefault();
  closeIncomeModal();

  const isSplit = document.getElementById('inc-is-split').checked;
  const fyidVal = document.getElementById('inc-fyid-show').value;

  if (fyidVal === "Not Found" || !fyidVal) {
    showToast("ERROR", "ကျောင်းသား ရှာမတွေ့သဖြင့် စာရင်းသွင်း၍မရပါရှင်!");
    return;
  }

  const uniqueId = document.getElementById('inc-uniqueId').value;
  const isAdd = (!uniqueId);

  const entry = {
    uniqueId: uniqueId,
    id: parseInt(document.getElementById('inc-id-search').value) || "",
    date: document.getElementById('inc-date').value,
    effDate: document.getElementById('inc-effdate').value,
    fy: document.getElementById('inc-fy').value,
    fyid: fyidVal,
    fyidName: document.getElementById('inc-fyidname-show').value,
    class: document.getElementById('inc-class').value,
    category: document.getElementById('inc-category').value,
    promo: document.getElementById('inc-promo').value,
    accountName: document.getElementById('inc-account').value,
    autAmount: parseFloat(document.getElementById('inc-autamount').value) || 0,
    remark: document.getElementById('inc-remark').value,
    isSplit: isSplit,

    method: document.getElementById('inc-method').value,
    debit: parseFloat(document.getElementById('inc-debit').value) || 0,
    credit: parseFloat(document.getElementById('inc-credit').value) || 0,

    cashAmount: parseFloat(document.getElementById('inc-cash-amount').value) || 0,
    bankAmount: parseFloat(document.getElementById('inc-bank-amount').value) || 0,

    createdBy: window.AppState.currentUser || "System"
  };

  const action = isAdd ? 'saveIncomeEntry' : 'updateIncomeEntry';
  showToast("SUCCESS", "ဝင်ငွေစာရင်း သိမ်းဆည်းနေပါသည်...");

  try {
    const response = await callApi(action, entry);
    if (response && response.success) {
      showToast("SUCCESS", isAdd ? "ဝင်ငွေစာရင်းသစ် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီရှင်။" : "ဝင်ငွေစာရင်း ပြင်ဆင်ပြီးပါပြီရှင်။");
      loadIncomeData(true);
    } else {
      showToast("ERROR", "မအောင်မြင်ပါ: " + (response.message || ""));
    }
  } catch (err) {
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
  }
}

function openAddModalIncome() {
  const form = document.getElementById('income-form');
  if (form) form.reset();

  document.getElementById('inc-uniqueId').value = "";

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  document.getElementById('inc-date').value = `${yyyy}-${mm}-${dd}`;

  toggleSplitPaymentIncome();
  document.getElementById('income-modal').classList.remove('hidden');
}

function closeIncomeModal() {
  document.getElementById('income-modal').classList.add('hidden');
}

/**
 * 💡 Edit Income Entry
 */
function editIncomeEntry(uniqueId) {
  const row = window.IncomeState.activeData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "မူရင်းဒေတာကို ရှာမတွေ့ပါရှင်။");
    return;
  }

  openAddModalIncome();

  document.getElementById('inc-uniqueId').value = row.uniqueId;
  document.getElementById('inc-date').value = row.date;
  document.getElementById('inc-effdate').value = row.effDate || "";
  document.getElementById('inc-fy').value = row.fy || "";
  document.getElementById('inc-id-search').value = row.id || "";

  onStudentIdOrFYChangeIncome();

  document.getElementById('inc-category').value = row.category;
  document.getElementById('inc-account').value = row.accountName;
  document.getElementById('inc-method').value = row.method;
  document.getElementById('inc-debit').value = row.debit || 0;
  document.getElementById('inc-credit').value = row.credit || 0;
  document.getElementById('inc-autamount').value = row.autAmount || 0;
  document.getElementById('inc-remark').value = row.remark || "";
}

/**
 * 💡 Delete Income Entry
 */
async function deleteIncomeEntry(uniqueId) {
  if (confirm("ဤဝင်ငွေမှတ်တမ်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလားရှင်?\n(ခွဲပေးချေမှုဖြစ်ပါက ပတ်သက်သော စာရင်း ၂ ကြောင်းစလုံး ပျက်သွားပါမည်)")) {
    showToast("SUCCESS", "ဝင်ငွေစာရင်းကို ဖျက်သိမ်းနေပါသည်...");
    try {
      const response = await callApi('deleteIncomeEntry', { uniqueId });
      if (response && response.success) {
        showToast("SUCCESS", "ဝင်ငွေစာရင်းအား ဖျက်သိမ်းပြီးပါပြီရှင်။");
        loadIncomeData(true);
      } else {
        showToast("ERROR", "ဖျက်သိမ်းမှု မအောင်မြင်ပါ: " + (response.message || ""));
      }
    } catch (err) {
      showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
    }
  }
}

/**
 * 💡 Dual-Copy Receipt Printing Handler
 */
function printInvoiceIncome(uniqueId) {
  const row = window.IncomeState.activeData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "ပြေစာထုတ်ယူရန် ဒေတာ ရှာမတွေ့ပါရှင်။");
    return;
  }

  const nameParts = (row.fyidName || "").split(" ");
  const studentName = nameParts.slice(3).join(" ") || row.fyidName;

  let displayAmount = row.credit;
  let displayDesc = row.accountName;

  if (row.debit > 0) {
    displayAmount = -row.debit;
    displayDesc = row.accountName + " (Student Refund)";
  }

  const copies = ['customer', 'received'];
  copies.forEach(copy => {
    const nameEl = document.getElementById(`print-${copy}-name`);
    if (nameEl) nameEl.innerText = studentName;

    const dateEl = document.getElementById(`print-${copy}-date`);
    if (dateEl) {
      let rawDate = row.date;
      if (rawDate) {
        let parts = rawDate.split('-');
        if (parts.length === 3) rawDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      dateEl.innerText = rawDate;
    }

    const classEl = document.getElementById(`print-${copy}-class`);
    if (classEl) classEl.innerText = row.class || '-';

    const catEl = document.getElementById(`print-${copy}-category`);
    if (catEl) catEl.innerText = row.category || '-';

    const idEl = document.getElementById(`print-${copy}-id`);
    if (idEl) idEl.innerText = row.fyid || '-';

    const bodyEl = document.getElementById(`print-${copy}-table-body`);
    if (bodyEl) {
      bodyEl.innerHTML = `
        <tr class="border-b border-black">
          <td class="border border-black p-1.5 text-center font-bold text-[10px]">1</td>
          <td class="border border-black p-1.5 font-semibold text-[10px]">${displayDesc}</td>
          <td class="border border-black p-1.5 text-center text-[10px]">${row.my || '-'}</td>
          <td class="border border-black p-1.5 text-center font-bold text-[10px]">${row.method || '-'}</td>
          <td class="border border-black p-1.5 text-right font-bold text-[10px]">${Number(displayAmount).toLocaleString('en-US')}</td>
        </tr>
      `;
    }

    const totEl = document.getElementById(`print-${copy}-total`);
    if (totEl) totEl.innerText = Number(displayAmount).toLocaleString('en-US') + " MMK";
  });

  window.print();
}

/**
 * 💡 CSV Export
 */
function exportToCSVIncome() {
  const data = window.IncomeState.activeData;
  if (!data || data.length === 0) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှ မရှိပါရှင်။");
    return;
  }

  let csv = "NO,EFFECT DATE,DATE,FY,ID,FYID,FYID NAME,CLASS,CATEGORY,ACCOUNT NAME,METHOD,DEBIT,CREDIT,AUT AMOUNT,PROMO,MY,VR NO,REMARK,UNIQUEID\n";
  data.forEach(row => {
    let fyidName = `"${(row.fyidName || '').replace(/"/g, '""')}"`;
    let remark = `"${(row.remark || '').replace(/"/g, '""')}"`;
    csv += `${row.no},${row.effDate || ''},${row.date},${row.fy || ''},${row.id || ''},${row.fyid || ''},${fyidName},${row.class || ''},${row.category},${row.accountName},${row.method},${row.debit},${row.credit},${row.autAmount || 0},${row.promo || ''},${row.my || ''},${row.vrNo || ''},${remark},${row.uniqueId}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `main_income_book_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}