/**
 * GOLDEN ERP SYSTEM - UNIFORM INVENTORY LEDGER MODULE
 * File: js/uniform.js
 */

window.UniformState = {
  page: 1,
  limit: 30,
  totalRows: 0,
  activeData: [],
  searchVal: '',
  stats: { sellingUnit: 0, currentQty: 0, totalStockValue: 0, totalProduct: 0 }
};

/**
 * 💡 Load Uniform Inventory Data
 */
async function loadUniformData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  const state = window.UniformState;

  try {
    const response = await callApi('getUniformData', {
      page: state.page,
      limit: state.limit,
      searchVal: state.searchVal
    }, 'GET');

    if (!isSilent) toggleLoading(false);

    if (response && response.data) {
      state.activeData = response.data;
      state.totalRows = response.totalRows || 0;
      state.stats = response.stats || { sellingUnit: 0, currentQty: 0, totalStockValue: 0, totalProduct: 0 };

      updateStatsUniform();
      renderUniformTable();
      updatePaginationUniform();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Uniform data:", err);
  }
}

/**
 * 💡 Update Stats Cards
 */
function updateStatsUniform() {
  const stats = window.UniformState.stats;

  const sUnitEl = document.getElementById('uni-selling-unit');
  if (sUnitEl) sUnitEl.innerText = Number(stats.sellingUnit || 0).toLocaleString('en-US');

  const cQtyEl = document.getElementById('uni-current-qty');
  if (cQtyEl) cQtyEl.innerText = Number(stats.currentQty || 0).toLocaleString('en-US');

  const valEl = document.getElementById('uni-stock-value');
  if (valEl) valEl.innerText = Number(stats.totalStockValue || 0).toLocaleString('en-US') + " MMK";

  const countEl = document.getElementById('uni-total-products');
  if (countEl) countEl.innerText = window.UniformState.totalRows.toLocaleString('en-US');
}

/**
 * 💡 Render Uniform Table Rows
 */
