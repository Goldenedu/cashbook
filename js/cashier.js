/**
 * GOLDEN ERP SYSTEM - CASHIER CASH BOOK MODULE
 * File: js/cashier.js
 * 💡 SECURED: Uses callApi(), 19-Column Income Match, RESPONSIBILITY PERSON, Strict Search, 2-Decimal Formatting & Invoice Print Engine
 */

let currentCashierSubBook = 'CACash'; // 'CACash' | 'CABank' | 'CAOffice' | 'CAKitchen' | 'CAPayroll' | 'todayIncome'
let allCashierData = [];
let filteredCashierData = [];
let currentCashierPage = 1;
const CASHIER_PAGE_SIZE = 15;

/**
 * 💡 Initialize View
 * @param {string} bookName 
 * @param {boolean} useCache 
 */
function initCashierView(bookName = 'CACash', useCache = true) {
  switchCashierSubTab(bookName, useCache);
}

/**
 * 💡 Switch Cashier Sub-Tabs (CACash, CABank, CAOffice, CAKitchen, CAPayroll, todayIncome)
 * @param {string} subTab 
 * @param {boolean} useCache 
 */
function switchCashierSubTab(subTab = 'CACash', useCache = true) {
  currentCashierSubBook = subTab;
  currentCashierPage = 1;

  // Reset All Sub-Tab Styling to Inactive State
  document.querySelectorAll('.ca-sub-tab-btn').forEach(btn => {
    btn.classList.remove('ring-2', 'ring-white', 'shadow-lg', 'scale-105', 'opacity-100');
    btn.classList.add('opacity-70');
  });

  // Highlight Active Sub-Tab
  const activeBtn = document.getElementById(`ca-tab-${subTab}`);
  if (activeBtn) {
    activeBtn.classList.remove('opacity-70');
    activeBtn.classList.add('ring-2', 'ring-white', 'shadow-lg', 'opacity-100');
  }

  // Toggle "Add New Entry" button visibility (Hidden for Read-Only 'todayIncome' tab)
  const btnAdd = document.getElementById('ca-btn-add');
  if (btnAdd) {
    if (subTab === 'todayIncome') {
      btnAdd.classList.add('hidden');
    } else {
      btnAdd.classList.remove('hidden');
    }
  }

  loadCashierData(useCache);
}

/**
 * 💡 Load Cashier Data
 * @param {boolean} useCache 
 */
