/**
 * GOLDEN ERP SYSTEM - BANK, CASH & KITCHEN LEDGER MODULE
 * File: js/bank-cash-kit.js
 * 💡 Optimized with In-Memory Caching & Config Centralization
 */

window.BankCashKitState = {
  activeSubBook: 'bank', // 'bank', 'cash', or 'kitchen'
  page: 1,
  limit: 30,
  totalRows: 0,
  activeData: [],
  searchVal: '',
  stats: { totalIncome: 0, totalExpense: 0, balance: 0 }
};

// 💡 IN-MEMORY DATA CACHE (0ms Instant Load)
window.BankCache = {
  bank: null,
  cash: null,
  kitchen: null
};

/**
 * 💡 Switch Sub-Book (Bank vs Cash vs Kitchen) - Zero Latency
 */
function switchSubBook(subBookKey) {
  window.BankCashKitState.activeSubBook = subBookKey;
  window.BankCashKitState.page = 1;

  populateDropdownsBCK();
  loadBankCashKitData(false, false); // false = no spinner, false = use cache if available
}

/**
 * 💡 Dynamic Dropdown Wiring using window.CONFIG
 */
function populateDropdownsBCK() {
  const subBook = window.BankCashKitState.activeSubBook;
  const configKey = subBook === 'kitchen' ? 'kitchenExpBook' : (subBook === 'cash' ? 'cashBook' : 'bankBook');
  const def = (window.DROPDOWNS && window.DROPDOWNS[configKey]) || {};

  const catSelect = document.getElementById('bck-category');
  if (catSelect && def.category) {
    catSelect.innerHTML = def.category.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  const methodSelect = document.getElementById('bck-method');
  if (methodSelect && def.method) {
    methodSelect.innerHTML = def.method.map(m => `<option value="${m}">${m}</option>`).join('');
  }

  const transSelect = document.getElementById('bck-transfer');
  if (transSelect) {
    if (def.transfer) {
      transSelect.innerHTML = `<option value="">-- No Transfer --</option>` +
        def.transfer.map(t => `<option value="${t}">${t}</option>`).join('');
    } else {
      transSelect.innerHTML = `<option value="">-- No Transfer --</option>`;
    }
  }
}

/**
 * 💡 High-Speed Data Reader with Memory Caching
 */
async function loadBankCashKitData(showSpinner = false, forceRefresh = false) {
  const state = window.BankCashKitState;
  const subBook = state.activeSubBook;
  const sheetConfig = window.CONFIG && window.CONFIG.sheets ? window.CONFIG.sheets[subBook] : null;
  const bookName = sheetConfig ? sheetConfig.bookName : 'Bank Book';

  // 1. If Cache exists and search is empty & not forcing refresh -> Render INSTANTLY (0ms)
  if (!forceRefresh && !state.searchVal && window.BankCache[subBook]) {
    const cached = window.BankCache[subBook];
    state.activeData = cached.data;
    state.totalRows = cached.totalRows;
    state.stats = cached.stats;

    updateStatsBankCashKit();
    renderBankCashKitTable();
    updatePaginationBankCashKit();
    return;
  }

  // 2. Otherwise Fetch from API
  if (showSpinner) toggleLoading(true);

  try {
    const response = await callApi('getBankCashData', {
      bookName: bookName,
      page: state.page,
      limit: state.limit,
      searchVal: state.searchVal
    }, 'GET');

    if (showSpinner) toggleLoading(false);

    if (response && response.data) {
      state.activeData = response.data;
      state.totalRows = response.totalRows || 0;
      state.stats = response.stats || { totalIncome: 0, totalExpense: 0, balance: 0 };

      // Store in memory cache if not a search query
      if (!state.searchVal) {
        window.BankCache[subBook] = {
          data: response.data,
          totalRows: response.totalRows,
          stats: response.stats
        };
      }

      updateStatsBankCashKit();
      renderBankCashKitTable();
      updatePaginationBankCashKit();
    }
  } catch (err) {
    if (showSpinner) toggleLoading(false);
    console.error("Error loading Bank/Cash/Kitchen data:", err);
  }
}

function updateStatsBankCashKit() {
  const stats = window.BankCashKitState.stats;
  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };

  setT('bck-total-income', Number(stats.totalIncome || 0).toLocaleString('en-US') + " MMK");
  setT('bck-total-expense', Number(stats.totalExpense || 0).toLocaleString('en-US') + " MMK");
  setT('bck-balance', Number(stats.balance || 0).toLocaleString('en-US') + " MMK");
  setT('bck-entries-count', window.BankCashKitState.totalRows.toLocaleString('en-US'));
}

