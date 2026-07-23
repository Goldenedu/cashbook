/**
 * GOLDEN ERP SYSTEM - MAIN INCOME BOOK MODULE
 * File: js/income.js     
 */

let gIncomeData = [];
let gIncomePage = 1;
let gIncomeLimit = 30;
let gIncomeSearch = '';
let gPromotionDataCache = []; // Cache promo matrix data for quick lookup

function getDynamicFiscalYearsIncome() {
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

function populateIncomeFyDropdown() {
  const fys = getDynamicFiscalYearsIncome();
  const fySelect = document.getElementById('inc-fy');
  if (fySelect) {
    fySelect.innerHTML = fys.map(f => `<option value="${f.value}" ${f.selected ? 'selected' : ''}>${f.label}</option>`).join('');
  }
}

async function loadIncomeData(useCache = false) {
  try {
    if (typeof toggleLoading === 'function') toggleLoading(true);
    populateIncomeFyDropdown();

    const res = await callApi('getIncomeData', {
      page: gIncomePage,
      limit: gIncomeLimit,
      searchVal: gIncomeSearch
    });

    if (res && res.success) {
      gIncomeData = res.data || [];
      renderIncomeCards(res.stats || {});
      renderIncomeTable(gIncomeData);
      renderIncomePagination(res.totalRows || 0);
    } else {
      showToast("ERROR", res.message || "Income ဒေတာ ရယူ၍ မရပါ");
    }
  } catch (err) {
    showToast("ERROR", "Error loading Income data: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function renderIncomeCards(stats) {
  const inc = document.getElementById('inc-total-income');
  const exp = document.getElementById('inc-total-expense');
  const bal = document.getElementById('inc-balance');
  const cnt = document.getElementById('inc-entries-count');

  if (inc) inc.textContent = `${(stats.totalIncome || 0).toLocaleString()} MMK`;
  if (exp) exp.textContent = `${(stats.totalExpense || 0).toLocaleString()} MMK`;
  if (bal) bal.textContent = `${(stats.balance || 0).toLocaleString()} MMK`;
  if (cnt) cnt.textContent = (gIncomeData ? gIncomeData.length : 0);
}

function renderIncomeTable(data) {
  const tbody = document.getElementById('income-table-body');
  if (!tbody) return;

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="19" class="text-center py-8 text-slate-500 font-bold">Income စာရင်း မရှိသေးပါ</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map((item, idx) => `
    <tr class="hover:bg-slate-800/40 transition">
      <td class="text-center text-slate-400 py-3">${item.no || (idx + 1)}</td>
      <td class="font-mono text-slate-300 py-3">${item.effDate || ''}</td>
      <td class="font-mono text-slate-300 py-3">${item.date || ''}</td>
      <td class="font-bold text-indigo-300 py-3">${item.fy || ''}</td>
      <td class="font-bold text-slate-200 py-3">${item.id || ''}</td>
      <td class="font-mono text-xs text-sky-400 py-3">${item.fyid || ''}</td>
      <td class="font-bold text-white py-3">${item.fyidName || ''}</td>
      <td class="text-slate-300 py-3">${item.class || ''}</td>
      <td class="text-slate-300 py-3">${item.category || ''}</td>
      <td class="font-bold text-teal-400 py-3">${item.accountName || ''}</td>
      <td class="py-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold ${item.method === 'Bank' ? 'bg-sky-500/10 text-sky-400' : 'bg-amber-500/10 text-amber-400'}">${item.method || 'Cash'}</span></td>
      <td class="text-right font-bold text-rose-400 font-mono py-3">${(item.debit || 0).toLocaleString()}</td>
      <td class="text-right font-bold text-emerald-400 font-mono py-3">${(item.credit || 0).toLocaleString()}</td>
      <td class="text-right font-bold text-indigo-400 font-mono py-3">${(item.autAmount || 0).toLocaleString()}</td>
      <td class="text-slate-300 py-3">${item.promo || ''}</td>
      <td class="text-slate-400 py-3">${item.my || ''}</td>
      <td class="font-mono text-xs text-slate-400 py-3">${item.vrNo || ''}</td>
      <td class="text-slate-400 py-3">${item.remark || ''}</td>
      <td class="text-center py-3 right-0 sticky bg-[#0c1322] border-l border-slate-800 shadow-lg">
        <div class="flex items-center justify-center gap-2">
          <button onclick="editIncomeEntry('${item.uniqueId}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded transition"><i class="fa-solid fa-pen-to-square text-xs"></i></button>
          <button onclick="deleteIncomeEntry('${item.uniqueId}')" class="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded transition"><i class="fa-solid fa-trash-can text-xs"></i></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderIncomePagination(totalRows) {
  const info = document.getElementById('inc-pagination-info');
  const btnPrev = document.getElementById('inc-btn-prev');
  const btnNext = document.getElementById('inc-btn-next');

  const totalPages = Math.ceil(totalRows / gIncomeLimit) || 1;
  if (info) info.textContent = `Showing Page ${gIncomePage} of ${totalPages} (${totalRows} total entries)`;

  if (btnPrev) btnPrev.disabled = (gIncomePage <= 1);
  if (btnNext) btnNext.disabled = (gIncomePage >= totalPages);
}

function changePageIncome(delta) {
  gIncomePage += delta;
  if (gIncomePage < 1) gIncomePage = 1;
  loadIncomeData(false);
}

function onSearchInputIncome() {
  const input = document.getElementById('income-search');
  gIncomeSearch = input ? input.value : '';
  gIncomePage = 1;
  loadIncomeData(false);
}

/**
 * 💡 STUDENT DETECTOR & DYNAMIC FIELD PRE-FILL
 */
async function onStudentIdOrFYChangeIncome() {
  const fySelect = document.getElementById('inc-fy');
  const idInput = document.getElementById('inc-id-search');

  const fy = fySelect ? fySelect.value : '';
  const studentId = idInput ? parseInt(idInput.value, 10) : 0;

  if (!studentId || isNaN(studentId) || !fy) return;

  try {
    const res = await callApi('getStudentData', { page: 1, limit: 5000 });
    if (res && res.success && res.data) {
      const student = res.data.find(s => 
        parseInt(s.id, 10) === studentId && 
        String(s.fy).trim() === String(fy).trim()
      );

      if (student) {
        document.getElementById('inc-fyid-show').value = student.fyid || '';
        document.getElementById('inc-fyidname-show').value = student.fyidName || student.name || '';
        document.getElementById('inc-class').value = student.class || '';
        document.getElementById('inc-category').value = student.category || '';
        document.getElementById('inc-promo').value = student.promo || '';

        // Auto calculate Standard AUT Amount
        await calculateStandardAutAmountIncome();
      }
    }
  } catch (err) {
    console.warn("Error matching student ID:", err);
  }
}

async function onAccountNameOrCategoryChangeIncome() {
  await calculateStandardAutAmountIncome();
}

/**
 * 💡 STANDARD AUT AMOUNT AUTOMATIC LOOKUP & CALCULATION ENGINE
 */
async function calculateStandardAutAmountIncome() {
  const fy = document.getElementById('inc-fy')?.value || '';
  const studentClass = document.getElementById('inc-class')?.value || '';
  const category = document.getElementById('inc-category')?.value || '';
  const promoPlan = document.getElementById('inc-promo')?.value || '';
  const accountName = document.getElementById('inc-account')?.value || '';
  const autAmountInput = document.getElementById('inc-autamount');

  if (!autAmountInput) return;

  if (!fy || !studentClass || !accountName) {
    autAmountInput.value = 0;
    return;
  }

  // Ensure Promo matrix data is cached
  if (!gPromotionDataCache || gPromotionDataCache.length === 0) {
    try {
      const res = await callApi('getPromotionData', {});
      if (res && res.success) {
        gPromotionDataCache = res.data || [];
      }
    } catch (e) {
      console.warn("Could not load promotion matrix:", e);
    }
  }

  let autAmount = 0;

  if (accountName === 'Registration') {
    // 💡 Rule 1: Match FY + Class -> Get Registration Column
    const match = gPromotionDataCache.find(p => 
      String(p.fy).trim() === String(fy).trim() && 
      String(p.class).trim().toLowerCase() === String(studentClass).trim().toLowerCase()
    );
    if (match) {
      autAmount = match.registration || 0;
    }

  } else if (accountName === 'Services') {
    // 💡 Rule 2: Match FY + Class + Category -> Get column matching Promo Plan
    const match = gPromotionDataCache.find(p => 
      String(p.fy).trim() === String(fy).trim() && 
      String(p.class).trim().toLowerCase() === String(studentClass).trim().toLowerCase() &&
      String(p.category).trim().toLowerCase() === String(category).trim().toLowerCase()
    );

    if (match) {
      const planStr = String(promoPlan).trim().toLowerCase();

      if (planStr.includes('original')) autAmount = match.originalPrice || 0;
      else if (planStr.includes('pro a')) autAmount = match.proA || 0;
      else if (planStr.includes('pro b')) autAmount = match.proB || 0;
      else if (planStr.includes('pro c')) autAmount = match.proC || 0;
      else if (planStr.includes('pro d')) autAmount = match.proD || 0;
      else if (planStr.includes('pro e')) autAmount = match.proE || 0;
      else if (planStr.includes('half')) autAmount = match.halfScholar || 0;
      else if (planStr.includes('full')) autAmount = match.fullScholar || 0;
      else autAmount = match.originalPrice || 0;
    }
  } else {
    // 💡 Rule 3: Other accounts (Ferry, Night Study Fees, Others) -> 0
    autAmount = 0;
  }

  autAmountInput.value = autAmount;

  // Auto pre-fill Credit (Paid Amount) if it's currently 0
  const creditInput = document.getElementById('inc-credit');
  if (creditInput && (parseFloat(creditInput.value || 0) === 0)) {
    creditInput.value = autAmount;
  }
}

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

async function openAddModalIncome() {
  populateIncomeFyDropdown();

  const form = document.getElementById('income-form');
  if (form) form.reset();

  const uid = document.getElementById('inc-uniqueId');
  if (uid) uid.value = '';

  const dateInput = document.getElementById('inc-date');
  if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

  const title = document.getElementById('inc-form-title');
  if (title) title.textContent = 'Add Income Entry';

  toggleSplitPaymentIncome();

  const modal = document.getElementById('income-modal');
  if (modal) modal.classList.remove('hidden');
}

function closeIncomeModal() {
  const modal = document.getElementById('income-modal');
  if (modal) modal.classList.add('hidden');
}

async function saveIncomeForm(event) {
  event.preventDefault();

  const uid = document.getElementById('inc-uniqueId')?.value || '';
  const isSplit = document.getElementById('inc-is-split')?.checked || false;

  let method = document.getElementById('inc-method')?.value || 'Cash';
  let debit = parseFloat(document.getElementById('inc-debit')?.value || 0);
  let credit = parseFloat(document.getElementById('inc-credit')?.value || 0);

  if (isSplit) {
    const cashAmt = parseFloat(document.getElementById('inc-cash-amount')?.value || 0);
    const bankAmt = parseFloat(document.getElementById('inc-bank-amount')?.value || 0);
    credit = cashAmt + bankAmt;
    method = 'Split (Cash+Bank)';
  }

  const payload = {
    uniqueId: uid,
    fy: document.getElementById('inc-fy')?.value || '',
    id: document.getElementById('inc-id-search')?.value || '',
    date: document.getElementById('inc-date')?.value || '',
    effDate: document.getElementById('inc-effdate')?.value || '',
    fyid: document.getElementById('inc-fyid-show')?.value || '',
    fyidName: document.getElementById('inc-fyidname-show')?.value || '',
    class: document.getElementById('inc-class')?.value || '',
    category: document.getElementById('inc-category')?.value || '',
    promo: document.getElementById('inc-promo')?.value || '',
    accountName: document.getElementById('inc-account')?.value || '',
    autAmount: parseFloat(document.getElementById('inc-autamount')?.value || 0),
    method: method,
    debit: debit,
    credit: credit,
    remark: document.getElementById('inc-remark')?.value || ''
  };

  try {
    if (typeof toggleLoading === 'function') toggleLoading(true);
    const actionName = uid ? 'updateIncomeEntry' : 'saveIncomeEntry';
    const res = await callApi(actionName, payload);

    if (res && res.success) {
      showToast("SUCCESS", "Income စာရင်း အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ");
      closeIncomeModal();
      loadIncomeData(false);
    } else {
      showToast("ERROR", res.message || "သိမ်းဆည်းမှု မအောင်မြင်ပါ");
    }
  } catch (err) {
    showToast("ERROR", "Save Error: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

async function deleteIncomeEntry(uniqueId) {
  if (!confirm("ဤ Income စာရင်းကို ဖျက်ရန် သေချာပါသလား?")) return;

  try {
    if (typeof toggleLoading === 'function') toggleLoading(true);
    const res = await callApi('deleteIncomeEntry', { uniqueId });

    if (res && res.success) {
      showToast("SUCCESS", "Income စာရင်း ဖျက်ပြီးပါပြီ");
      loadIncomeData(false);
    } else {
      showToast("ERROR", res.message || "ဖျက်ဆီးမှု မအောင်မြင်ပါ");
    }
  } catch (err) {
    showToast("ERROR", "Delete Error: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function exportToCSVIncome() {
  if (!gIncomeData || gIncomeData.length === 0) {
    showToast("ERROR", "Export ပြုလုပ်ရန် စာရင်း မရှိပါ");
    return;
  }
  let csv = "NO,EFFECT_DATE,DATE,FY,ID,FYID,FYID_NAME,CLASS,CATEGORY,ACCOUNT_NAME,METHOD,DEBIT,CREDIT,AUT_AMOUNT,PROMO,REMARK\n";
  gIncomeData.forEach(r => {
    csv += `"${r.no}","${r.effDate}","${r.date}","${r.fy}","${r.id}","${r.fyid}","${r.fyidName}","${r.class}","${r.category}","${r.accountName}","${r.method}",${r.debit},${r.credit},${r.autAmount},"${r.promo}","${r.remark}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Income_Export_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}
