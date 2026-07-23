/**
 * GOLDEN ERP SYSTEM - PROMOTION MATRIX MODULE
 * File: js/promotion.js
 */

let gPromotionData = [];
let gPromotionSearch = '';
let gPromotionFyFilter = '';
let gPromotionCatFilter = '';

function getDynamicFiscalYears() {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const currentStart = (month >= 4) ? year : year - 1;

  const prevFY = `${currentStart - 1}-${currentStart}`;
  const currFY = `${currentStart}-${currentStart + 1}`;
  const nextFY = `${currentStart + 1}-${currentStart + 2}`;

  return [
    { value: prevFY, label: prevFY },
    { value: currFY, label: currFY, selected: true },
    { value: nextFY, label: nextFY }
  ];
}

function populatePromotionDropdowns() {
  const fys = getDynamicFiscalYears();
  
  const fySelect = document.getElementById('promo-fy');
  if (fySelect) {
    fySelect.innerHTML = fys.map(f => `<option value="${f.value}" ${f.selected ? 'selected' : ''}>${f.label}</option>`).join('');
  }

  const fyFilter = document.getElementById('promo-filter-fy');
  if (fyFilter) {
    let filterHtml = '<option value="">-- All FY --</option>';
    fys.forEach(f => { filterHtml += `<option value="${f.value}">${f.label}</option>`; });
    fyFilter.innerHTML = filterHtml;
  }

  const classes = window.DROPDOWNS?.student?.class || ["Pre School", "KG Student", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
  const validClasses = classes.filter(c => c !== "Non");

  const classSelect = document.getElementById('promo-class');
  if (classSelect) {
    classSelect.innerHTML = validClasses.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  const cats = window.DROPDOWNS?.student?.category || ["Boarder", "Semi Boarder", "Day Student"];

  const catSelect = document.getElementById('promo-category');
  if (catSelect) {
    catSelect.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }

  const catFilter = document.getElementById('promo-filter-cat');
  if (catFilter) {
    let filterHtml = '<option value="">-- All Categories --</option>';
    cats.forEach(c => { filterHtml += `<option value="${c}">${c}</option>`; });
    catFilter.innerHTML = filterHtml;
  }
}

async function loadPromotionData(useCache = false) {
  try {
    if (typeof toggleLoading === 'function') toggleLoading(true);
    populatePromotionDropdowns();

    const res = await callApi('getPromotionData', {});

    if (res && res.success) {
      gPromotionData = res.data || [];
      applyPromotionFilters();
    } else {
      showToast("ERROR", res.message || "Promotion ဒေတာ ရယူ၍ မရပါ");
    }
  } catch (err) {
    showToast("ERROR", "Error loading Promotion data: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function applyPromotionFilters() {
  const searchInput = document.getElementById('promo-search');
  const fyFilter = document.getElementById('promo-filter-fy');
  const catFilter = document.getElementById('promo-filter-cat');

  gPromotionSearch = searchInput ? searchInput.value.toLowerCase().trim() : '';
  gPromotionFyFilter = fyFilter ? fyFilter.value : '';
  gPromotionCatFilter = catFilter ? catFilter.value : '';

  let filtered = gPromotionData;

  if (gPromotionSearch) {
    filtered = filtered.filter(item => (item.class || '').toLowerCase().includes(gPromotionSearch));
  }

  if (gPromotionFyFilter) {
    filtered = filtered.filter(item => item.fy === gPromotionFyFilter);
  }

  if (gPromotionCatFilter) {
    filtered = filtered.filter(item => item.category === gPromotionCatFilter);
  }

  renderPromotionTable(filtered);
}

function renderPromotionTable(data) {
  const tbody = document.getElementById('promo-table-body');
  const totalCountEl = document.getElementById('promo-total-count');

  if (totalCountEl) totalCountEl.textContent = data ? data.length : 0;
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="15" class="text-center py-8 text-slate-500 font-bold">Promotion Matrix ဒေတာ မရှိသေးပါ</td></tr>`;
    return;
  }

  let previousFy = '';

  tbody.innerHTML = data.map((item, idx) => {
    const isFyChanged = (idx > 0 && item.fy !== previousFy && item.fy && previousFy);
    previousFy = item.fy || '';

    const rowBorderClass = isFyChanged 
      ? 'border-t-2 border-indigo-500/60 bg-indigo-500/5' 
      : 'border-b border-slate-800/40';

    let fyBadgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
    if (item.fy === '2026-2027') {
      fyBadgeStyle = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-black';
    } else if (item.fy === '2027-2028') {
      fyBadgeStyle = 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
    }

    return `
      <tr class="hover:bg-slate-800/40 transition ${rowBorderClass}">
        <td class="text-center text-slate-400 py-3">${item.no || (idx + 1)}</td>
        <td class="py-3"><span class="inline-block px-2 py-0.5 rounded text-[10px] border ${fyBadgeStyle}">${item.fy || 'N/A'}</span></td>
        <td class="font-bold text-white py-3">${item.class || ''}</td>
        <td class="text-slate-300 py-3">${item.category || ''}</td>
        <td class="text-right font-bold text-indigo-400 font-mono py-3">${(item.registration || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-slate-200 font-mono py-3">${(item.originalPrice || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-teal-400 font-mono py-3">${(item.proA || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-teal-400 font-mono py-3">${(item.proB || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-teal-400 font-mono py-3">${(item.proC || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-teal-400 font-mono py-3">${(item.proD || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-teal-400 font-mono py-3">${(item.proE || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-amber-400 font-mono py-3">${(item.halfScholar || 0).toLocaleString()}</td>
        <td class="text-right font-bold text-emerald-400 font-mono py-3">${(item.fullScholar || 0).toLocaleString()}</td>
        <td class="text-slate-400 py-3">${item.remark || ''}</td>
        <td class="text-center py-3 right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg">
          <div class="flex items-center justify-center gap-2">
            <button onclick="editPromotionEntry('${item.uniqueId}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded transition"><i class="fa-solid fa-pen-to-square text-xs"></i></button>
            <button onclick="deletePromotionEntry('${item.uniqueId}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded transition"><i class="fa-solid fa-trash-can text-xs"></i></button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function onSearchInputPromotion() {
  applyPromotionFilters();
}

function openAddModalPromotion() {
  populatePromotionDropdowns();

  const form = document.getElementById('promo-form');
  if (form) form.reset();

  const uid = document.getElementById('promo-uniqueId');
  if (uid) uid.value = '';

  const title = document.getElementById('promo-form-title');
  if (title) title.textContent = 'Add Promotion Rate';

  const modal = document.getElementById('promo-modal');
  if (modal) modal.classList.remove('hidden');
}

function closePromotionModal() {
  const modal = document.getElementById('promo-modal');
  if (modal) modal.classList.add('hidden');
}

/**
 * 💡 EDIT PRE-FILL FIX: မူလ ဒေတာများ Form ထဲသို့ အပြည့်အဝ ဝင်ရောက်လာစေခြင်း
 */
function editPromotionEntry(uniqueId) {
  const item = gPromotionData.find(p => String(p.uniqueId).trim() === String(uniqueId).trim());
  if (!item) return;

  populatePromotionDropdowns();

  const title = document.getElementById('promo-form-title');
  if (title) title.textContent = 'Edit Promotion Rate';

  document.getElementById('promo-uniqueId').value = item.uniqueId || '';
  document.getElementById('promo-fy').value = item.fy || '';
  document.getElementById('promo-class').value = item.class || '';
  document.getElementById('promo-category').value = item.category || '';
  document.getElementById('promo-registration').value = item.registration || 0;
  document.getElementById('promo-original-price').value = item.originalPrice || 0;
  document.getElementById('promo-pro-a').value = item.proA || 0;
  document.getElementById('promo-pro-b').value = item.proB || 0;
  document.getElementById('promo-pro-c').value = item.proC || 0;
  document.getElementById('promo-pro-d').value = item.proD || 0;
  document.getElementById('promo-pro-e').value = item.proE || 0;
  document.getElementById('promo-half-scholar').value = item.halfScholar || 0;
  document.getElementById('promo-full-scholar').value = item.fullScholar || 0;
  document.getElementById('promo-remark').value = item.remark || '';

  const modal = document.getElementById('promo-modal');
  if (modal) modal.classList.remove('hidden');
}

async function savePromotionForm(event) {
  event.preventDefault();

  const uid = document.getElementById('promo-uniqueId')?.value || '';
  const actionName = uid ? 'updatePromotionEntry' : 'savePromotionEntry';

  const payload = {
    uniqueId: uid,
    fy: document.getElementById('promo-fy')?.value || '',
    class: document.getElementById('promo-class')?.value || '',
    category: document.getElementById('promo-category')?.value || '',
    registration: parseFloat(document.getElementById('promo-registration')?.value || 0),
    originalPrice: parseFloat(document.getElementById('promo-original-price')?.value || 0),
    proA: parseFloat(document.getElementById('promo-pro-a')?.value || 0),
    proB: parseFloat(document.getElementById('promo-pro-b')?.value || 0),
    proC: parseFloat(document.getElementById('promo-pro-c')?.value || 0),
    proD: parseFloat(document.getElementById('promo-pro-d')?.value || 0),
    proE: parseFloat(document.getElementById('promo-pro-e')?.value || 0),
    halfScholar: parseFloat(document.getElementById('promo-half-scholar')?.value || 0),
    fullScholar: parseFloat(document.getElementById('promo-full-scholar')?.value || 0),
    remark: document.getElementById('promo-remark')?.value || ''
  };

  try {
    if (typeof toggleLoading === 'function') toggleLoading(true);
    const res = await callApi(actionName, payload);

    if (res && res.success) {
      showToast("SUCCESS", "Promotion Rate နှုန်းထား သိမ်းဆည်းပြီးပါပြီ");
      closePromotionModal();
      loadPromotionData(false);
    } else {
      showToast("ERROR", res.message || "သိမ်းဆည်းမှု မအောင်မြင်ပါ");
    }
  } catch (err) {
    showToast("ERROR", "Save Error: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

async function deletePromotionEntry(uniqueId) {
  if (!confirm("ဤ Promotion နှုန်းထားကို ဖျက်ရန် သေချာပါသလား?")) return;

  try {
    if (typeof toggleLoading === 'function') toggleLoading(true);
    const res = await callApi('deletePromotionEntry', { uniqueId });

    if (res && res.success) {
      showToast("SUCCESS", "Promotion နှုန်းထား ဖျက်ပြီးပါပြီ");
      loadPromotionData(false);
    } else {
      showToast("ERROR", res.message || "ဖျက်ဆီးမှု မအောင်မြင်ပါ");
    }
  } catch (err) {
    showToast("ERROR", "Delete Error: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function exportToCSVPromotion() {
  if (!gPromotionData || gPromotionData.length === 0) {
    showToast("ERROR", "Export ပြုလုပ်ရန် စာရင်း မရှိပါ");
    return;
  }
  let csv = "NO,FY,CLASS,CATEGORY,REGISTRATION,ORIGINAL_PRICE,PRO_A,PRO_B,PRO_C,PRO_D,PRO_E,HALF_SCHOLAR,FULL_SCHOLAR,REMARK\n";
  gPromotionData.forEach(r => {
    csv += `"${r.no}","${r.fy}","${r.class}","${r.category}",${r.registration},${r.originalPrice},${r.proA},${r.proB},${r.proC},${r.proD},${r.proE},${r.halfScholar},${r.fullScholar},"${r.remark}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Promotion_Matrix_Export_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}