async function loadCashierData(useCache = true) {
  try {
    if (currentCashierSubBook === 'todayIncome') {
      await loadTodayIncomeForCashier(useCache);
      return;
    }

    const cacheKey = `getCashierData_${JSON.stringify({ bookName: currentCashierSubBook })}`;
    const hasCache = useCache && !!window.getApiCache(cacheKey);

    if (!hasCache && typeof toggleLoading === 'function') {
      toggleLoading(true);
    }

    const response = await callApi('getCashierData', {
      bookName: currentCashierSubBook,
      forceRefresh: !useCache
    });

    if (response && response.success) {
      allCashierData = response.data || [];
      renderStatsCashier(response.stats || { totalIncome: 0, totalExpense: 0, balance: 0 });
      applyCashierSearchAndRender();
    }
  } catch (error) {
    console.error('Failed to load Cashier data:', error);
    if (typeof showToast === 'function') showToast("ERROR", "Cashier စာရင်းများ ဖတ်ယူ၍ မရပါ: " + error.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

/**
 * 💡 Load Today's Student Income Entries directly for Invoice Printing
 * @param {boolean} useCache 
 */
async function loadTodayIncomeForCashier(useCache = true) {
  try {
    if (typeof toggleLoading === 'function') toggleLoading(true);

    const response = await callApi('getTodayIncomeForCashier', {
      forceRefresh: !useCache
    });

    if (response && response.success) {
      allCashierData = response.data || [];
      
      let totalInc = 0, totalExp = 0;
      allCashierData.forEach(r => {
        totalInc += Number(r.credit || 0);
        totalExp += Number(r.debit || 0);
      });

      renderStatsCashier({ totalIncome: totalInc, totalExpense: totalExp, balance: totalInc - totalExp });
      applyCashierSearchAndRender();
    }
  } catch (error) {
    console.error("Failed to load Today Income for Cashier:", error);
    if (typeof showToast === 'function') showToast("ERROR", "ယနေ့ ဝင်ငွေစာရင်းများ ဖတ်ယူ၍ မရပါ: " + error.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

/**
 * 💡 Render KPI Header Stats Cards with 2 Decimal Places Format
 */
function renderStatsCashier(stats) {
  const elInc = document.getElementById('ca-total-income');
  const elExp = document.getElementById('ca-total-expense');
  const elBal = document.getElementById('ca-balance');
  const elCount = document.getElementById('ca-entries-count');

  if (elInc) elInc.textContent = `${Number(stats.totalIncome || 0).toLocaleString('en-US')} MMK`;
  if (elExp) elExp.textContent = `${Number(stats.totalExpense || 0).toLocaleString('en-US')} MMK`;
  if (elBal) elBal.textContent = `${Number(stats.balance || 0).toLocaleString('en-US')} MMK`;
  if (elCount) elCount.textContent = allCashierData.length.toLocaleString('en-US');
}

/**
 * 💡 Strict Search Criteria Filter
 */
function filterCashierData(list = [], searchVal = '', fromDate = '', toDate = '') {
  return list.filter(row => {
    // 1. Date Range Check
    if (typeof window.isDateInRange === 'function') {
      if (!window.isDateInRange(row.date || row.effDate, fromDate, toDate)) return false;
    }

    // 2. Text Search Check
    if (!searchVal || !searchVal.trim()) return true;
    const q = searchVal.trim().toLowerCase();

    if (currentCashierSubBook === 'todayIncome') {
      const nameMatch = String(row.fyidName || row.name || '').toLowerCase().includes(q);
      const fyidMatch = String(row.fyid || '').toLowerCase().includes(q);
      const idMatch = String(row.id || '').toLowerCase().includes(q);
      return nameMatch || fyidMatch || idMatch;
    }

    const descMatch = String(row.description || '').toLowerCase().includes(q);
    const catMatch = String(row.category || '').toLowerCase().includes(q);
    const respMatch = String(row.respPerson || '').toLowerCase().includes(q);
    const debitMatch = String(row.debit || '').includes(q);
    const creditMatch = String(row.credit || '').includes(q);

    return descMatch || catMatch || respMatch || debitMatch || creditMatch;
  });
}

function clearDateFilterCashier() {
  const fromEl = document.getElementById('ca-date-from');
  const toEl = document.getElementById('ca-date-to');
  if (fromEl) fromEl.value = '';
  if (toEl) toEl.value = '';
  applyCashierSearchAndRender();
}

/**
 * 💡 Apply Search & Render Table
 */
function applyCashierSearchAndRender() {
  const searchInput = document.getElementById('cashier-search');
  const query = searchInput ? searchInput.value.trim() : '';

  const fromEl = document.getElementById('ca-date-from');
  const toEl = document.getElementById('ca-date-to');
  const fromDate = fromEl ? fromEl.value : '';
  const toDate = toEl ? toEl.value : '';

  filteredCashierData = filterCashierData(allCashierData, query, fromDate, toDate);
  currentCashierPage = 1;
  renderCashierTable();
}

function onSearchInputCashier() {
  applyCashierSearchAndRender();
}

/**
 * 💡 Dynamic Table Header Renderer
 */
function renderCashierTableHead() {
  const thead = document.getElementById('cashier-table-head');
  if (!thead) return;

  const isTodayIncomeTab = (currentCashierSubBook === 'todayIncome');

  if (isTodayIncomeTab) {
    // 💡 MAIN INCOME BOOK 19-COLUMN HEADER SCHEMA
    thead.innerHTML = `
      <tr class="bg-[#0e172a]">
        <th scope="col" class="w-12 text-center text-slate-400 text-xs py-3">NO</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">EFFECT DATE</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">DATE</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">FY</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">ID</th>
        <th scope="col" class="w-32 text-slate-400 text-xs py-3">FYID</th>
        <th scope="col" class="min-w-[200px] text-slate-400 text-xs py-3">FYID NAME</th>
        <th scope="col" class="w-32 text-slate-400 text-xs py-3">CLASS</th>
        <th scope="col" class="w-32 text-slate-400 text-xs py-3">CATEGORY</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">ACCOUNT NAME</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">METHOD</th>
        <th scope="col" class="w-32 text-right text-rose-400 text-xs py-3">DEBIT (ပြန်အမ်း)</th>
        <th scope="col" class="w-32 text-right text-emerald-400 text-xs py-3">CREDIT (ဝင်ငွေ)</th>
        <th scope="col" class="w-32 text-right text-indigo-400 text-xs py-3">AUT AMOUNT</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">PROMO</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">MY</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">VR NO</th>
        <th scope="col" class="min-w-[150px] text-slate-400 text-xs py-3">REMARK</th>
        <th scope="col" class="w-28 text-center text-slate-400 text-xs py-3 right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg">ACTION</th>
      </tr>
    `;
  } else {
    // 💡 STANDARD CASHIER SUB-LEDGER 17-COLUMN HEADER SCHEMA
    thead.innerHTML = `
      <tr class="bg-[#0e172a]">
        <th scope="col" class="w-12 text-center text-slate-400 text-xs py-3">NO</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">DATE</th>
        <th scope="col" class="w-36 text-amber-300 text-xs py-3">RESPONSIBILITY PERSON</th>
        <th scope="col" class="w-36 text-slate-400 text-xs py-3">CATEGORY</th>
        <th scope="col" class="min-w-[280px] text-slate-400 text-xs py-3">DESCRIPTION</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">METHOD</th>
        <th scope="col" class="w-32 text-right text-emerald-400 text-xs py-3">DEBIT</th>
        <th scope="col" class="w-32 text-right text-rose-400 text-xs py-3">CREDIT</th>
        <th scope="col" class="w-36 text-right text-slate-400 text-xs py-3">BALANCES</th>
        <th scope="col" class="w-32 text-slate-400 text-xs py-3">TRANSFER</th>
        <th scope="col" class="w-32 text-slate-400 text-xs py-3">VR NO</th>
        <th scope="col" class="w-24 text-slate-400 text-xs py-3">MY</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">FY</th>
        <th scope="col" class="w-32 text-slate-400 text-xs py-3">BOOK NAME</th>
        <th scope="col" class="w-28 text-slate-400 text-xs py-3">CREATED BY</th>
        <th scope="col" class="w-32 text-slate-400 text-xs py-3">CREATED AT</th>
        <th scope="col" class="w-28 text-center text-slate-400 text-xs py-3 right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg">ACTION</th>
      </tr>
    `;
  }
}

/**
 * 💡 Render Table Grid Rows with 2 Decimal Places Format
 */
function renderCashierTable() {
  renderCashierTableHead();

  const tbody = document.getElementById('cashier-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';

  const totalEntries = filteredCashierData.length;
  const totalPages = Math.ceil(totalEntries / CASHIER_PAGE_SIZE) || 1;
  if (currentCashierPage > totalPages) currentCashierPage = totalPages;

  const startIndex = (currentCashierPage - 1) * CASHIER_PAGE_SIZE;
  const endIndex = Math.min(startIndex + CASHIER_PAGE_SIZE, totalEntries);
  const pageItems = filteredCashierData.slice(startIndex, endIndex);

  const isTodayIncomeTab = (currentCashierSubBook === 'todayIncome');

  if (pageItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${isTodayIncomeTab ? '19' : '17'}" class="text-center py-8 text-slate-500 font-bold">ရှာဖွေမှုနှင့် ကိုက်ညီသော စာရင်း မရှိပါ။</td></tr>`;
    updateCashierPaginationInfo(0, 0, 0);
    return;
  }

  pageItems.forEach((item, index) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-800/30 transition-all border-b border-slate-800/40 text-xs';

    const srNo = startIndex + index + 1;

    if (isTodayIncomeTab) {
      // 💡 READ-ONLY TODAY INCOME 19-COLUMN ROW WITH PRINT INVOICE BUTTON
      tr.innerHTML = `
        <td class="text-center font-mono text-slate-400 py-3 px-3">${srNo}</td>
        <td class="font-mono py-3 px-3">${escapeHtml(item.effDate) || '-'}</td>
        <td class="font-mono py-3 px-3">${escapeHtml(item.date) || '-'}</td>
        <td class="font-mono font-bold text-indigo-400 py-3 px-3">${escapeHtml(item.fy) || '-'}</td>
        <td class="font-mono font-bold py-3 px-3">${escapeHtml(item.id) || '-'}</td>
        <td class="font-mono font-bold text-indigo-300 py-3 px-3">${escapeHtml(item.fyid) || '-'}</td>
        <td class="font-bold text-slate-100 py-3 px-3">${escapeHtml(item.fyidName) || '-'}</td>
        <td class="py-3 px-3">${escapeHtml(item.class) || '-'}</td>
        <td class="py-3 px-3"><span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold">${escapeHtml(item.category) || '-'}</span></td>
        <td class="font-semibold text-slate-200 py-3 px-3">${escapeHtml(item.accountName) || '-'}</td>
        <td class="font-bold text-slate-400 py-3 px-3">${escapeHtml(item.method) || '-'}</td>
        <td class="text-right font-mono font-bold text-rose-400 py-3 px-3">${item.debit > 0 ? Number(item.debit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
        <td class="text-right font-mono font-bold text-emerald-400 py-3 px-3">${item.credit > 0 ? Number(item.credit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
        <td class="text-right font-mono font-bold text-indigo-400 py-3 px-3">${item.autAmount > 0 ? Number(item.autAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
        <td class="text-xs py-3 px-3">${escapeHtml(item.promo) || '-'}</td>
        <td class="font-mono text-xs py-3 px-3">${escapeHtml(item.my) || '-'}</td>
        <td class="font-mono text-xs text-slate-400 py-3 px-3">${escapeHtml(item.vrNo) || '-'}</td>
        <td class="max-w-xs truncate text-xs text-slate-400 py-3 px-3" title="${escapeHtml(item.remark || '')}">${escapeHtml(item.remark) || '-'}</td>
        <td class="text-center right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg py-3 px-3">
          <button onclick="printInvoice('${item.uniqueId}')" class="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition font-bold" title="Print Invoice">
            <i class="fa-solid fa-print mr-1"></i> Print
          </button>
        </td>
      `;
    } else {
      // 💡 STANDARD CASHIER SUB-LEDGER 17-COLUMN ROW WITH 2 DECIMAL FORMATTING
      tr.innerHTML = `
        <td class="text-center font-mono text-slate-400 py-3 px-3">${srNo}</td>
        <td class="font-mono py-3 px-3">${item.date || '-'}</td>
        <td class="font-bold text-amber-300 py-3 px-3">${item.respPerson || '-'}</td>
        <td class="py-3 px-3"><span class="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-semibold">${item.category || '-'}</span></td>
        <td class="font-bold text-slate-100 max-w-xs truncate py-3 px-3" title="${item.description}">${item.description || '-'}</td>
        <td class="font-semibold py-3 px-3">${item.method || '-'}</td>
        <td class="text-right font-mono font-bold text-emerald-400 py-3 px-3">${item.debit > 0 ? Number(item.debit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
        <td class="text-right font-mono font-bold text-rose-400 py-3 px-3">${item.credit > 0 ? Number(item.credit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
        <td class="text-right font-mono font-bold text-indigo-400 py-3 px-3">${Number(item.balances || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        <td class="py-3 px-3 text-slate-300">${item.transfer || '-'}</td>
        <td class="font-mono text-slate-400 py-3 px-3">${item.vrNo || '-'}</td>
        <td class="font-mono py-3 px-3">${item.my || '-'}</td>
        <td class="font-mono font-bold text-indigo-400 py-3 px-3">${item.fy || '-'}</td>
        <td class="py-3 px-3">${item.bookName || '-'}</td>
        <td class="py-3 px-3">${item.createdBy || 'System'}</td>
        <td class="font-mono text-slate-500 py-3 px-3">${item.createdAt ? item.createdAt.slice(0,10) : '-'}</td>
        <td class="text-center right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg py-3 px-3">
          <div class="flex items-center justify-center gap-2">
            <button onclick="editCashierEntry('${item.uniqueId}')" class="p-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-lg transition" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
            <button onclick="deleteCashierEntry('${item.uniqueId}')" class="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition btn-delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      `;
    }

    tbody.appendChild(tr);
  });

  updateCashierPaginationInfo(startIndex + 1, endIndex, totalEntries);
}

function updateCashierPaginationInfo(start, end, total) {
  const info = document.getElementById('ca-pagination-info');
  if (info) info.textContent = `Showing ${start} to ${end} of ${total} entries`;

  const btnPrev = document.getElementById('ca-btn-prev');
  const btnNext = document.getElementById('ca-btn-next');

  if (btnPrev) btnPrev.disabled = (currentCashierPage <= 1);
  if (btnNext) btnNext.disabled = (end >= total);
}

function changePageCashier(delta) {
  currentCashierPage += delta;
  renderCashierTable();
}

/**
 * 💡 Populate Dropdowns from config.js
 */
function populateDropdownsCashier() {
  const def = (window.DROPDOWNS && window.DROPDOWNS[`${currentCashierSubBook}Book`]) || window.DROPDOWNS?.cashBook || {};

  const catSelect = document.getElementById('ca-category');
  if (catSelect && def.category) {
    catSelect.innerHTML = def.category.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  const methodSelect = document.getElementById('ca-method');
  if (methodSelect) {
    const isBank = currentCashierSubBook === 'CABank';
    methodSelect.innerHTML = `
      <option value="Cash" ${!isBank ? 'selected' : ''}>Cash</option>
      <option value="Bank" ${isBank ? 'selected' : ''}>Bank</option>
    `;
  }

  const transSelect = document.getElementById('ca-transfer');
  if (transSelect) {
    const options = ["CABank", "CACash", "CAOffice", "CAKitchen", "CAPayroll"].filter(b => b !== currentCashierSubBook);
    transSelect.innerHTML = `<option value="">-- No Transfer --</option>` +
      options.map(t => `<option value="${t}">${t}</option>`).join('');
  }
}

function onCategoryChangeCashier() {
  autoFillTransferDescriptionCashier();
}

function onTransferTargetChangeCashier() {
  autoFillTransferDescriptionCashier();
}

/**
 * 💡 Auto Fill Transfer Description
 */
function autoFillTransferDescriptionCashier() {
  const cat = document.getElementById('ca-category')?.value;
  const transferTo = document.getElementById('ca-transfer')?.value;
  const descEl = document.getElementById('ca-description');

  if (cat === "Transfer" && transferTo && descEl) {
    descEl.value = `[${currentCashierSubBook} Transfer to ${transferTo}] `;
  }
}

/**
 * 💡 Open Add Modal
 */
function openAddModalCashier() {
  const form = document.getElementById('cashier-form');
  if (form) form.reset();

  document.getElementById('ca-uniqueId').value = '';
  document.getElementById('ca-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('ca-debit').value = 0;
  document.getElementById('ca-credit').value = 0;

  populateDropdownsCashier();

  document.getElementById('ca-form-title').textContent = `Add Entry (${currentCashierSubBook})`;
  document.getElementById('cashier-modal').classList.remove('hidden');
}

function closeCashierModal() {
  const modal = document.getElementById('cashier-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * 💡 Save Form Handler
 */
async function saveCashierForm(e) {
  e.preventDefault();

  const uniqueId = document.getElementById('ca-uniqueId').value;
  const payload = {
    uniqueId,
    bookName: currentCashierSubBook,
    date: document.getElementById('ca-date').value,
    respPerson: document.getElementById('ca-resp-person').value,
    category: document.getElementById('ca-category').value,
    method: document.getElementById('ca-method').value,
    transfer: document.getElementById('ca-transfer').value,
    debit: Number(document.getElementById('ca-debit').value || 0),
    credit: Number(document.getElementById('ca-credit').value || 0),
    description: document.getElementById('ca-description').value,
    createdBy: (window.AppState ? window.AppState.currentUser : '') || "System"
  };

  try {
    closeCashierModal();
    const actionName = uniqueId ? 'updateCashierEntry' : 'saveCashierEntry';

    const response = await callApi(actionName, payload);

    if (response && response.success) {
      showToast('SUCCESS', 'Cashier စာရင်း အချက်အလက်များ အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ။');
      if (typeof clearAllApiCache === 'function') clearAllApiCache();
      loadCashierData(false);
    }
  } catch (error) {
    showToast('ERROR', `အမှားအယွင်း ဖြစ်ပေါ်ခဲ့သည်: ${error.message}`);
  }
}

/**
 * 💡 Edit Entry
 */
function editCashierEntry(uniqueId) {
  const row = allCashierData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "မူရင်း အချက်အလက် ရှာမတွေ့ပါ။");
    return;
  }

  openAddModalCashier();

  document.getElementById('ca-uniqueId').value = row.uniqueId || '';
  document.getElementById('ca-date').value = row.date || '';
  document.getElementById('ca-resp-person').value = row.respPerson || '';
  document.getElementById('ca-category').value = row.category || 'Income';
  document.getElementById('ca-method').value = row.method || 'Cash';
  document.getElementById('ca-transfer').value = row.transfer || '';
  document.getElementById('ca-debit').value = row.debit || 0;
  document.getElementById('ca-credit').value = row.credit || 0;
  document.getElementById('ca-description').value = row.description || '';

  document.getElementById('ca-form-title').textContent = `Edit Entry (${currentCashierSubBook})`;
}

/**
 * 💡 Delete Entry
 */
async function deleteCashierEntry(uniqueId) {
  if (!confirm("ဤ စာရင်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလား။")) return;

  try {
    const response = await callApi('deleteCashierEntry', { uniqueId, bookName: currentCashierSubBook });

    if (response && response.success) {
      showToast('SUCCESS', 'Cashier စာရင်းအား အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီ။');
      if (typeof clearAllApiCache === 'function') clearAllApiCache();
      loadCashierData(false);
    }
  } catch (error) {
    showToast('ERROR', `ဖျက်သိမ်းမှု အမှား: ${error.message}`);
  }
}

/**
 * 💡 CSV Export Engine with UTF-8 BOM
 */
function exportToCSVCashier() {
  if (!allCashierData || allCashierData.length === 0) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့် စာရင်းမျှ မရှိပါ။");
    return;
  }

  let csv = "NO,DATE,RESPONSIBILITY PERSON,CATEGORY,DESCRIPTION,METHOD,DEBIT,CREDIT,BALANCES,TRANSFER,VR NO,MY,FY,BOOK NAME,CREATED BY,CREATED AT,UNIQUEID\n";
  allCashierData.forEach(r => {
    let desc = `"${(r.description || '').replace(/"/g, '""')}"`;
    let resp = `"${(r.respPerson || '').replace(/"/g, '""')}"`;
    csv += `${r.no},${r.date},${resp},${r.category},${desc},${r.method},${r.debit || 0},${r.credit || 0},${r.balances || 0},${r.transfer || ''},${r.vrNo || ''},${r.my || ''},${r.fy || ''},${r.bookName || ''},${r.createdBy || ''},${r.createdAt || ''},${r.uniqueId}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${currentCashierSubBook}_export_${new Date().toISOString().slice(0, 10)}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
