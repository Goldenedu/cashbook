/**
 * GOLDEN ERP SYSTEM - BANK & CASH BOOK CONTROLLER
 * File: js/bank-cash-kit.js (PRECISE SEARCH ENGINE & TRANSFER AUTO-DESC)
 */

var bckPage = 1;
var bckLimit = 30;
var bckTotalRows = 0;
var bckActiveData = [];
var currentSubBook = 'bank'; // 'bank' or 'cash'

/**
 * 💡 Switch between Bank Book and Cash Book
 */
function switchSubBook(bookType) {
  currentSubBook = bookType.toLowerCase();
  bckPage = 1;

  const titleEl = document.getElementById('page-title');
  if (titleEl) {
    titleEl.textContent = currentSubBook === 'bank' ? 'Main Bank Book' : 'Main Cash Book';
  }

  updateSidebarHighlight(currentSubBook);
  loadBankCashKitData(false, true);
}

/**
 * 💡 Load Bank or Cash Ledger Data
 */
async function loadBankCashKitData(isSilent = false, forceRefresh = false) {
  const token = localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token');
  if (!token) return;

  try {
    if (!isSilent && typeof toggleLoading === 'function') toggleLoading(true);

    const searchInput = document.getElementById('bck-search');
    const searchVal = searchInput ? searchInput.value.trim() : '';
    const bookName = currentSubBook === 'bank' ? 'Main Bank Book' : 'Main Cash Book';

    const res = await callApi('getBankCashData', {
      bookName: bookName,
      page: bckPage,
      limit: bckLimit,
      searchVal: searchVal,
      forceRefresh: forceRefresh
    });

    if (!res || !res.success) {
      throw new Error(res?.message || "စာရင်း ဒေတာများ ခေါ်ယူခြင်း မအောင်မြင်ပါ။");
    }

    bckActiveData = res.data || [];
    bckTotalRows = res.totalRows || 0;

    renderStatsBankCashKit(res.stats || { totalIncome: 0, totalExpense: 0, balance: 0 });
    renderTableBankCashKit();
    updatePaginationUIBankCashKit();

  } catch (err) {
    console.error("Bank/Cash Load Error:", err);
    if (!isSilent && typeof showToast === 'function') {
      showToast("ERROR", "စာရင်း ဒေတာများ ဆွဲယူ၍ မရပါ: " + err.message);
    }
  } finally {
    if (!isSilent && typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function renderStatsBankCashKit(stats) {
  const incTotal = document.getElementById('bck-total-income');
  const expTotal = document.getElementById('bck-total-expense');
  const balTotal = document.getElementById('bck-balance');
  const countTotal = document.getElementById('bck-entries-count');

  if (incTotal) incTotal.textContent = Number(stats.totalIncome || 0).toLocaleString('en-US') + ' MMK';
  if (expTotal) expTotal.textContent = Number(stats.totalExpense || 0).toLocaleString('en-US') + ' MMK';
  if (balTotal) balTotal.textContent = Number(stats.balance || 0).toLocaleString('en-US') + ' MMK';
  if (countTotal) countTotal.textContent = Number(bckTotalRows || 0).toLocaleString('en-US');
}

/**
 * 💡 Render Table Grid Rows with Precise Search Filtering
 * 🎯 Criteria: Search ONLY by Description, Category, Debit, Credit
 */
function renderTableBankCashKit() {
  const tbody = document.getElementById('bck-table-body');
  if (!tbody) return;

  const searchInput = document.getElementById('bck-search');
  const searchVal = searchInput ? searchInput.value.trim().toLowerCase() : '';

  let filteredRows = bckActiveData || [];

  // 💡 Client-side Precise Filter (Description, Category, Debit, Credit)
  if (searchVal) {
    filteredRows = filteredRows.filter(row => {
      const descMatch = String(row.description || '').toLowerCase().includes(searchVal);
      const catMatch = String(row.category || '').toLowerCase().includes(searchVal);
      const debitMatch = String(row.debit || '').includes(searchVal);
      const creditMatch = String(row.credit || '').includes(searchVal);
      return descMatch || catMatch || debitMatch || creditMatch;
    });
  }

  if (!filteredRows || filteredRows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" class="text-center py-8 text-slate-500 font-bold">မည်သည့် စာရင်းမှ မရှိသေးပါ။</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredRows.map((row) => {
    const isViewer = (window.AppState ? window.AppState.currentUserRole : '') === "Viewer";
    const lockClass = (row.isLocked || isViewer) ? "opacity-30 cursor-not-allowed pointer-events-none" : "hover:text-white";
    const lockTitle = row.isLocked ? "Older than 7 days (Locked)" : "";

    return `
      <tr class="hover:bg-slate-800/30 text-slate-300">
        <td class="text-center font-semibold text-slate-500">${row.no || '-'}</td>
        <td class="font-mono text-xs">${escapeHtml(row.date) || '-'}</td>
        <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">${escapeHtml(row.category) || '-'}</span></td>
        <td class="font-bold text-slate-100 max-w-sm truncate" title="${escapeHtml(row.description)}">${escapeHtml(row.description) || '-'}</td>
        <td class="font-bold text-slate-400">${escapeHtml(row.method) || '-'}</td>
        <td class="text-right text-emerald-400 font-mono font-bold">${row.debit > 0 ? Number(row.debit).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-rose-400 font-mono font-bold">${row.credit > 0 ? Number(row.credit).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-slate-200 font-mono font-bold">${Number(row.balances || 0).toLocaleString('en-US')}</td>
        <td class="text-xs text-indigo-400">${escapeHtml(row.transfer) || '-'}</td>
        <td class="font-mono text-xs text-slate-400">${escapeHtml(row.vrNo) || '-'}</td>
        <td class="font-mono text-xs">${escapeHtml(row.my) || '-'}</td>
        <td class="font-mono text-xs">${escapeHtml(row.fy) || '-'}</td>
        <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
          <div class="flex items-center justify-center gap-3">
            <button onclick="editBankCashKitEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition ${lockClass}" title="Edit ${lockTitle}" ${row.isLocked || isViewer ? 'disabled' : ''}>
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="deleteBankCashKitEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition ${lockClass}" title="Delete ${lockTitle}" ${row.isLocked || isViewer ? 'disabled' : ''}>
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 💡 Open Modal for New Entry
 */
function openAddModalBankCashKit() {
  const form = document.getElementById('bck-form');
  if (form) form.reset();

  document.getElementById('bck-uniqueId').value = "";
  document.getElementById('bck-date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('bck-debit').value = 0;
  document.getElementById('bck-credit').value = 0;

  populateDropdownsBCK();

  document.getElementById('bck-form-title').innerText = currentSubBook === 'bank' ? "Add Bank Entry" : "Add Cash Entry";
  document.getElementById('bck-modal').classList.remove('hidden');
}

function closeBankCashKitModal() {
  const modal = document.getElementById('bck-modal');
  if (modal) modal.classList.add('hidden');
}

function populateDropdownsBCK() {
  const catSelect = document.getElementById('bck-category');
  const methodSelect = document.getElementById('bck-method');
  const transferSelect = document.getElementById('bck-transfer');

  if (catSelect) {
    catSelect.innerHTML = `
      <option value="Opening">Opening</option>
      <option value="Income">Income</option>
      <option value="Expense">Expense</option>
      <option value="Bank Loan">Bank Loan</option>
      <option value="Cash Loan">Cash Loan</option>
      <option value="Transfer">Transfer</option>
    `;
  }

  if (methodSelect) {
    methodSelect.innerHTML = `
      <option value="Bank" ${currentSubBook === 'bank' ? 'selected' : ''}>Bank</option>
      <option value="Cash" ${currentSubBook === 'cash' ? 'selected' : ''}>Cash</option>
    `;
  }

  if (transferSelect) {
    transferSelect.innerHTML = `
      <option value="">-- No Transfer --</option>
      <option value="Main Bank Book">Main Bank Book</option>
      <option value="Main Cash Book">Main Cash Book</option>
      <option value="Office Exp Book">Office Exp Book</option>
      <option value="Kitchen Exp Book">Kitchen Exp Book</option>
      <option value="HR Payroll Exp Book">HR Payroll Exp Book</option>
    `;
  }
}

/**
 * 💡 TRANSFER AUTO-DESCRIPTION ENGINE
 */
function onCategoryChangeBCK() {
  autoFillTransferDescriptionBCK();
}

function onTransferTargetChangeBCK() {
  autoFillTransferDescriptionBCK();
}

function autoFillTransferDescriptionBCK() {
  const cat = document.getElementById('bck-category')?.value;
  const transferTo = document.getElementById('bck-transfer')?.value;
  const descEl = document.getElementById('bck-description');
  const currentBook = currentSubBook === 'bank' ? 'Main Bank Book' : 'Main Cash Book';

  if (cat === "Transfer" && transferTo && descEl) {
    descEl.value = `${currentBook} Transfer to ${transferTo}`;
  }
}

/**
 * 💡 Save / Submit Entry (Add or Update)
 */
async function saveBankCashKitForm(e) {
  e.preventDefault();

  const bookName = currentSubBook === 'bank' ? 'Main Bank Book' : 'Main Cash Book';
  const uniqueId = document.getElementById('bck-uniqueId')?.value || "";

  const payload = {
    bookName: bookName,
    date: document.getElementById('bck-date')?.value || "",
    category: document.getElementById('bck-category')?.value || "Income",
    method: document.getElementById('bck-method')?.value || (currentSubBook === 'bank' ? 'Bank' : 'Cash'),
    transfer: document.getElementById('bck-transfer')?.value || "",
    debit: parseFloat(document.getElementById('bck-debit')?.value) || 0,
    credit: parseFloat(document.getElementById('bck-credit')?.value) || 0,
    description: document.getElementById('bck-description')?.value || "",
    uniqueId: uniqueId
  };

  try {
    closeBankCashKitModal();
    if (typeof toggleLoading === 'function') toggleLoading(true);

    const actionName = uniqueId ? 'updateBankCashEntry' : 'saveBankCashEntry';
    const res = await callApi(actionName, payload);

    if (res && res.success) {
      if (typeof showToast === 'function') showToast("SUCCESS", "စာရင်း သိမ်းဆည်းမှု အောင်မြင်ပါသည်။");
      await loadBankCashKitData(true, true);
    } else {
      throw new Error(res?.message || "သိမ်းဆည်းမှု မအောင်မြင်ပါ။");
    }
  } catch (err) {
    if (typeof showToast === 'function') showToast("ERROR", "မအောင်မြင်ပါ: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

/**
 * 💡 Edit Entry
 */
function editBankCashKitEntry(uniqueId) {
  const row = bckActiveData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    if (typeof showToast === 'function') showToast("ERROR", "မူရင်းဒေတာ ရှာမတွေ့ပါ။");
    return;
  }

  openAddModalBankCashKit();

  document.getElementById('bck-uniqueId').value = row.uniqueId || "";
  document.getElementById('bck-date').value = row.date || "";
  document.getElementById('bck-category').value = row.category || "Income";
  document.getElementById('bck-method').value = row.method || (currentSubBook === 'bank' ? 'Bank' : 'Cash');
  document.getElementById('bck-transfer').value = row.transfer || "";
  document.getElementById('bck-debit').value = row.debit || 0;
  document.getElementById('bck-credit').value = row.credit || 0;
  document.getElementById('bck-description').value = row.description || "";

  document.getElementById('bck-form-title').innerText = "Edit Entry";
}

/**
 * 💡 Delete Entry
 */
async function deleteBankCashKitEntry(uniqueId) {
  if (!confirm("ဤစာရင်းအား အပြီးတိုင် ပယ်ဖျက်ရန် သေချာပါသလား။")) {
    return;
  }

  try {
    if (typeof toggleLoading === 'function') toggleLoading(true);
    const res = await callApi('deleteBankCashEntry', { uniqueId: uniqueId });

    if (res && res.success) {
      if (typeof showToast === 'function') showToast("SUCCESS", "စာရင်း ပယ်ဖျက်ခြင်း အောင်မြင်ပါသည်။");
      await loadBankCashKitData(true, true);
    } else {
      throw new Error(res?.message || "ပယ်ဖျက်ခြင်း မအောင်မြင်ပါ။");
    }
  } catch (err) {
    if (typeof showToast === 'function') showToast("ERROR", "မအောင်မြင်ပါ: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function changePageBankCashKit(dir) {
  if (dir === -1 && bckPage > 1) {
    bckPage--;
    loadBankCashKitData(false);
  } else if (dir === 1 && (bckPage * bckLimit) < bckTotalRows) {
    bckPage++;
    loadBankCashKitData(false);
  }
}

function updatePaginationUIBankCashKit() {
  const info = document.getElementById('bck-pagination-info');
  if (info) {
    const start = bckTotalRows === 0 ? 0 : (bckPage - 1) * bckLimit + 1;
    const end = Math.min(bckPage * bckLimit, bckTotalRows);
    info.innerHTML = `Showing <span class="text-indigo-400 font-extrabold">${start}</span> to <span class="text-indigo-400 font-extrabold">${end}</span> of <span class="text-indigo-400 font-extrabold">${bckTotalRows}</span> entries`;
  }

  const prevBtn = document.getElementById('bck-btn-prev');
  if (prevBtn) prevBtn.disabled = (bckPage === 1);

  const nextBtn = document.getElementById('bck-btn-next');
  if (nextBtn) nextBtn.disabled = (bckPage * bckLimit >= bckTotalRows);
}

function onSearchInputBankCashKit() {
  if (window.searchTimeoutBck) clearTimeout(window.searchTimeoutBck);
  window.searchTimeoutBck = setTimeout(() => {
    renderTableBankCashKit();
  }, 100);
}

function exportToCSVBankCashKit() {
  if (!bckActiveData || bckActiveData.length === 0) {
    if (typeof showToast === 'function') showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှ မရှိပါ။");
    return;
  }

  let csv = "NO,DATE,CATEGORY,DESCRIPTION,METHOD,DEBIT,CREDIT,BALANCES,TRANSFER,VR NO,MY,FY,UNIQUEID\n";
  bckActiveData.forEach(r => {
    let desc = `"${r.description || ''}"`;
    csv += `${r.no},${r.date},${r.category},${desc},${r.method},${r.debit},${r.credit},${r.balances},${r.transfer || ''},${r.vrNo},${r.my || ''},${r.fy || ''},${r.uniqueId}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${currentSubBook}_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
