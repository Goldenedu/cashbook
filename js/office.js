/**
 * GOLDEN ERP SYSTEM - OFFICE EXPENSE & INVENTORY MODULE
 * File: js/office.js
 * 💡 19-Column Schema (ID PID Removed) + Uniform Profit Preview & Description Formatting (- 4Nos)
 */

window.OfficeState = {
  page: 1,
  limit: 30,
  totalRows: 0,
  activeData: [],
  searchVal: '',
  stats: { totalIncome: 0, totalExpense: 0, balance: 0 },
  uniformProducts: []
};

/**
 * 💡 Dropdown Options များကို Config.js မှ Dynamic ဖြည့်ပေးခြင်း
 */
function populateDropdownsOffice() {
  const def = (window.DROPDOWNS && window.DROPDOWNS.officeExpBook) || {};

  const catSelect = document.getElementById('office-category');
  if (catSelect && def.category) {
    catSelect.innerHTML = def.category.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  const methodSelect = document.getElementById('office-method');
  if (methodSelect && def.method) {
    methodSelect.innerHTML = def.method.map(m => `<option value="${m}">${m}</option>`).join('');
  }

  const transSelect = document.getElementById('office-transfer');
  if (transSelect) {
    if (def.transfer) {
      transSelect.innerHTML = `<option value="">-- No Transfer --</option>` +
        def.transfer.map(t => `<option value="${t}">${t}</option>`).join('');
    } else {
      transSelect.innerHTML = `<option value="">-- No Transfer --</option>`;
    }
  }

  onCategoryChangeOffice();
}

/**
 * 💡 Category ပြောင်းလဲမှုပေါ် မူတည်၍ Form Controls များကို Dynamic ပိတ်/ဖွင့် လုပ်ပေးခြင်း
 */
function onCategoryChangeOffice() {
  const category = document.getElementById('office-category') ? document.getElementById('office-category').value : '';

  const prodContainer = document.getElementById('office-product-container');
  const profitPreviewContainer = document.getElementById('office-profit-preview-container');
  const qtyPriceContainer = document.getElementById('office-qty-price-container');
  const liabilitiesContainer = document.getElementById('office-liabilities-container');

  const debitInput = document.getElementById('office-debit');
  const creditInput = document.getElementById('office-credit');
  const methodSelect = document.getElementById('office-method');
  const transSelect = document.getElementById('office-transfer');
  const liabilitiesInput = document.getElementById('office-liabilities');

  const isUniform = (category === "Advance Uniform" || category === "Advance Unifrom");
  const isLiabilities = (category === "Liabilities");

  // 1. Advance Uniform စည်းမျဉ်း
  if (isUniform) {
    if (prodContainer) prodContainer.classList.remove('hidden');
    if (profitPreviewContainer) profitPreviewContainer.classList.remove('hidden');
    if (qtyPriceContainer) qtyPriceContainer.classList.remove('hidden');
    if (liabilitiesContainer) liabilitiesContainer.classList.add('hidden');

    if (debitInput) debitInput.disabled = false;
    if (creditInput) creditInput.disabled = false;
    if (methodSelect) methodSelect.disabled = false;
    if (transSelect) transSelect.disabled = false;

    fetchUniformProductsListOffice();
    onProductChangeOffice();
  } 
  // 2. Liabilities (ပေးရန်ကျန်) စည်းမျဉ်း
  else if (isLiabilities) {
    if (prodContainer) prodContainer.classList.add('hidden');
    if (profitPreviewContainer) profitPreviewContainer.classList.add('hidden');
    if (qtyPriceContainer) qtyPriceContainer.classList.add('hidden');
    if (liabilitiesContainer) liabilitiesContainer.classList.remove('hidden');

    // Liabilities Box မှလွဲ၍ ကျန်တာ အားလုံး ပိတ်မည်
    if (debitInput) { debitInput.value = 0; debitInput.disabled = true; }
    if (creditInput) { creditInput.value = 0; creditInput.disabled = true; }
    if (methodSelect) methodSelect.disabled = true;
    if (transSelect) { transSelect.value = ""; transSelect.disabled = true; }
  } 
  // 3. အခြား Standard Categories
  else {
    if (prodContainer) prodContainer.classList.add('hidden');
    if (profitPreviewContainer) profitPreviewContainer.classList.add('hidden');
    if (qtyPriceContainer) qtyPriceContainer.classList.add('hidden');
    if (liabilitiesContainer) liabilitiesContainer.classList.add('hidden');

    if (debitInput) debitInput.disabled = false;
    if (creditInput) creditInput.disabled = false;
    if (methodSelect) methodSelect.disabled = false;
    if (transSelect) transSelect.disabled = false;
    if (liabilitiesInput) liabilitiesInput.value = 0;
  }
}

/**
 * 💡 Uniform Product ID ရွေးချယ်ပါက Auto Description (- 4Nos) နှင့် Profit Preview Auto တွက်ပေးခြင်း
 */
function onProductChangeOffice() {
  const productId = document.getElementById('office-product-id') ? document.getElementById('office-product-id').value : '';
  const stockBadge = document.getElementById('office-stock-badge');
  const unit = parseFloat(document.getElementById('office-unit').value) || 1;

  if (productId && window.OfficeState.uniformProducts) {
    const prod = window.OfficeState.uniformProducts.find(p => p.productId === productId);
    if (prod) {
      // Auto Description with Qty suffix: e.g. "PID 003 Basic Class Pair-Female S - 4Nos"
      document.getElementById('office-description').value = `${prod.productId} ${prod.productName} ${prod.type} ${prod.size} - ${unit}Nos`;
      document.getElementById('office-unit-price').value = prod.unitPrice || 0;

      if (stockBadge) {
        stockBadge.innerText = `Stock: ${prod.currentQty}`;
        stockBadge.classList.remove('hidden');
      }

      calculateDebitOffice();
    }
  } else {
    if (stockBadge) stockBadge.classList.add('hidden');
  }
}

/**
 * 💡 Debit & Profit Preview Amount Auto တွက်ချက်ပေးခြင်း
 */
function calculateDebitOffice() {
  const category = document.getElementById('office-category').value;
  if (category === "Advance Uniform" || category === "Advance Unifrom") {
    const productId = document.getElementById('office-product-id') ? document.getElementById('office-product-id').value : '';
    const unit = parseFloat(document.getElementById('office-unit').value) || 0;
    const unitPrice = parseFloat(document.getElementById('office-unit-price').value) || 0;
    const creditVal = parseFloat(document.getElementById('office-credit').value) || 0;

    // Debit (Cost) Auto Calculate
    if (creditVal === 0) {
      document.getElementById('office-debit').value = unit * unitPrice;
    }

    // Auto Update Description with Qty
    if (productId && window.OfficeState.uniformProducts) {
      const prod = window.OfficeState.uniformProducts.find(p => p.productId === productId);
      if (prod) {
        document.getElementById('office-description').value = `${prod.productId} ${prod.productName} ${prod.type} ${prod.size} - ${unit}Nos`;
        
        // Calculate Profit Preview: unit * (sellingPrice - unitPrice)
        const sellingPrice = prod.sellingPrice || 0;
        const profitPerUnit = sellingPrice - unitPrice;
        const totalProfit = unit * profitPerUnit;

        const profitDisplayEl = document.getElementById('office-calculated-profit');
        if (profitDisplayEl) {
          profitDisplayEl.innerText = Number(totalProfit || 0).toLocaleString('en-US') + " MMK";
        }
      }
    }
  }
}

/**
 * 💡 Fetch Uniform Product List
 */
async function fetchUniformProductsListOffice() {
  if (window.OfficeState.uniformProducts.length > 0) return;
  try {
    const res = await callApi('getUniformData', { page: 1, limit: 1000 }, 'GET');
    if (res && res.data) {
      window.OfficeState.uniformProducts = res.data;
      const select = document.getElementById('office-product-id');
      if (select) {
        select.innerHTML = `<option value="">-- Select Product ID --</option>` +
          res.data.map(p => `<option value="${p.productId}">${p.productId} - ${p.productName} (${p.size})</option>`).join('');
      }
    }
  } catch (err) {
    console.warn("Failed to fetch uniform products:", err);
  }
}

/**
 * 💡 Load Office Expense Data
 */
async function loadOfficeData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  const state = window.OfficeState;

  try {
    const response = await callApi('getExpenseData', {
      bookName: 'Office Exp Book',
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

      updateStatsOffice();
      renderOfficeTable();
      updatePaginationOffice();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Office Exp data:", err);
  }
}

function updateStatsOffice() {
  const stats = window.OfficeState.stats;
  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };

  setT('off-total-income', Number(stats.totalIncome || 0).toLocaleString('en-US') + " MMK");
  setT('off-total-expense', Number(stats.totalExpense || 0).toLocaleString('en-US') + " MMK");
  setT('off-balance', Number(stats.balance || 0).toLocaleString('en-US') + " MMK");
  setT('off-entries-count', window.OfficeState.totalRows.toLocaleString('en-US'));
}

/**
 * 💡 Render Office Table (16 Visual Columns - ID PID Removed)
 */
function renderOfficeTable() {
  const tableBody = document.getElementById('office-table-body');
  if (!tableBody) return;

  const data = window.OfficeState.activeData;

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="16" class="text-center py-8 text-slate-500 font-bold">No office expense records found.</td></tr>`;
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
        <td class="text-right">${row.unit || '0'}</td>
        <td class="text-right">${Number(row.unitPrice || 0).toLocaleString('en-US')}</td>
        <td class="font-bold">${escapeHtml(row.method) || '-'}</td>
        <td class="text-right text-emerald-400 font-semibold">${row.debit > 0 ? Number(row.debit).toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
        <td class="text-right text-rose-400 font-semibold">${row.credit > 0 ? Number(row.credit).toLocaleString('en-US', {minimumFractionDigits: 2}) : '-'}</td>
        <td class="text-right text-slate-400 font-bold">${Number(row.balances).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td class="text-right text-rose-400 font-bold">${Number(row.liabilities || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
        <td>${escapeHtml(row.transfer) || '-'}</td>
        <td>${escapeHtml(row.vrNo || '-')}</td>
        <td>${escapeHtml(row.my || '-')}</td>
        <td>${escapeHtml(row.fy || '-')}</td>
        <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
          <div class="flex items-center justify-center gap-3 ${isViewer ? 'hidden' : ''}">
            <button onclick="editOfficeEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition ${lockClass}" title="${lockTitle}" ${row.isLocked && window.AppState.currentUserRole !== "Admin" ? 'disabled' : ''}>
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="deleteOfficeEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition ${lockClass}" title="${lockTitle}" ${row.isLocked && window.AppState.currentUserRole !== "Admin" ? 'disabled' : ''}>
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updatePaginationOffice() {
  const state = window.OfficeState;
  const info = document.getElementById('off-pagination-info');
  if (info) {
    const start = state.totalRows === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.totalRows);
    info.innerHTML = `Showing <span class="text-indigo-400 font-extrabold">${start}</span> to <span class="text-indigo-400 font-extrabold">${end}</span> of <span class="text-indigo-400 font-extrabold">${state.totalRows}</span> entries`;
  }

  const prevBtn = document.getElementById('off-btn-prev');
  if (prevBtn) prevBtn.disabled = (state.page === 1);

  const nextBtn = document.getElementById('off-btn-next');
  if (nextBtn) nextBtn.disabled = (state.page * state.limit >= state.totalRows);
}

function changePageOffice(dir) {
  const state = window.OfficeState;
  if (dir === -1 && state.page > 1) {
    state.page--;
    loadOfficeData(false);
  } else if (dir === 1 && (state.page * state.limit) < state.totalRows) {
    state.page++;
    loadOfficeData(false);
  }
}

let searchTimeoutOffice;
function onSearchInputOffice() {
  clearTimeout(searchTimeoutOffice);
  searchTimeoutOffice = setTimeout(() => {
    const input = document.getElementById('office-search');
    window.OfficeState.searchVal = input ? input.value.trim() : '';
    window.OfficeState.page = 1;
    loadOfficeData(true);
  }, 300);
}

function openAddModalOffice() {
  const form = document.getElementById('office-form');
  if (form) form.reset();

  document.getElementById('office-uniqueId').value = "";

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  document.getElementById('office-date').value = `${yyyy}-${mm}-${dd}`;

  document.getElementById('office-form-title').innerText = "Add Office Expense Entry";

  populateDropdownsOffice();
  document.getElementById('office-modal').classList.remove('hidden');
}

function closeOfficeModal() {
  document.getElementById('office-modal').classList.add('hidden');
}

function parseLiabilityAmount(val) {
  if (!val) return 0;
  let str = String(val).trim();
  let isNeg = (str.includes('(') && str.includes(')')) || str.startsWith('-');
  let num = parseFloat(str.replace(/[^\d.]/g, ''));
  if (isNaN(num)) return 0;
  return isNeg ? -num : num;
}

/**
 * 💡 Save / Update Office Entry (Invalidates Cache Across Books)
 */
async function saveOfficeForm(e) {
  e.preventDefault();
  closeOfficeModal();

  const uniqueId = document.getElementById('office-uniqueId').value;
  const isAdd = (!uniqueId);

  const entry = {
    uniqueId: uniqueId,
    date: document.getElementById('office-date').value,
    category: document.getElementById('office-category').value,
    id: document.getElementById('office-product-id') ? document.getElementById('office-product-id').value : '',
    unit: parseFloat(document.getElementById('office-unit').value) || 0,
    unitPrice: parseFloat(document.getElementById('office-unit-price').value) || 0,
    method: document.getElementById('office-method').value,
    debit: parseFloat(document.getElementById('office-debit').value) || 0,
    credit: parseFloat(document.getElementById('office-credit').value) || 0,
    liabilities: parseLiabilityAmount(document.getElementById('office-liabilities').value),
    transfer: document.getElementById('office-transfer').value,
    description: document.getElementById('office-description').value,
    bookName: 'Office Exp Book',
    createdBy: window.AppState.currentUser || "System"
  };

  const action = isAdd ? 'saveExpenseEntry' : 'updateExpenseEntry';
  showToast("SUCCESS", "စာရင်းအား သိမ်းဆည်းနေပါသည်...");
  toggleLoading(true);

  try {
    const response = await callApi(action, entry);
    toggleLoading(false);

    if (response && response.success) {
      showToast("SUCCESS", isAdd ? "Office Expense စာရင်းသစ် သိမ်းဆည်းပြီးပါပြီရှင်။" : "Office Expense စာရင်း ပြင်ဆင်ပြီးပါပြီရှင်။");
      
      if (window.BankCache) window.BankCache = { bank: null, cash: null, kitchen: null };
      loadOfficeData(true);
    } else {
      showToast("ERROR", "မအောင်မြင်ပါ: " + (response ? response.message : ""));
    }
  } catch (err) {
    toggleLoading(false);
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
  }
}

function editOfficeEntry(uniqueId) {
  const row = window.OfficeState.activeData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "မူရင်းဒေတာကို ရှာမတွေ့ပါရှင်။");
    return;
  }

  openAddModalOffice();

  document.getElementById('office-uniqueId').value = row.uniqueId;
  document.getElementById('office-date').value = row.date;
  document.getElementById('office-category').value = row.category;
  
  onCategoryChangeOffice();

  if (document.getElementById('office-product-id')) document.getElementById('office-product-id').value = row.id || "";
  if (document.getElementById('office-unit')) document.getElementById('office-unit').value = row.unit || 1;
  if (document.getElementById('office-unit-price')) document.getElementById('office-unit-price').value = row.unitPrice || 0;
  
  document.getElementById('office-method').value = row.method || "Cash";
  document.getElementById('office-debit').value = row.debit || 0;
  document.getElementById('office-credit').value = row.credit || 0;
  document.getElementById('office-liabilities').value = row.liabilities || 0;
  document.getElementById('office-transfer').value = row.transfer || "";
  document.getElementById('office-description').value = row.description || "";

  document.getElementById('office-form-title').innerText = "Edit Office Expense Entry";
}

async function deleteOfficeEntry(uniqueId) {
  if (confirm("ဤ Office Expense စာရင်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလားရှင်?")) {
    showToast("SUCCESS", "စာရင်းကို ဖျက်သိမ်းနေပါသည်...");
    toggleLoading(true);

    try {
      const response = await callApi('deleteExpenseEntry', {
        uniqueId: uniqueId,
        bookName: 'Office Exp Book'
      });

      toggleLoading(false);

      if (response && response.success) {
        showToast("SUCCESS", "စာရင်းအား အောင်မြင်စွာ ဖျက်သိမ်းပြီးပါပြီ။");
        if (window.BankCache) window.BankCache = { bank: null, cash: null, kitchen: null };
        loadOfficeData(true);
      } else {
        showToast("ERROR", "ဖျက်သိမ်းမှု မအောင်မြင်ပါ: " + (response ? response.message : ""));
      }
    } catch (err) {
      toggleLoading(false);
      showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
    }
  }
}

function exportToCSVOffice() {
  const data = window.OfficeState.activeData;
  if (!data || data.length === 0) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှ မရှိပါရှင်။");
    return;
  }

  let csv = "NO,DATE,CATEGORY,DESCRIPTION,UNIT,UNIT PRICE,METHOD,DEBIT,CREDIT,BALANCES,LIABILITIES,TRANSFER,VR NO,MY,FY,UNIQUEID\n";
  data.forEach(row => {
    let desc = `"${(row.description || '').replace(/"/g, '""')}"`;
    csv += `${row.no},${row.date},${row.category},${desc},${row.unit || 0},${row.unitPrice || 0},${row.method},${row.debit},${row.credit},${row.balances},${row.liabilities || 0},${row.transfer || ''},${row.vrNo || ''},${row.my || ''},${row.fy || ''},${row.uniqueId}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `office_expense_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