function renderUniformTable() {
  const tableBody = document.getElementById('uniform-table-body');
  if (!tableBody) return;

  const data = window.UniformState.activeData;

  if (!data || data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="14" class="text-center py-8 text-slate-500 font-bold">No uniform products found in inventory.</td></tr>`;
    return;
  }

  const isViewer = (window.AppState.currentUserRole === "Viewer");

  tableBody.innerHTML = data.map((row) => {
    return `
      <tr class="hover:bg-slate-800/20 text-slate-300">
        <td class="text-center font-semibold text-slate-500">${row.no}</td>
        <td class="font-bold text-slate-200">${escapeHtml(row.productId || '-')}</td>
        <td class="font-bold text-slate-300">${escapeHtml(row.productName || '-')}</td>
        <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">${escapeHtml(row.type || '-')}</span></td>
        <td class="font-mono font-semibold">${escapeHtml(row.size || '-')}</td>
        <td class="text-right font-medium">${row.openingStock || 0}</td>
        <td class="text-right text-rose-400">${Number(row.unitPrice || 0).toLocaleString('en-US')}</td>
        <td class="text-right">${Number(row.totalAmount || 0).toLocaleString('en-US')}</td>
        <td class="text-right text-emerald-400">${Number(row.sellingPrice || 0).toLocaleString('en-US')}</td>
        <td class="text-right text-emerald-400 font-bold">${Number(row.profitAmount || 0).toLocaleString('en-US')}</td>
        <td class="text-right text-teal-400 font-bold">${row.sellingUnit || 0}</td>
        <td class="text-right font-bold text-slate-200">${row.currentQty || 0}</td>
        <td class="text-right font-bold text-indigo-400">${Number(row.totalStockValue || 0).toLocaleString('en-US')}</td>
        <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
          <div class="flex items-center justify-center gap-3 ${isViewer ? 'hidden' : ''}">
            <button onclick="editUniformEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition"><i class="fa-solid fa-pen-to-square"></i></button>
            <button onclick="deleteUniformEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function updatePaginationUniform() {
  const state = window.UniformState;
  const info = document.getElementById('uni-pagination-info');
  if (info) {
    const start = state.totalRows === 0 ? 0 : (state.page - 1) * state.limit + 1;
    const end = Math.min(state.page * state.limit, state.totalRows);
    info.innerHTML = `Showing <span class="text-indigo-400 font-extrabold">${start}</span> to <span class="text-indigo-400 font-extrabold">${end}</span> of <span class="text-indigo-400 font-extrabold">${state.totalRows}</span> entries`;
  }
}

function changePageUniform(dir) {
  const state = window.UniformState;
  if (dir === -1 && state.page > 1) {
    state.page--;
    loadUniformData(false);
  } else if (dir === 1 && (state.page * state.limit) < state.totalRows) {
    state.page++;
    loadUniformData(false);
  }
}

let searchTimeoutUniform;
function onSearchInputUniform() {
  clearTimeout(searchTimeoutUniform);
  searchTimeoutUniform = setTimeout(() => {
    const input = document.getElementById('uniform-search');
    window.UniformState.searchVal = input ? input.value.trim() : '';
    window.UniformState.page = 1;
    loadUniformData(true);
  }, 300);
}

/**
 * 💡 Open Add Product Modal with Auto Sequence PID
 */
function openAddModalUniform() {
  const form = document.getElementById('uniform-form');
  if (form) form.reset();

  document.getElementById('uni-uniqueId').value = "";

  // Auto Sequence PID calculation
  let maxSeq = 0;
  if (window.UniformState.activeData) {
    window.UniformState.activeData.forEach(row => {
      const pid = String(row.productId || "").trim();
      let num = parseInt(pid.replace(/[^\d]/g, ""), 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    });
  }
  const nextId = "PID " + String(maxSeq + 1).padStart(3, '0');
  document.getElementById('uni-pid').value = nextId;

  document.getElementById('uni-form-title').innerText = "Add New Uniform Product";
  document.getElementById('uniform-modal').classList.remove('hidden');
}

function closeUniformModal() {
  document.getElementById('uniform-modal').classList.add('hidden');
}

/**
 * 💡 Save / Update Uniform Product
 */
async function saveUniformForm(e) {
  e.preventDefault();
  closeUniformModal();

  const uniqueId = document.getElementById('uni-uniqueId').value;
  const isAdd = (!uniqueId);

  const entry = {
    uniqueId: uniqueId,
    productId: document.getElementById('uni-pid').value,
    productName: document.getElementById('uni-name').value,
    type: document.getElementById('uni-type').value,
    size: document.getElementById('uni-size').value,
    openingStock: parseFloat(document.getElementById('uni-stock').value) || 0,
    unitPrice: parseFloat(document.getElementById('uni-price').value) || 0,
    sellingPrice: parseFloat(document.getElementById('uni-sellprice').value) || 0,
    createdBy: window.AppState.currentUser || "System"
  };

  const action = isAdd ? 'saveUniformEntry' : 'updateUniformEntry';
  showToast("SUCCESS", "ကုန်ပစ္စည်းအချက်အလက် သိမ်းဆည်းနေပါသည်...");

  try {
    const response = await callApi(action, entry);
    if (response && response.success) {
      showToast("SUCCESS", isAdd ? "ကုန်ပစ္စည်းသစ် အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီရှင်။" : "ကုန်ပစ္စည်း အချက်အလက် ပြင်ဆင်ပြီးပါပြီရှင်။");
      loadUniformData(true);
    } else {
      showToast("ERROR", "မအောင်မြင်ပါ: " + (response.message || ""));
    }
  } catch (err) {
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
  }
}

/**
 * 💡 Edit Uniform Entry
 */
function editUniformEntry(uniqueId) {
  const row = window.UniformState.activeData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "မူရင်းဒေတာကို ရှာမတွေ့ပါရှင်။");
    return;
  }

  openAddModalUniform();

  document.getElementById('uni-uniqueId').value = row.uniqueId;
  document.getElementById('uni-pid').value = row.productId;
  document.getElementById('uni-name').value = row.productName || "";
  document.getElementById('uni-type').value = row.type || "";
  document.getElementById('uni-size').value = row.size || "";
  document.getElementById('uni-stock').value = row.openingStock || 0;
  document.getElementById('uni-price').value = row.unitPrice || 0;
  document.getElementById('uni-sellprice').value = row.sellingPrice || 0;

  document.getElementById('uni-form-title').innerText = "Edit Uniform Product";
}

/**
 * 💡 Delete Uniform Entry
 */
async function deleteUniformEntry(uniqueId) {
  if (confirm("ဤကုန်ပစ္စည်းမှတ်တမ်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလားရှင်?")) {
    showToast("SUCCESS", "မှတ်တမ်းကို ဖျက်သိမ်းနေပါသည်...");
    try {
      const response = await callApi('deleteUniformEntry', { uniqueId });
      if (response && response.success) {
        showToast("SUCCESS", "ကုန်ပစ္စည်းမှတ်တမ်းအား ဖျက်သိမ်းပြီးပါပြီရှင်။");
        loadUniformData(true);
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
function exportToCSVUniform() {
  const data = window.UniformState.activeData;
  if (!data || data.length === 0) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှ မရှိပါရှင်။");
    return;
  }

  let csv = "NO,PRODUCT ID,PRODUCT NAME,TYPE,SIZE,OPENING STOCK,UNIT PRICE,TOTAL AMOUNT,SELLING PRICE,PROFIT AMOUNT,SELLING UNIT,CURRENT QTY,TOTAL STOCK VALUE,UNIQUEID\n";
  data.forEach(row => {
    let name = `"${(row.productName || '').replace(/"/g, '""')}"`;
    let type = `"${(row.type || '').replace(/"/g, '""')}"`;
    let size = `"${(row.size || '').replace(/"/g, '""')}"`;
    csv += `${row.no},${row.productId},${name},${type},${size},${row.openingStock || 0},${row.unitPrice || 0},${row.totalAmount || 0},${row.sellingPrice || 0},${row.profitAmount || 0},${row.sellingUnit || 0},${row.currentQty || 0},${row.totalStockValue || 0},${row.uniqueId}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `uniform_ledger_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}