function renderBankCashKitTable() {
  const tableBody = document.getElementById('bck-table-body');
  if (!tableBody) return;

  const data = window.BankCashKitState.activeData;

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="13" class="text-center py-8 text-slate-500 font-bold">No entries found for this book.</td></tr>`;
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
    loadBankCashKitData(true, true);
  } else if (dir === 1 && (state.page * state.limit) < state.totalRows) {
    state.page++;
    loadBankCashKitData(true, true);
  }
}

let searchTimeoutBCK;
function onSearchInputBankCashKit() {
  clearTimeout(searchTimeoutBCK);
  searchTimeoutBCK = setTimeout(() => {
    const searchInput = document.getElementById('bck-search');
    window.BankCashKitState.searchVal = searchInput ? searchInput.value.trim() : '';
    window.BankCashKitState.page = 1;
    loadBankCashKitData(false, true); // Search without blocking overlay
  }, 300);
}

function openAddModalBankCashKit() {
  const form = document.getElementById('bck-form');
  if (form) form.reset();

  document.getElementById('bck-uniqueId').value = "";

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  document.getElementById('bck-date').value = `${yyyy}-${mm}-${dd}`;

  const subBook = window.BankCashKitState.activeSubBook;
  const sheetConfig = window.CONFIG && window.CONFIG.sheets ? window.CONFIG.sheets[subBook] : null;
  const bookTitle = sheetConfig ? sheetConfig.bookName : 'Ledger';
  document.getElementById('bck-form-title').innerText = `Add ${bookTitle} Entry`;

  populateDropdownsBCK();
  document.getElementById('bck-[#bck-modal]') || document.getElementById('bck-modal').classList.remove('hidden');
}

function closeBankCashKitModal() {
  const modal = document.getElementById('bck-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * 💡 Save / Update Entry (Invalidates Cache Across All 3 Books for Transfer Safety)
 */
async function saveBankCashKitForm(e) {
  e.preventDefault();
  closeBankCashKitModal();

  const state = window.BankCashKitState;
  const subBook = state.activeSubBook;
  const sheetConfig = window.CONFIG && window.CONFIG.sheets ? window.CONFIG.sheets[subBook] : null;
  const bookName = sheetConfig ? sheetConfig.bookName : 'Bank Book';

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
    bookName: bookName,
    createdBy: window.AppState.currentUser || "System"
  };

  const action = isAdd ? 'saveBankCashEntry' : 'updateBankCashEntry';
  showToast("SUCCESS", "စာရင်းအား သိမ်းဆည်းနေပါသည်...");
  toggleLoading(true);

  try {
    const response = await callApi(action, entry);
    toggleLoading(false);

    if (response && response.success) {
      showToast("SUCCESS", isAdd ? "စာရင်းသစ် သိမ်းဆည်းပြီးပါပြီရှင်။" : "စာရင်း ပြင်ဆင်ပြီးပါပြီရှင်။");

      // Invalidate memory cache across all books so transfers reflect instantly
      window.BankCache = { bank: null, cash: null, kitchen: null };

      loadBankCashKitData(false, true);
    } else {
      showToast("ERROR", "မအောင်မြင်ပါ: " + (response ? response.message : ""));
    }
  } catch (err) {
    toggleLoading(false);
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
  }
}

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

  const subBook = window.BankCashKitState.activeSubBook;
  const sheetConfig = window.CONFIG && window.CONFIG.sheets ? window.CONFIG.sheets[subBook] : null;
  const bookTitle = sheetConfig ? sheetConfig.bookName : 'Ledger';
  document.getElementById('bck-form-title').innerText = `Edit ${bookTitle} Entry`;
}

async function deleteBankCashKitEntry(uniqueId) {
  if (confirm("ဤစာရင်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလားရှင်?\n(ငွေလွှဲဖြစ်ပါက တွဲဖက်စာအုပ်ရှိ စာရင်းပါ တပြိုင်နက်တည်း ပျက်သွားပါမည်)")) {
    showToast("SUCCESS", "စာရင်းကို ဖျက်သိမ်းနေပါသည်...");
    toggleLoading(true);

    try {
      const subBook = window.BankCashKitState.activeSubBook;
      const sheetConfig = window.CONFIG && window.CONFIG.sheets ? window.CONFIG.sheets[subBook] : null;
      const bookName = sheetConfig ? sheetConfig.bookName : 'Bank Book';

      const response = await callApi('deleteBankCashEntry', {
        uniqueId: uniqueId,
        bookName: bookName
      });

      toggleLoading(false);

      if (response && response.success) {
        showToast("SUCCESS", "စာရင်းအား အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီ။");
        window.BankCache = { bank: null, cash: null, kitchen: null };
        loadBankCashKitData(false, true);
      } else {
        showToast("ERROR", "ဖျက်သိမ်းမှု မအောင်မြင်ပါ: " + (response ? response.message : ""));
      }
    } catch (err) {
      toggleLoading(false);
      showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
    }
  }
}

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
