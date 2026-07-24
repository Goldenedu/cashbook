/**
 * GOLDEN ERP SYSTEM - MAIN INCOME BOOK MODULE
 * File: js/income.js
 */

var incomePage = 1;
var incomeLimit = 50;
var incomeTotalRows = 0;
var incomeActiveData = [];
var allStudentsLookupCache = null;
var promoMatrixCache = null;

/**
 * 💡 Load Main Income Book Data
 */
async function loadIncomeData(isSilent = false) {
  const token = localStorage.getItem('golden_auth_token') || localStorage.getItem('erp_token');
  if (!token) return;

  try {
    if (!isSilent) toggleLoading(true);

    const searchInput = document.getElementById('income-search');
    const searchVal = searchInput ? searchInput.value.trim() : '';

    const res = await callApi('getIncomeData', {
      page: incomePage,
      limit: incomeLimit,
      searchVal: searchVal
    });

    if (!res || !res.success) {
      throw new Error(res?.message || "Failed to load income data.");
    }

    incomeActiveData = res.data || [];
    incomeTotalRows = res.totalRows || 0;

    renderStatsIncome(res.stats || { totalIncome: 0, totalExpense: 0, balance: 0 });
    renderTableIncome();
    updatePaginationUIIncome();

  } catch (err) {
    console.error("Income Data Load Error:", err);
    if (!isSilent) showToast("ERROR", "ဝင်ငွေစာရင်း ဒေတာများ ဆွဲယူ၍ မရပါ: " + err.message);
  } finally {
    if (!isSilent) toggleLoading(false);
  }
}

/**
 * 💡 Render KPI Header Stats Cards
 */
function renderStatsIncome(stats) {
  const incTotal = document.getElementById('inc-total-income');
  const expTotal = document.getElementById('inc-total-expense');
  const balTotal = document.getElementById('inc-balance');
  const countTotal = document.getElementById('inc-entries-count');

  if (incTotal) incTotal.textContent = Number(stats.totalIncome || 0).toLocaleString('en-US') + ' MMK';
  if (expTotal) expTotal.textContent = Number(stats.totalExpense || 0).toLocaleString('en-US') + ' MMK';
  if (balTotal) balTotal.textContent = Number(stats.balance || 0).toLocaleString('en-US') + ' MMK';
  if (countTotal) countTotal.textContent = Number(incomeTotalRows || 0).toLocaleString('en-US');
}

/**
 * 💡 Render Table Grid Rows
 */
