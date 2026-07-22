/**
 * GOLDEN ERP SYSTEM - PROMOTION REFERENCE MATRIX MODULE
 * File: js/promotion.js
 */

window.PromotionState = {
  page: 1,
  limit: 50,
  totalRows: 0,
  activeData: [],
  searchVal: '',
  filterFy: '',
  filterCategory: '',
  stats: { totalRates: 0, averageOriginalPrice: 0, uniqueFYs: 0 }
};

/**
 * 💡 Load Promotion Data
 */
async function loadPromotionData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  const state = window.PromotionState;

  try {
    const response = await callApi('getPromotionData', {
      page: state.page,
      limit: state.limit,
      searchVal: state.searchVal
    }, 'GET');

    if (!isSilent) toggleLoading(false);

    if (response && response.data) {
      state.activeData = response.data;
      state.totalRows = response.totalRows || 0;
      state.stats = response.stats || { totalRates: 0, averageOriginalPrice: 0, uniqueFYs: 0 };

      renderPromotionTable();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Promotion data:", err);
  }
}

/**
 * 💡 Render Promotion Matrix Table
 */
function renderPromotionTable() {
  const tableBody = document.getElementById('promo-table-body');
  if (!tableBody) return;

  const state = window.PromotionState;
  const searchVal = (document.getElementById('promo-search') ? document.getElementById('promo-search').value : '').toLowerCase().trim();
  const filterFy = document.getElementById('promo-filter-fy') ? document.getElementById('promo-filter-fy').value : '';
  const filterCat = document.getElementById('promo-filter-cat') ? document.getElementById('promo-filter-cat').value : '';

  const filtered = (state.activeData || []).filter(row => {
    if (filterFy && row.fy !== filterFy) return false;
    if (filterCat && row.category !== filterCat) return false;
    if (searchVal) {
      const cls = (row.class || '').toLowerCase();
      const cat = (row.category || '').toLowerCase();
      if (!cls.includes(searchVal) && !cat.includes(searchVal)) return false;
    }
    return true;
  });

  const countEl = document.getElementById('promo-total-count');
  if (countEl) countEl.innerText = filtered.length;

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="15" class="text-center py-8 text-slate-500 font-bold">No promotion reference records found.</td></tr>`;
    return;
  }

  const isViewer = (window.AppState.currentUserRole === "Viewer");

  tableBody.innerHTML = filtered.map((row) => {
    return `
      <tr class="hover:bg-slate-800/20 text-slate-300">
        <td class="text-center font-semibold text-slate-500">${row.no}</td>
        <td class="font-bold text-slate-100">${escapeHtml(row.fy || '-')}</td>
        <td class="font-bold text-slate-200">${escapeHtml(row.class || '-')}</td>
        <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">${escapeHtml(row.category || '-')}</span></td>
        <td class="text-right text-indigo-400 font-semibold">${Number(row.registration || 0).toLocaleString('en-US')}</td>
        <td class="text-right text-slate-400 font-semibold">${Number(row.originalPrice || 0).toLocaleString('en-US')}</td>
        <td class="text-right text-teal-400 font-medium">${row.proA ? Number(row.proA).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-teal-400 font-medium">${row.proB ? Number(row.proB).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-teal-400 font-medium">${row.proC ? Number(row.proC).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-teal-400 font-medium">${row.proD ? Number(row.proD).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-teal-400 font-medium">${row.proE ? Number(row.proE).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-amber-400 font-semibold">${row.halfScholar ? Number(row.halfScholar).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-emerald-400 font-semibold">${row.fullScholar ? Number(row.fullScholar).toLocaleString('en-US') : '-'}</td>
        <td class="max-w-xs truncate text-slate-500 text-xs" title="${escapeHtml(row.remark || '')}">${escapeHtml(row.remark || '-')}</td>
        <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
          <div class="flex items-center justify-center gap-3 ${isViewer ? 'hidden' : ''}">
            <button onclick="editPromotionEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition"><i class="fa-solid fa-pen-to-square"></i></button>
            <button onclick="deletePromotionEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition"><i class="fa-solid fa-trash"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

let searchTimeoutPromo;
function onSearchInputPromotion() {
  clearTimeout(searchTimeoutPromo);
  searchTimeoutPromo = setTimeout(() => { renderPromotionTable(); }, 300);
}

function applyPromotionFilters() {
  renderPromotionTable();
}

/**
 * 💡 Save / Update Promotion Entry
 */
async function savePromotionForm(e) {
  e.preventDefault();
  closePromotionModal();

  const uniqueId = document.getElementById('promo-uniqueId').value;
  const isAdd = (!uniqueId);

  const entry = {
    uniqueId: uniqueId,
    fy: document.getElementById('promo-fy').value,
    class: document.getElementById('promo-class').value,
    category: document.getElementById('promo-category').value,
    registration: parseFloat(document.getElementById('promo-registration').value) || 0,
    originalPrice: parseFloat(document.getElementById('promo-original-price').value) || 0,
    proA: parseFloat(document.getElementById('promo-pro-a').value) || 0,
    proB: parseFloat(document.getElementById('promo-pro-b').value) || 0,
    proC: parseFloat(document.getElementById('promo-pro-c').value) || 0,
    proD: parseFloat(document.getElementById('promo-pro-d').value) || 0,
    proE: parseFloat(document.getElementById('promo-pro-e').value) || 0,
    halfScholar: parseFloat(document.getElementById('promo-half-scholar').value) || 0,
    fullScholar: parseFloat(document.getElementById('promo-full-scholar').value) || 0,
    remark: document.getElementById('promo-remark').value,
    createdBy: window.AppState.currentUser || "System"
  };

  const action = isAdd ? 'savePromotionEntry' : 'updatePromotionEntry';
  showToast("SUCCESS", "Promotion Matrix ဒေတာ သိမ်းဆည်းနေပါသည်...");

  try {
    const response = await callApi(action, entry);
    if (response && response.success) {
      showToast("SUCCESS", isAdd ? "Promotion နှုန်းထားသစ် သိမ်းဆည်းပြီးပါပြီရှင်။" : "Promotion နှုန်းထား ပြင်ဆင်ပြီးပါပြီရှင်။");
      loadPromotionData(true);
    } else {
      showToast("ERROR", "မအောင်မြင်ပါ: " + (response.message || ""));
    }
  } catch (err) {
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
  }
}

function openAddModalPromotion() {
  const form = document.getElementById('promo-form');
  if (form) form.reset();

  document.getElementById('promo-uniqueId').value = "";
  document.getElementById('promo-modal').classList.remove('hidden');
}

function closePromotionModal() {
  document.getElementById('promo-modal').classList.add('hidden');
}

/**
 * 💡 Edit Promotion Entry
 */
function editPromotionEntry(uniqueId) {
  const row = window.PromotionState.activeData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "မူရင်းဒေတာကို ရှာမတွေ့ပါရှင်။");
    return;
  }

  openAddModalPromotion();

  document.getElementById('promo-uniqueId').value = row.uniqueId;
  document.getElementById('promo-fy').value = row.fy || "";
  document.getElementById('promo-class').value = row.class || "";
  document.getElementById('promo-category').value = row.category || "";
  document.getElementById('promo-registration').value = row.registration || 0;
  document.getElementById('promo-original-price').value = row.originalPrice || 0;
  document.getElementById('promo-pro-a').value = row.proA || 0;
  document.getElementById('promo-pro-b').value = row.proB || 0;
  document.getElementById('promo-pro-c').value = row.proC || 0;
  document.getElementById('promo-pro-d').value = row.proD || 0;
  document.getElementById('promo-pro-e').value = row.proE || 0;
  document.getElementById('promo-half-scholar').value = row.halfScholar || 0;
  document.getElementById('promo-full-scholar').value = row.fullScholar || 0;
  document.getElementById('promo-remark').value = row.remark || "";
}

/**
 * 💡 Delete Promotion Entry
 */
async function deletePromotionEntry(uniqueId) {
  if (confirm("ဤ Promotion နှုန်းထားမှတ်တမ်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလားရှင်?")) {
    showToast("SUCCESS", "မှတ်တမ်းကို ဖျက်သိမ်းနေပါသည်...");
    try {
      const response = await callApi('deletePromotionEntry', { uniqueId });
      if (response && response.success) {
        showToast("SUCCESS", "Promotion နှုန်းထားအား ဖျက်သိမ်းပြီးပါပြီရှင်။");
        loadPromotionData(true);
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
function exportToCSVPromotion() {
  const data = window.PromotionState.activeData;
  if (!data || data.length === 0) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှ မရှိပါရှင်။");
    return;
  }

  let csv = "NO,FY,CLASS,CATEGORY,REGISTRATION,ORIGINAL PRICE,PRO A,PRO B,PRO C,PRO D,PRO E,HALF SCHOLAR,FULL SCHOLAR,REMARK,UNIQUEID\n";
  data.forEach(row => {
    let remark = `"${(row.remark || '').replace(/"/g, '""')}"`;
    csv += `${row.no},${row.fy || ''},${row.class || ''},${row.category || ''},${row.registration || 0},${row.originalPrice || 0},${row.proA || 0},${row.proB || 0},${row.proC || 0},${row.proD || 0},${row.proE || 0},${row.halfScholar || 0},${row.fullScholar || 0},${remark},${row.uniqueId}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `promotion_matrix_${new Date().toISOString().slice(0,10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}