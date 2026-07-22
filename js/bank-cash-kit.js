/**
 * GOLDEN ERP SYSTEM - BANK, CASH & KITCHEN LEDGER MODULE
 * File: js/bank-cash-kit.js
 */

// Module State
window.BankCashKitState = {
  activeSubBook: 'bank', // 'bank', 'cash', or 'kitchen'
  page: 1,
  limit: 30,
  totalRows: 0,
  activeData: [],
  searchVal: '',
  stats: { totalIncome: 0, totalExpense: 0, balance: 0 }
};

const SUB_BOOK_MAP = {
  'bank': 'Bank Book',
  'cash': 'Cash Book',
  'kitchen': 'Kitchen Exp Book'
};

/**
 * 💡 Switch Sub-Book (Bank vs Cash vs Kitchen)
 */
function switchSubBook(subBookKey) {
  window.BankCashKitState.activeSubBook = subBookKey;
  window.BankCashKitState.page = 1;
  
  // Highlight active sub-tab buttons in UI
  document.querySelectorAll('.sub-tab-btn').forEach(btn => {
    btn.classList.remove('bg-indigo-600', 'text-white');
    btn.classList.add('bg-slate-800', 'text-slate-400');
  });
  
  const activeBtn = document.getElementById(`sub-tab-${subBookKey}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-slate-800', 'text-slate-400');
    activeBtn.classList.add('bg-indigo-600', 'text-white');
  }

  loadBankCashKitData(false);
}

/**
 * 💡 Load Data from Cloudflare Worker API
 */
async function loadBankCashKitData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  const state = window.BankCashKitState;
  const bookName = SUB_BOOK_MAP[state.activeSubBook] || 'Bank Book';

  try {
    const response = await callApi('getBankCashData', {
      bookName: bookName,
      page: state.page,
      limit: state.limit,
      searchVal: state.searchVal
    }, 'GET');

    if (!isSilent) toggleLoading(false);

    if (response && response.data) {
      state.activeData = response.data;
      state.totalRows = response.totalRows || 0;
      state.stats = response.stats || { totalIncome: 0, totalExpense: 0, balance: 0 };

      updateStatsBankCashKit();
      renderBankCashKitTable();
      updatePaginationBankCashKit();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Bank/Cash/Kitchen data:", err);
  }
}

/**
 * 💡 Update Top KPI Stats Cards
 */
function updateStatsBankCashKit() {
  const stats = window.BankCashKitState.stats;
  
  const incEl = document.getElementById('bck-total-income');
  if (incEl) incEl.innerText = Number(stats.totalIncome || 0).toLocaleString('en-US') + " MMK";

  const expEl = document.getElementById('bck-total-expense');
  if (expEl) expEl.innerText = Number(stats.totalExpense || 0).toLocaleString('en-US') + " MMK";

  const balEl = document.getElementById('bck-balance');
  if (balEl) balEl.innerText = Number(stats.balance || 0).toLocaleString('en-US') + " MMK";

  const countEl = document.getElementById('bck-entries-count');
  if (countEl) countEl.innerText = window.BankCashKitState.totalRows.toLocaleString('en-US');
}

/**
 * 💡 Render Table Grid Rows
 */
function renderBankCashKitTable() {
  const tableBody = document.getElementById('bck-table-body');
  if (!tableBody) return;

  const data = window.BankCashKitState.activeData;

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="13" class="text-center py-8 text-slate-500 font-bold">No entries found for this book.</td></tr>`;
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

    return `
      <tr class="hover:bg-slate-800/20 text-slate-300">
        <td class="text-center font-semibold text-slate-500">${row.no}</td>
        <td>${escapeHtml(displayDate)}</td>
        <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">${escapeHtml(row.category)}</span></td>
        <td class="min-w-[280px] max-w-md truncate" title="${escapeHtml(row.description)}">${escapeHtml(row.description)}</td>
        <td class="font-bold">${escapeHtml(row.method)}</td>
        <td class="text-right text-emerald-400 font-semibold">${row.debit > 0 ? Number(row.debit).toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
        <td class="text-right text-rose-400 font-semibold">${row.credit > 0 ? Number(row.credit).toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
        <td class="text-right text-slate-400 font-bold">${Number(row.balances).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td>${escapeHtml(row.transfer) || '-'}</td>
        <td>${escapeHtml(row.vrNo || '-')}</td>
        <td>${escapeHtml(row.my || '-')}</td>
        <td>${escapeHtml(row.fy || '-')}</td>
        <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
          <div class="flex items-center justify-center gap-3 ${isViewer ? 'hidden' : ''}">
            <button onclick="editBankCashKitEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition ${lockClass}" title="${lockTitle}" ${row.isLocked && window.AppState.currentUserRole !== "Admin" ? 'disabled' : ''}>
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="deleteBankCashKitEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition ${lockClass}" title="${lockTitle}" ${row.isLocked && window.AppState.currentUserRole !== "Admin" ? 'disabled' : ''}>
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 💡 Pagination Controls & UI Update
 */
function updatePaginationBankCashKit() {
  const state = window.BankCashKitState;
  const info = document.getElementById('bck-pagination-info');
  if (info) {
    const start = state.totalRows === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.totalRows);
    info.innerHTML = `Showing <span class="text-indigo-400 font-extrabold">${start}</span> to <span class="text-indigo-400 font-extrabold">${end}</span> of <span class="text-indigo-400 font-extrabold">${state.totalRows}</span> entries`;
  }

  const prevBtn = document.getElementById('bck-btn-prev');
  if (prevBtn) prevBtn.disabled = (state.page === 1);

  const nextBtn = document.getElementById('bck-btn-next');
  if (nextBtn) nextBtn.disabled = (state.page * state.limit >= state.totalRows);
}

function changePageBankCashKit(dir) {
  const state = window.BankCashKitState;
  if (dir === -1 && state.page > 1) {
    state.page--;
    loadBankCashKitData(false);
  } else if (dir === 1 && (state.page * state.limit) < state.totalRows) {
    state.page++;
    loadBankCashKitData(false);
  }
}

/**
 * 💡 Search Debounce Handler
 */
let searchTimeoutBCK;
function onSearchInputBankCashKit() {
  clearTimeout(searchTimeoutBCK);
  searchTimeoutBCK = setTimeout(() => {
    const searchInput = document.getElementById('bck-search');
    window.BankCashKitState.searchVal = searchInput ? searchInput.value.trim() : '';
    window.BankCashKitState.page = 1;
    loadBankCashKitData(true);
  }, 300);
}

/**
 * 💡 Open Add / Edit Record Modal
 */
function openAddModalBankCashKit() {
  const form = document.getElementById('bck-form');
  if (form) form.reset();

  document.getElementById('bck-uniqueId').value = "";
  
  // Set default local today date YYYY-MM-DD
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  document.getElementById('bck-date').value = `${yyyy}-${mm}-${dd}`;

  const currentBook = window.BankCashKitState.activeSubBook;
  const bookTitle = SUB_BOOK_MAP[currentBook] || 'Ledger';
  document.getElementById('bck-form-title').innerText = `Add ${bookTitle} Entry`;

  // Set default method according to active sub-book
  const methodInput = document.getElementById('bck-method');
  if (methodInput) {
    methodInput.value = (currentBook === 'bank') ? 'Bank' : 'Cash';
  }

  document.getElementById('bck-modal').classList.remove('hidden');
}

function closeBankCashKitModal() {
  document.getElementById('bck-modal').classList.add('hidden');
}

/**
 * 💡 Save / Update Form Entry
 */
async function saveBankCashKitForm(e) {
  e.preventDefault();
  closeBankCashKitModal();

  const state = window.BankCashKitState;
  const uniqueId = document.getElementById('bck-uniqueId').value;
  const isAdd = (!uniqueId);

  const entry = {
    uniqueId: uniqueId,
    date: document.getElementById('bck-date').value,
    category: document.getElementById('bck-category').value,
    method: document.getElementById('bck-method').value,
    transfer: document.getElementById('bck-transfer').value,
    debit: parseFloat(document.getElementById('bck-debit').value) || 0,
    credit: parseFloat(document.getElementById('bck-credit').value) || 0,
    description: document.getElementById('bck-description').value,
    bookName: SUB_BOOK_MAP[state.activeSubBook],
    createdBy: window.AppState.currentUser || "System"
  };

  const action = isAdd ? 'saveBankCashEntry' : 'updateBankCashEntry';
  showToast("SUCCESS", "စာရင်းအား ဆာဗာတွင် သိမ်းဆည်းနေပါသည်...");

  try {
    const response = await callApi(action, entry);
    if (response && response.success) {
      showToast("SUCCESS", isAdd ? "စာရင်းသစ် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီရှင်။" : "စာရင်း အောင်မြင်စွာ ပြင်ဆင်ပြီးပါပြီရှင်။");
      loadBankCashKitData(true);
    } else {
      showToast("ERROR", "မအောင်မြင်ပါ: " + (response.message || "Unknown error"));
    }
  } catch (err) {
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
  }
}

/**
 * 💡 Edit Record Population
 */
function editBankCashKitEntry(uniqueId) {
  const row = window.BankCashKitState.activeData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "မူရင်းဒေတာကို ရှာမတွေ့ပါရှင်။");
    return;
  }

  openAddModalBankCashKit();

  document.getElementById('bck-uniqueId').value = row.uniqueId;
  document.getElementById('bck-date').value = row.date;
  document.getElementById('bck-category').value = row.category;
  document.getElementById('bck-method').value = row.method;
  document.getElementById('bck-transfer').value = row.transfer || "";
  document.getElementById('bck-debit').value = row.debit || 0;
  document.getElementById('bck-credit').value = row.credit || 0;
  document.getElementById('bck-description').value = row.description || "";

  const bookTitle = SUB_BOOK_MAP[window.BankCashKitState.activeSubBook] || 'Ledger';
  document.getElementById('bck-form-title').innerText = `Edit ${bookTitle} Entry`;
}

/**
 * 💡 Delete Entry Handler
 */
async function deleteBankCashKitEntry(uniqueId) {
  if (confirm("ဤစာရင်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလားရှင်?\n(ငွေလွှဲဖြစ်ပါက တွဲဖက်စာအုပ်ရှိ စာရင်းပါ တပြိုင်နက်တည်း ပျက်သွားပါမည်)")) {
    showToast("SUCCESS", "စာရင်းကို ဖျက်သိမ်းနေပါသည်...");
    try {
      const response = await callApi('deleteBankCashEntry', {
        uniqueId: uniqueId,
        bookName: SUB_BOOK_MAP[window.BankCashKitState.activeSubBook]
      });

      if (response && response.success) {
        showToast("SUCCESS", "စာရင်းအား အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီ။");
        loadBankCashKitData(true);
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
function exportToCSVBankCashKit() {
  const data = window.BankCashKitState.activeData;
  if (!data || data.length === 0) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှ မရှိပါရှင်။");
    return;
  }

  let csv = "NO,DATE,CATEGORY,DESCRIPTION,METHOD,DEBIT,CREDIT,BALANCES,TRANSFER,VR NO,MY,FY,UNIQUEID\n";
  data.forEach(row => {
    let desc = `"${(row.description || '').replace(/"/g, '""')}"`;
    csv += `${row.no},${row.date},${row.category},${desc},${row.method},${row.debit},${row.credit},${row.balances},${row.transfer || ''},${row.vrNo || ''},${row.my || ''},${row.fy || ''},${row.uniqueId}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${window.BankCashKitState.activeSubBook}_ledger_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}