function renderTableIncome() {
  const tbody = document.getElementById('income-table-body');
  if (!tbody) return;

  if (!incomeActiveData || incomeActiveData.length === 0) {
    tbody.innerHTML = `<tr><td colspan="19" class="text-center py-8 text-slate-500 font-bold">ဝင်ငွေစာရင်း မှတ်တမ်းများ မရှိသေးပါ။</td></tr>`;
    return;
  }

  tbody.innerHTML = incomeActiveData.map((row) => {
    const isViewer = (localStorage.getItem('golden_user_role') === "Viewer");
    const lockClass = (row.isLocked || isViewer) ? "opacity-30 cursor-not-allowed pointer-events-none" : "hover:text-white";
    const lockTitle = row.isLocked ? "Older than 7 days (Locked)" : "";

    return `
      <tr class="hover:bg-slate-800/30 text-slate-300">
        <td class="text-center font-semibold text-slate-500">${row.no || '-'}</td>
        <td class="font-mono text-xs">${escapeHtml(row.effDate) || '-'}</td>
        <td class="font-mono text-xs">${escapeHtml(row.date) || '-'}</td>
        <td class="font-mono">${escapeHtml(row.fy) || '-'}</td>
        <td class="font-mono font-bold">${escapeHtml(row.id) || '-'}</td>
        <td class="font-mono font-bold text-indigo-400">${escapeHtml(row.fyid) || '-'}</td>
        <td class="font-bold text-slate-100">${escapeHtml(row.fyidName) || '-'}</td>
        <td>${escapeHtml(row.class) || '-'}</td>
        <td><span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">${escapeHtml(row.category) || '-'}</span></td>
        <td class="font-semibold text-slate-200">${escapeHtml(row.accountName) || '-'}</td>
        <td class="font-bold text-slate-400">${escapeHtml(row.method) || '-'}</td>
        <td class="text-right text-rose-400 font-mono font-bold">${row.debit > 0 ? Number(row.debit).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-emerald-400 font-mono font-bold">${row.credit > 0 ? Number(row.credit).toLocaleString('en-US') : '-'}</td>
        <td class="text-right text-indigo-400 font-mono font-bold">${row.autAmount > 0 ? Number(row.autAmount).toLocaleString('en-US') : '-'}</td>
        <td class="text-xs">${escapeHtml(row.promo) || '-'}</td>
        <td class="font-mono text-xs">${escapeHtml(row.my) || '-'}</td>
        <td class="font-mono text-xs text-slate-400">${escapeHtml(row.vrNo) || '-'}</td>
        <td class="max-w-xs truncate text-xs text-slate-400" title="${escapeHtml(row.remark) || ''}">${escapeHtml(row.remark) || '-'}</td>
        <td class="right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg text-center">
          <div class="flex items-center justify-center gap-3">
            <button onclick="printInvoice('${row.uniqueId}')" class="text-emerald-400 hover:text-emerald-300 transition" title="Print Receipt">
              <i class="fa-solid fa-print"></i>
            </button>
            <button onclick="editIncomeEntry('${row.uniqueId}')" class="text-indigo-400 hover:text-indigo-300 transition ${lockClass}" title="Edit ${lockTitle}" ${row.isLocked || isViewer ? 'disabled' : ''}>
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button onclick="deleteIncomeEntry('${row.uniqueId}')" class="text-rose-400 hover:text-rose-300 transition ${lockClass}" title="Delete ${lockTitle}" ${row.isLocked || isViewer ? 'disabled' : ''}>
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 💡 Auto Student Lookup on Student ID or FY Change
 */
async function onStudentIdOrFYChangeIncome() {
  const fyVal = document.getElementById('inc-fy')?.value;
  const idVal = document.getElementById('inc-id-search')?.value.trim();

  if (!fyVal || !idVal) return;

  const parts = fyVal.split("-");
  const fyShort = parts[0].slice(-2) + "-" + (parts[1] ? parts[1].slice(-2) : "");
  const paddedId = String(idVal).padStart(4, '0');
  const targetFyid = "ID " + fyShort + " " + paddedId;

  const fyidShow = document.getElementById('inc-fyid-show');
  const fyidNameShow = document.getElementById('inc-fyidname-show');

  if (!allStudentsLookupCache) {
    if (fyidNameShow) fyidNameShow.value = "Searching student database...";
    try {
      const res = await callApi('getStudentData', { page: 1, limit: 5000 });
      if (res && res.success) {
        allStudentsLookupCache = res.data || [];
      }
    } catch (e) {
      console.error("Failed to load students lookup cache", e);
    }
  }

  const student = (allStudentsLookupCache || []).find(s => s.fyid === targetFyid || String(s.id) === String(idVal));

  if (student) {
    if (fyidShow) fyidShow.value = student.fyid || targetFyid;
    if (fyidNameShow) fyidNameShow.value = student.fyidName || student.name || '';

    const classEl = document.getElementById('inc-class');
    const catEl = document.getElementById('inc-category');
    const promoEl = document.getElementById('inc-promo');

    if (classEl) classEl.value = student.class || '';
    if (catEl) catEl.value = student.category || 'Boarder';
    if (promoEl) promoEl.value = student.promo || 'Original price';

    onAccountNameOrCategoryChangeIncome();
  } else {
    if (fyidShow) fyidShow.value = targetFyid;
    if (fyidNameShow) fyidNameShow.value = "ကျောင်းသား ရှာမတွေ့ပါ!";
    
    document.getElementById('inc-class').value = "";
    document.getElementById('inc-promo').value = "";
    document.getElementById('inc-autamount').value = 0;
  }
}

/**
 * 💡 Promo Matrix Rate Auto-Calculation
 */
async function onAccountNameOrCategoryChangeIncome() {
  const accountName = document.getElementById('inc-account')?.value;
  const classVal = document.getElementById('inc-class')?.value;
  const categoryVal = document.getElementById('inc-category')?.value;
  const promoVal = document.getElementById('inc-promo')?.value;
  const autAmtEl = document.getElementById('inc-autamount');

  if (!autAmtEl) return;

  if (accountName !== "Registration" && accountName !== "Services") {
    autAmtEl.value = 0;
    return;
  }

  if (!promoMatrixCache) {
    try {
      const res = await callApi('getPromotionData', {});
      if (res && res.success) {
        promoMatrixCache = res.data || [];
      }
    } catch (e) {
      console.error("Failed to fetch promo matrix", e);
    }
  }

  if (promoMatrixCache && Array.isArray(promoMatrixCache)) {
    const match = promoMatrixCache.find(r => 
      String(r.class).toLowerCase().trim() === String(classVal).toLowerCase().trim() &&
      (accountName === "Registration" || String(r.category).toLowerCase().trim() === String(categoryVal).toLowerCase().trim())
    );

    if (match) {
      if (accountName === "Registration") {
        autAmtEl.value = match.registration || 0;
        return;
      } else if (accountName === "Services") {
        const promoKeyMap = {
          'Original price': match.originalPrice,
          'Pro A': match.proA,
          'Pro B': match.proB,
          'Pro C': match.proC,
          'Pro D': match.proD,
          'Pro E': match.proE,
          'Half scholar': match.halfScholar,
          'Full scholar': match.fullScholar
        };
        autAmtEl.value = promoKeyMap[promoVal] || match.originalPrice || 0;
        return;
      }
    }
  }

  autAmtEl.value = 0;
}

/**
 * 💡 Toggle Split Payment UI
 */
function toggleSplitPaymentIncome() {
  const isSplit = document.getElementById('inc-is-split')?.checked;
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
 * 💡 Modal Form Controls
 */
function openAddModalIncome() {
  const form = document.getElementById('income-form');
  if (form) form.reset();
  
  document.getElementById('inc-uniqueId').value = "";
  
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById('inc-date').value = today;
  document.getElementById('inc-effdate').value = today;
  document.getElementById('inc-autamount').value = 0;

  populateFYDropdownIncome();
  toggleSplitPaymentIncome();

  document.getElementById('inc-form-title').innerText = "Add Income Entry";
  document.getElementById('income-modal').classList.remove('hidden');
}

function closeIncomeModal() {
  const modal = document.getElementById('income-modal');
  if (modal) modal.classList.add('hidden');
}

function populateFYDropdownIncome() {
  const fySelect = document.getElementById('inc-fy');
  if (!fySelect) return;

  const currentYear = new Date().getFullYear();
  const options = [
    `${currentYear - 1}-${currentYear}`,
    `${currentYear}-${currentYear + 1}`,
    `${currentYear + 1}-${currentYear + 2}`
  ];

  fySelect.innerHTML = options.map(fy => `<option value="${fy}">${fy}</option>`).join('');
  fySelect.value = `${currentYear}-${currentYear + 1}`;
}

/**
 * 💡 Save / Submit Income Entry
 */
async function saveIncomeForm(e) {
  e.preventDefault();

  const isSplit = document.getElementById('inc-is-split')?.checked;
  const fyidShowVal = document.getElementById('inc-fyid-show')?.value;

  if (fyidShowVal === "Not Found" || !fyidShowVal || fyidShowVal.includes("ကျောင်းသား ရှာမတွေ့ပါ")) {
    showToast("ERROR", "ကျောင်းသား ရှာမတွေ့သဖြင့် စာရင်းသွင်း၍ မရပါ!");
    return;
  }

  const payload = {
    uniqueId: document.getElementById('inc-uniqueId')?.value || "",
    id: parseInt(document.getElementById('inc-id-search')?.value, 10) || 0,
    date: document.getElementById('inc-date')?.value || "",
    effDate: document.getElementById('inc-effdate')?.value || "",
    fy: document.getElementById('inc-fy')?.value || "",
    fyid: fyidShowVal,
    fyidName: document.getElementById('inc-fyidname-show')?.value || "",
    class: document.getElementById('inc-class')?.value || "",
    category: document.getElementById('inc-category')?.value || "",
    promo: document.getElementById('inc-promo')?.value || "",
    accountName: document.getElementById('inc-account')?.value || "",
    autAmount: parseFloat(document.getElementById('inc-autamount')?.value) || 0,
    remark: document.getElementById('inc-remark')?.value || "",
    isSplit: isSplit,

    method: document.getElementById('inc-method')?.value || "Cash",
    debit: parseFloat(document.getElementById('inc-debit')?.value) || 0,
    credit: parseFloat(document.getElementById('inc-credit')?.value) || 0,

    cashAmount: parseFloat(document.getElementById('inc-cash-amount')?.value) || 0,
    bankAmount: parseFloat(document.getElementById('inc-bank-amount')?.value) || 0
  };

  try {
    closeIncomeModal();
    toggleLoading(true);

    const actionName = payload.uniqueId ? 'updateIncomeEntry' : 'saveIncomeEntry';
    const res = await callApi(actionName, payload);

    if (res && res.success) {
      showToast("SUCCESS", "ဝင်ငွေစာရင်း သိမ်းဆည်းမှု အောင်မြင်ပါသည်!");
      await loadIncomeData(true);
    } else {
      throw new Error(res?.message || "သိမ်းဆည်းမှု မအောင်မြင်ပါ");
    }
  } catch (err) {
    showToast("ERROR", "မအောင်မြင်ပါ: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

/**
 * 💡 Edit Entry
 */
function editIncomeEntry(uniqueId) {
  const row = incomeActiveData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "မူရင်းဒေတာကို ရှာမတွေ့ပါ။");
    return;
  }

  openAddModalIncome();

  document.getElementById('inc-uniqueId').value = row.uniqueId || "";
  document.getElementById('inc-date').value = row.date || "";
  document.getElementById('inc-effdate').value = row.effDate || "";
  document.getElementById('inc-fy').value = row.fy || "";
  document.getElementById('inc-id-search').value = row.id || "";

  onStudentIdOrFYChangeIncome();

  document.getElementById('inc-category').value = row.category || "Boarder";
  document.getElementById('inc-account').value = row.accountName || "Registration";
  document.getElementById('inc-method').value = row.method || "Cash";
  document.getElementById('inc-debit').value = row.debit || 0;
  document.getElementById('inc-credit').value = row.credit || 0;
  document.getElementById('inc-autamount').value = row.autAmount || 0;
  document.getElementById('inc-remark').value = row.remark || "";

  document.getElementById('inc-form-title').innerText = "Edit Income Entry";
}

/**
 * 💡 Delete Entry
 */
async function deleteIncomeEntry(uniqueId) {
  if (!confirm("ဤဝင်ငွေမှတ်တမ်းအား အပြီးတိုင် ဖျက်သိမ်းလိုပါသလား?\n(ခွဲပေးချေမှုဖြစ်ပါက ပတ်သက်သော စာရင်း ၂ ကြောင်းစလုံး ပျက်သွားပါမည်)")) {
    return;
  }

  try {
    toggleLoading(true);
    const res = await callApi('deleteIncomeEntry', { uniqueId: uniqueId });

    if (res && res.success) {
      showToast("SUCCESS", "ဝင်ငွေစာရင်း ဖျက်ပြီးပါပြီ!");
      await loadIncomeData(true);
    } else {
      throw new Error(res?.message || "ဖျက်သိမ်းမှု မအောင်မြင်ပါ");
    }
  } catch (err) {
    showToast("ERROR", "မအောင်မြင်ပါ: " + err.message);
  } finally {
    toggleLoading(false);
  }
}

/**
 * 💡 Pagination Controls
 */
function changePageIncome(dir) {
  if (dir === -1 && incomePage > 1) {
    incomePage--;
    loadIncomeData(false);
  } else if (dir === 1 && (incomePage * incomeLimit) < incomeTotalRows) {
    incomePage++;
    loadIncomeData(false);
  }
}

function updatePaginationUIIncome() {
  const info = document.getElementById('inc-pagination-info');
  if (info) {
    const start = incomeTotalRows === 0 ? 0 : (incomePage - 1) * incomeLimit + 1;
    const end = Math.min(incomePage * incomeLimit, incomeTotalRows);
    info.innerHTML = `Showing <span class="text-indigo-400 font-extrabold">${start}</span> to <span class="text-indigo-400 font-extrabold">${end}</span> of <span class="text-indigo-400 font-extrabold">${incomeTotalRows}</span> entries`;
  }

  const prevBtn = document.getElementById('inc-btn-prev');
  if (prevBtn) prevBtn.disabled = (incomePage === 1);

  const nextBtn = document.getElementById('inc-btn-next');
  if (nextBtn) nextBtn.disabled = (incomePage * incomeLimit >= incomeTotalRows);
}

function onSearchInputIncome() {
  if (window.searchTimeoutIncome) clearTimeout(window.searchTimeoutIncome);
  window.searchTimeoutIncome = setTimeout(() => {
    incomePage = 1;
    loadIncomeData(false);
  }, 300);
}

/**
 * 💡 Export CSV
 */
function exportToCSVIncome() {
  if (!incomeActiveData || incomeActiveData.length === 0) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှ မရှိပါ!");
    return;
  }

  let csv = "NO,EFFECT DATE,DATE,FY,ID,FYID,FYID NAME,CLASS,CATEGORY,ACCOUNT NAME,METHOD,DEBIT,CREDIT,AUT AMOUNT,PROMO,MY,VR NO,REMARK,UNIQUEID\n";
  incomeActiveData.forEach(r => {
    let name = `"${r.fyidName || ''}"`;
    let remark = `"${r.remark || ''}"`;
    csv += `${r.no},${r.effDate || ''},${r.date},${r.fy},${r.id},${r.fyid},${name},${r.class},${r.category},${r.accountName},${r.method},${r.debit},${r.credit},${r.autAmount},${r.promo},${r.my || ''},${r.vrNo},${remark},${r.uniqueId}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `income_book_${new Date().toISOString().slice(0, 10)}.csv`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 💡 RECEIPT PRINTER ENGINE (TARGETS INVOICE PRINT AREA ONLY)
 */
function printInvoice(uniqueId) {
  const row = incomeActiveData.find(item => item.uniqueId === uniqueId);
  if (!row) {
    showToast("ERROR", "ပြေစာထုတ်ယူရန် ဒေတာရှာမတွေ့ပါ!");
    return;
  }

  // 💡 [CRITICAL FIX] Activate ONLY Invoice Print Area and deactivate Payslip
  const invArea = document.getElementById('invoice-print-area');
  const payArea = document.getElementById('payslip-print-area');

  if (payArea) payArea.classList.remove('active-print');
  if (invArea) invArea.classList.add('active-print');

  const nameParts = (row.fyidName || '').split(" ");
  const studentName = nameParts.length > 3 ? nameParts.slice(3).join(" ") : row.fyidName;

  let displayAmount = row.credit || 0;
  let displayDesc = row.accountName || "Tuition & Fees";

  if (row.debit > 0) {
    displayAmount = -row.debit;
    displayDesc = (row.accountName || 'Fee') + " (Student Refund)";
  }

  const copies = ['customer', 'received'];
  copies.forEach(copy => {
    const nameEl = document.getElementById(`print-${copy}-name`);
    if (nameEl) nameEl.textContent = studentName;

    const dateEl = document.getElementById(`print-${copy}-date`);
    if (dateEl) {
      let rawDate = row.date;
      if (rawDate && rawDate.includes('-')) {
        let p = rawDate.split('-');
        if (p.length === 3) rawDate = `${p[2]}-${p[1]}-${p[0]}`;
      }
      dateEl.textContent = rawDate || '-';
    }

    const classEl = document.getElementById(`print-${copy}-class`);
    if (classEl) classEl.textContent = row.class || '-';

    const catEl = document.getElementById(`print-${copy}-category`);
    if (catEl) catEl.textContent = row.category || '-';

    const idEl = document.getElementById(`print-${copy}-id`);
    if (idEl) idEl.textContent = row.fyid || '-';

    const bodyEl = document.getElementById(`print-${copy}-table-body`);
    if (bodyEl) {
      bodyEl.innerHTML = `
        <tr class="border-b border-black">
          <td class="border border-black p-1 text-center font-bold text-[10px]">1</td>
          <td class="border border-black p-1 font-semibold text-[10px]">${displayDesc}</td>
          <td class="border border-black p-1 text-center text-[10px]">${row.my || '-'}</td>
          <td class="border border-black p-1 text-center font-bold text-[10px]">${row.method || '-'}</td>
          <td class="border border-black p-1 text-right font-bold text-[10px]">${Number(displayAmount).toLocaleString('en-US')} MMK</td>
        </tr>
      `;
    }

    const totEl = document.getElementById(`print-${copy}-total`);
    if (totEl) totEl.textContent = Number(displayAmount).toLocaleString('en-US') + " MMK";
  });

  // Trigger Print
  window.print();
}
