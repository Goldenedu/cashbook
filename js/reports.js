/**
 * GOLDEN ERP SYSTEM - REPORTING ENGINE & CSV EXPORT
 * File: js/reports.js
 */

window.erpCache = window.erpCache || {};

function cleanNum(val) {
  if (val === undefined || val === null || val === "") return 0;
  var cleaned = String(val).replace(/,/g, "").replace(/[^\d.-]/g, "");
  var num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function initReportsPage() {
  const isFundPage = document.getElementById('report-staff-fund-table-body');
  if (isFundPage) {
    loadReportStaffFundData(false);
  } else {
    showReportPanel('panel-report-financial');
  }
}

function showReportPanel(panelId) {
  const panels = ['panel-report-financial', 'panel-report-income-detail', 'panel-report-monthly-income', 'panel-report-student'];
  
  panels.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById(panelId);
  if (target) target.classList.remove('hidden');

  const btnFin = document.getElementById('btn-rep-fin');
  const btnIndetail = document.getElementById('btn-rep-indetail');
  const btnInrep = document.getElementById('btn-rep-inrep');
  const btnStudent = document.getElementById('btn-rep-student');

  [btnFin, btnIndetail, btnInrep, btnStudent].forEach(btn => {
    if (btn) btn.className = "rep-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-slate-800 text-slate-400 hover:text-white flex items-center gap-2";
  });

  if (panelId === 'panel-report-financial') {
    if (btnFin) btnFin.className = "rep-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-emerald-600 text-white flex items-center gap-2";
    loadReportFinancialData(false);
  } else if (panelId === 'panel-report-income-detail') {
    if (btnIndetail) btnIndetail.className = "rep-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-sky-600 text-white flex items-center gap-2";
    loadReportIncomeData(false);
  } else if (panelId === 'panel-report-monthly-income') {
    if (btnInrep) btnInrep.className = "rep-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-indigo-600 text-white flex items-center gap-2";
    loadReportGeneralData(false);
  } else if (panelId === 'panel-report-student') {
    if (btnStudent) btnStudent.className = "rep-sub-tab-btn px-4 py-2 rounded-lg text-xs font-bold transition-all bg-amber-600 text-white flex items-center gap-2";
    loadReportStudentData(false);
  }
}

// ============================================================================
// 1️⃣ FINANCIAL STATEMENT REPORT
// ============================================================================

async function loadReportFinancialData(isSilent = false) {
  try {
    if (!isSilent && typeof toggleLoading === 'function') toggleLoading(true);
    const res = await callApi('getFinancialReportData', {});

    if (res && res.success && res.data) {
      window.erpCache['financial-report'] = res.data;
      compileReportFinancialData();
    } else {
      showToast("ERROR", res.message || "ဘဏ္ဍာရေးရှင်းတမ်း ရယူ၍ မရပါ");
    }
  } catch (err) {
    showToast("ERROR", "Error loading financial report: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function compileReportFinancialData() {
  const searchVal = document.getElementById('report-financial-search')?.value.toLowerCase().trim() || "";
  const rData = window.erpCache['financial-report'];
  if (!rData) return;

  let cats = [
    { name: "Boarder (ဘော်ဒါဝင်ငွေ)", total: cleanNum(rData.categories?.boarder) },
    { name: "Semi Boarder (ဆီမီးဘော်ဒါ)", total: cleanNum(rData.categories?.semiBoarder) },
    { name: "Day Student (နေ့ကျောင်းသား)", total: cleanNum(rData.categories?.dayStudent) }
  ];
  let catGrandTotal = cleanNum(rData.categories?.total);

  let accs = [
    { name: "Registration (ကျောင်းအပ်နှံခ)", total: cleanNum(rData.accounts?.registration) },
    { name: "Services (သင်ကြားရေးဝန်ဆောင်မှု)", total: cleanNum(rData.accounts?.services) },
    { name: "Ferry (ဖယ်ရီခ)", total: cleanNum(rData.accounts?.ferry) },
    { name: "Night Study Fees (ညစာကျက်ဝိုင်းခ)", total: cleanNum(rData.accounts?.nightStudy) },
    { name: "Others (အထွေထွေဝင်ငွေ)", total: cleanNum(rData.accounts?.others) }
  ];
  let accGrandTotal = cleanNum(rData.accounts?.total);

  let exps = [
    { name: "Office - Admin Exp", total: cleanNum(rData.office?.adminExp) },
    { name: "Office - Vehicle Related Exp", total: cleanNum(rData.office?.vehicleExp) },
    { name: "Office - Donation & Social", total: cleanNum(rData.office?.donationSocial) },
    { name: "Office - Assets Materials", total: cleanNum(rData.office?.assetsMaterials) },
    { name: "Office - Construction", total: cleanNum(rData.office?.construction) },
    { name: "Office - HR Staff Benefit", total: cleanNum(rData.office?.hrStaffBenefit) },
    { name: "Office - Student Refund", total: cleanNum(rData.office?.studentRefund) },
    { name: "Office - Ferry Payment", total: cleanNum(rData.office?.ferryPayment) },
    { name: "Office - Drawing Account 1", total: cleanNum(rData.office?.drawingAcc1) },
    { name: "Office - Drawing Account 2", total: cleanNum(rData.office?.drawingAcc2) },
    { name: "Kitchen - Rice & Oil", total: cleanNum(rData.kitchen?.riceOil) },
    { name: "Kitchen - Fish & meat/Eggs", total: cleanNum(rData.kitchen?.fishMeatEggs) },
    { name: "Kitchen - Beans/Vegetables", total: cleanNum(rData.kitchen?.beansVegetables) },
    { name: "Kitchen - Others", total: cleanNum(rData.kitchen?.others) },
    { name: "Kitchen - HOME: 1 Exp", total: cleanNum(rData.kitchen?.home1Exp) },
    { name: "Kitchen - HOME: 2 Exp", total: cleanNum(rData.kitchen?.home2Exp) },
    { name: "Payroll - Full Time Salary", total: cleanNum(rData.payroll?.fullTimeSalary) },
    { name: "Payroll - Part Time Salary", total: cleanNum(rData.payroll?.partTimeSalary) },
    { name: "Payroll - Full Time Bonus", total: cleanNum(rData.payroll?.fullTimeBonus) },
    { name: "Payroll - Full Time Fund", total: cleanNum(rData.payroll?.fullTimeFund) }
  ];
  let expGrandTotal = cleanNum(rData.office?.total) + cleanNum(rData.kitchen?.total) + cleanNum(rData.payroll?.total);

  if (searchVal) {
    cats = cats.filter(item => item.name.toLowerCase().includes(searchVal));
    accs = accs.filter(item => item.name.toLowerCase().includes(searchVal));
    exps = exps.filter(item => item.name.toLowerCase().includes(searchVal));
  }

  const catBody = document.getElementById('report-fin-inc-cat-body');
  if (catBody) {
    let idx = 1;
    let rows = cats.map(item => `<tr class="hover:bg-slate-800/20 text-slate-300"><td class="text-center font-semibold text-slate-500 py-2.5">${idx++}</td><td class="font-bold text-slate-200 py-2.5 pl-2">${item.name}</td><td class="text-right text-emerald-400 font-bold py-2.5 pr-2 font-mono">${item.total.toLocaleString('en-US')} MMK</td></tr>`).join('');
    if (!searchVal) rows += `<tr class="bg-emerald-500/5 font-black text-emerald-400"><td colspan="2" class="text-center py-2.5">Total Category Income</td><td class="text-right py-2.5 pr-2 font-mono">${catGrandTotal.toLocaleString('en-US')} MMK</td></tr>`;
    catBody.innerHTML = rows;
  }

  const accBody = document.getElementById('report-fin-inc-acc-body');
  if (accBody) {
    let idx = 1;
    let rows = accs.map(item => `<tr class="hover:bg-slate-800/20 text-slate-300"><td class="text-center font-semibold text-slate-500 py-2.5">${idx++}</td><td class="font-bold text-slate-200 py-2.5 pl-2">${item.name}</td><td class="text-right text-emerald-400 font-bold py-2.5 pr-2 font-mono">${item.total.toLocaleString('en-US')} MMK</td></tr>`).join('');
    if (!searchVal) rows += `<tr class="bg-emerald-500/5 font-black text-emerald-400"><td colspan="2" class="text-center py-2.5">Total Account Income</td><td class="text-right py-2.5 pr-2 font-mono">${accGrandTotal.toLocaleString('en-US')} MMK</td></tr>`;
    accBody.innerHTML = rows;
  }

  const expBody = document.getElementById('report-fin-exp-body');
  if (expBody) {
    let idx = 1;
    let rows = exps.map(item => `<tr class="hover:bg-slate-800/20 text-slate-300"><td class="text-center font-semibold text-slate-500 py-2.5">${idx++}</td><td class="font-bold text-slate-200 py-2.5 pl-2">${item.name}</td><td class="text-right text-rose-400 font-bold py-2.5 pr-2 font-mono">${item.total.toLocaleString('en-US')} MMK</td></tr>`).join('');
    if (!searchVal) rows += `<tr class="bg-rose-500/5 font-black text-rose-400"><td colspan="2" class="text-center py-2.5">Total Combined Expenses</td><td class="text-right py-2.5 pr-2 font-mono">${expGrandTotal.toLocaleString('en-US')} MMK</td></tr>`;
    expBody.innerHTML = rows;
  }
}

function onSearchInputReportFinancial() { compileReportFinancialData(); }

/**
 * 💡 FINANCIAL STATEMENT CSV FILE DOWNLOAD
 */
function exportToCSVReportFinancial() {
  const rData = window.erpCache['financial-report'];
  if (!rData) { showToast("ERROR", "ထုတ်ယူရန် မည်သည့်ဒေတာမျှ မရှိသေးပါ!"); return; }

  let csv = "--- SECTION 1: INCOME BY CATEGORY ---\nNO,CATEGORY,TOTAL AMOUNT\n";
  csv += `1,"Boarder Income",${cleanNum(rData.categories?.boarder)}\n`;
  csv += `2,"Semi Boarder Income",${cleanNum(rData.categories?.semiBoarder)}\n`;
  csv += `3,"Day Student Income",${cleanNum(rData.categories?.dayStudent)}\n`;
  csv += `,"TOTAL CATEGORY INCOME",${cleanNum(rData.categories?.total)}\n\n`;

  csv += "--- SECTION 2: INCOME BY ACCOUNT ---\nNO,ACCOUNT NAME,TOTAL AMOUNT\n";
  csv += `1,"Registration",${cleanNum(rData.accounts?.registration)}\n`;
  csv += `2,"Services",${cleanNum(rData.accounts?.services)}\n`;
  csv += `3,"Ferry",${cleanNum(rData.accounts?.ferry)}\n`;
  csv += `4,"Night Study Fees",${cleanNum(rData.accounts?.nightStudy)}\n`;
  csv += `5,"Others",${cleanNum(rData.accounts?.others)}\n`;
  csv += `,"TOTAL ACCOUNT INCOME",${cleanNum(rData.accounts?.total)}\n\n`;

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Financial_Statement_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

// ============================================================================
// 2️⃣ INCOME DETAIL REPORT (InDetail Sheet A5:AD5000)
// ============================================================================

async function loadReportIncomeData(isSilent = false) {
  try {
    if (!isSilent && typeof toggleLoading === 'function') toggleLoading(true);

    const res = await callApi('getIncomeDetailReportData', {});
    if (res && res.success) {
      window.erpCache['income-detail-report'] = res;
      compileReportIncomeData();
    } else {
      showToast("ERROR", res.message || "InDetail စာရင်း မရရှိပါ");
    }
  } catch (err) {
    showToast("ERROR", "Error loading Income Detail: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function compileReportIncomeData() {
  const table = document.getElementById('report-income-main-table');
  if (!table) return;

  const rData = window.erpCache['income-detail-report'] || {};
  const headers = rData.headers || [];
  const rowsData = rData.data || [];
  const search = document.getElementById('report-income-search')?.value.toLowerCase().trim() || '';

  const filtered = rowsData.filter(row => {
    if (!search) return true;
    return row.some(cell => String(cell || '').toLowerCase().includes(search));
  });

  let headerHtml = `
    <thead>
      <tr class="bg-[#0e172a] text-slate-400">
        ${headers.map(h => `<th class="py-3 px-4 text-xs uppercase font-bold border-b border-slate-800">${h}</th>`).join('')}
      </tr>
    </thead>
  `;

  let bodyHtml = `<tbody class="divide-y divide-slate-800/40 text-slate-300">`;

  if (filtered.length === 0) {
    bodyHtml += `<tr><td colspan="${headers.length || 1}" class="text-center py-8 text-slate-500 font-bold">No records found.</td></tr>`;
  } else {
    filtered.forEach(row => {
      bodyHtml += `<tr class="hover:bg-slate-800/20">`;
      row.forEach((cell, idx) => {
        const cellStr = String(cell || "").trim();
        const num = parseFloat(cellStr.replace(/,/g, ""));
        const isNum = !isNaN(num) && isFinite(num) && cellStr !== "";

        if (isNum && idx > 3) {
          bodyHtml += `<td class="py-3 px-4 text-right font-mono font-bold text-slate-200">${num.toLocaleString('en-US')}</td>`;
        } else {
          bodyHtml += `<td class="py-3 px-4 text-slate-300">${cellStr}</td>`;
        }
      });
      bodyHtml += `</tr>`;
    });
  }

  bodyHtml += `</tbody>`;
  table.innerHTML = headerHtml + bodyHtml;
}

function onSearchInputReportIncome() { compileReportIncomeData(); }

/**
 * 💡 INDETAIL CSV FILE DOWNLOAD
 */
function exportToCSVReportIncome() {
  const rData = window.erpCache['income-detail-report'];
  if (!rData || !rData.headers || !rData.data) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှ မရှိသေးပါ!");
    return;
  }
  let csv = rData.headers.join(",") + "\n";
  rData.data.forEach(row => {
    const escaped = row.map(c => `"${String(c || '').replace(/"/g, '""')}"`);
    csv += escaped.join(",") + "\n";
  });
  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Income_Detail_InDetail_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

// ============================================================================
// 3️⃣ MONTHLY INCOME REPORT (InRep Sheet A5:O50 - 2 Tables)
// ============================================================================

async function loadReportGeneralData(isSilent = false) {
  try {
    if (!isSilent && typeof toggleLoading === 'function') toggleLoading(true);

    const res = await callApi('getMonthlyIncomeReportData', {});
    if (res && res.success) {
      window.erpCache['monthly-income-report'] = res;
      compileReportGeneralData();
    } else {
      showToast("ERROR", res.message || "InRep စာရင်း မရရှိပါ");
    }
  } catch (err) {
    showToast("ERROR", "Error loading Monthly Income: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function compileReportGeneralData() {
  const rData = window.erpCache['monthly-income-report'] || {};
  
  // Table 1 Render (A5:O19 - Emerald Theme)
  const t1 = document.getElementById('report-general-table-1');
  if (t1 && rData.table1) {
    let hHtml = `<thead><tr class="bg-emerald-950/40 text-emerald-300">${(rData.table1.headers || []).map(h => `<th class="py-3 px-4 text-xs font-bold uppercase border-b border-emerald-500/20">${h}</th>`).join('')}</tr></thead>`;
    let bHtml = `<tbody class="divide-y divide-slate-800/40 text-slate-300">`;
    (rData.table1.data || []).forEach(row => {
      bHtml += `<tr class="hover:bg-emerald-500/5">`;
      row.forEach((c, idx) => {
        const num = parseFloat(String(c || "").replace(/,/g, ""));
        if (!isNaN(num) && isFinite(num) && String(c).trim() !== "" && idx > 0) {
          bHtml += `<td class="py-3 px-4 text-right font-mono font-bold text-emerald-300">${num.toLocaleString('en-US')}</td>`;
        } else {
          bHtml += `<td class="py-3 px-4 font-bold text-white">${c || ''}</td>`;
        }
      });
      bHtml += `</tr>`;
    });
    bHtml += `</tbody>`;
    t1.innerHTML = hHtml + bHtml;
  }

  // Table 2 Render (A20:O36 - Indigo Theme)
  const t2 = document.getElementById('report-general-table-2');
  if (t2 && rData.table2) {
    let hHtml = `<thead><tr class="bg-indigo-950/40 text-indigo-300">${(rData.table2.headers || []).map(h => `<th class="py-3 px-4 text-xs font-bold uppercase border-b border-indigo-500/20">${h}</th>`).join('')}</tr></thead>`;
    let bHtml = `<tbody class="divide-y divide-slate-800/40 text-slate-300">`;
    (rData.table2.data || []).forEach(row => {
      bHtml += `<tr class="hover:bg-indigo-500/5">`;
      row.forEach((c, idx) => {
        const num = parseFloat(String(c || "").replace(/,/g, ""));
        if (!isNaN(num) && isFinite(num) && String(c).trim() !== "" && idx > 0) {
          bHtml += `<td class="py-3 px-4 text-right font-mono font-bold text-indigo-300">${num.toLocaleString('en-US')}</td>`;
        } else {
          bHtml += `<td class="py-3 px-4 font-bold text-white">${c || ''}</td>`;
        }
      });
      bHtml += `</tr>`;
    });
    bHtml += `</tbody>`;
    t2.innerHTML = hHtml + bHtml;
  }
}

/**
 * 💡 INREP MONTHLY INCOME CSV FILE DOWNLOAD (TABLE 1 + TABLE 2)
 */
function exportToCSVReportGeneral() {
  const rData = window.erpCache['monthly-income-report'];
  if (!rData || !rData.table1) {
    showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှ မရှိသေးပါ!");
    return;
  }
  let csv = "--- TABLE 1: PRIMARY REVENUE BREAKDOWN ---\n";
  csv += (rData.table1.headers || []).join(",") + "\n";
  (rData.table1.data || []).forEach(row => {
    csv += row.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(",") + "\n";
  });

  if (rData.table2) {
    csv += "\n--- TABLE 2: SECONDARY CATEGORY SUMMARY ---\n";
    csv += (rData.table2.headers || []).join(",") + "\n";
    (rData.table2.data || []).forEach(row => {
      csv += row.map(c => `"${String(c || '').replace(/"/g, '""')}"`).join(",") + "\n";
    });
  }

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Monthly_Income_InRep_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

// ============================================================================
// 4️⃣ STUDENT DEMOGRAPHICS & CLASS AMOUNT REPORT
// ============================================================================

async function loadReportStudentData(isSilent = false) {
  try {
    if (!isSilent && typeof toggleLoading === 'function') toggleLoading(true);

    const res = await callApi('getStudentReportDetails', {});
    if (res && res.success) {
      window.erpCache['student-report-details'] = res;
      compileReportStudentData();
    }
  } catch (err) {
    showToast("ERROR", "Error loading Student Demographics: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function compileReportStudentData() {
  const container = document.getElementById('report-student-tables-container');
  if (!container) return;

  const cache = window.erpCache['student-report-details'] || {};
  const students = cache.students || [];
  const incomeMap = cache.incomeMap || {};

  const search = document.getElementById('report-student-search')?.value.toLowerCase().trim() || '';

  var fyGroups = {};

  students.forEach(s => {
    var fy = s.fy || "Unknown-FY";
    var cls = s.class || "Unknown-Class";
    var status = String(s.status || "").trim().toLowerCase();
    var gender = String(s.gender || "").trim().toLowerCase();

    if (search && !fy.toLowerCase().includes(search) && !cls.toLowerCase().includes(search)) return;

    if (!fyGroups[fy]) fyGroups[fy] = {};
    if (!fyGroups[fy][cls]) fyGroups[fy][cls] = { activeMale: 0, activeFemale: 0, inactiveMale: 0, inactiveFemale: 0 };

    if (status === "active") {
      if (gender === "male") fyGroups[fy][cls].activeMale++;
      else if (gender === "female") fyGroups[fy][cls].activeFemale++;
    } else {
      if (gender === "male") fyGroups[fy][cls].inactiveMale++;
      else if (gender === "female") fyGroups[fy][cls].inactiveFemale++;
    }
  });

  var sortedFYs = Object.keys(fyGroups).sort((a, b) => b.localeCompare(a));
  var containerHtml = "";

  sortedFYs.forEach(fy => {
    containerHtml += `
      <div class="space-y-2.5">
        <div class="text-xs font-bold text-sky-400 tracking-wider flex items-center gap-2 uppercase">
          <i class="fa-solid fa-calendar-days"></i> Fiscal Year (ပညာသင်နှစ်): ${fy}
        </div>
        <div class="table-container bg-[#0c1322] border border-slate-800 shadow-2xl relative overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr class="bg-[#0e172a] text-slate-400">
                <th scope="col" class="w-12 text-center text-xs py-3" rowspan="2">NO</th>
                <th scope="col" class="w-28 text-xs text-center py-3" rowspan="2">FY</th>
                <th scope="col" class="min-w-[150px] text-xs pl-4 py-3" rowspan="2">CLASS</th>
                <th scope="col" class="w-44 text-right text-xs pr-4 text-indigo-400 font-bold" rowspan="2">CLASS AMOUNT</th>
                <th scope="col" class="text-center text-xs text-emerald-400 border-b border-slate-800 py-2 font-bold" colspan="3">ACTIVE STUDENTS</th>
                <th scope="col" class="text-center text-xs text-rose-400 border-b border-slate-800 py-2 font-bold" colspan="3">INACTIVE STUDENTS</th>
              </tr>
              <tr class="bg-[#0e172a] text-slate-400">
                <th scope="col" class="w-24 text-right text-xs text-emerald-400 pr-4 py-2 font-bold">MALE</th>
                <th scope="col" class="w-24 text-right text-xs text-emerald-400 pr-4 py-2 font-bold">FEMALE</th>
                <th scope="col" class="w-28 text-right text-xs text-emerald-400 pr-4 py-2 font-bold">TOTAL</th>
                <th scope="col" class="w-24 text-right text-xs text-rose-400 pr-4 py-2 font-bold">MALE</th>
                <th scope="col" class="w-24 text-right text-xs text-rose-400 pr-4 py-2 font-bold">FEMALE</th>
                <th scope="col" class="w-28 text-right text-xs text-rose-400 pr-4 py-2 font-bold">TOTAL</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/40 text-slate-300">
    `;

    var classes = Object.keys(fyGroups[fy]).sort();
    var idx = 1;
    var fyActMale = 0, fyActFemale = 0, fyInactMale = 0, fyInactFemale = 0;
    var fyClassAmountTotal = 0;

    classes.forEach(cls => {
      var d = fyGroups[fy][cls];
      var actTot = d.activeMale + d.activeFemale;
      var inactTot = d.inactiveMale + d.inactiveFemale;

      fyActMale += d.activeMale; fyActFemale += d.activeFemale;
      fyInactMale += d.inactiveMale; fyInactFemale += d.inactiveFemale;

      var classAmount = 0;
      if (incomeMap[fy] && incomeMap[fy][cls]) {
        classAmount = cleanNum(incomeMap[fy][cls]);
      }
      fyClassAmountTotal += classAmount;

      containerHtml += `
        <tr class="hover:bg-slate-800/20 text-slate-300">
          <td class="text-center font-semibold text-slate-500 py-2.5">${idx++}</td>
          <td class="text-center font-semibold text-slate-400 py-2.5">${fy}</td>
          <td class="font-bold text-slate-100 pl-4 py-2.5">${cls}</td>
          <td class="text-right text-indigo-400 font-extrabold font-mono pr-4 py-2.5">${classAmount > 0 ? classAmount.toLocaleString('en-US') + ' MMK' : '-'}</td>
          <td class="text-right text-emerald-400 pr-4 py-2.5">${d.activeMale > 0 ? d.activeMale.toLocaleString('en-US') : '-'}</td>
          <td class="text-right text-emerald-400 pr-4 py-2.5">${d.activeFemale > 0 ? d.activeFemale.toLocaleString('en-US') : '-'}</td>
          <td class="text-right text-emerald-400 font-bold pr-4 py-2.5">${actTot > 0 ? actTot.toLocaleString('en-US') : '-'}</td>
          <td class="text-right text-rose-400 pr-4 py-2.5">${d.inactiveMale > 0 ? d.inactiveMale.toLocaleString('en-US') : '-'}</td>
          <td class="text-right text-rose-400 pr-4 py-2.5">${d.inactiveFemale > 0 ? d.inactiveFemale.toLocaleString('en-US') : '-'}</td>
          <td class="text-right text-rose-400 font-bold pr-4 py-2.5">${inactTot > 0 ? inactTot.toLocaleString('en-US') : '-'}</td>
        </tr>
      `;
    });

    var fyActTot = fyActMale + fyActFemale;
    var fyInactTot = fyInactMale + fyInactFemale;

    containerHtml += `
              <tr class="bg-slate-900/60 font-black text-slate-200 border-t border-slate-700">
                <td colspan="3" class="text-center text-xs uppercase py-3">Totals</td>
                <td class="text-right text-indigo-400 font-extrabold font-mono pr-4 bg-indigo-500/5 py-3">${fyClassAmountTotal > 0 ? fyClassAmountTotal.toLocaleString('en-US') + ' MMK' : '-'}</td>
                <td class="text-right text-emerald-400 pr-4 py-3">${fyActMale > 0 ? fyActMale.toLocaleString('en-US') : '-'}</td>
                <td class="text-right text-emerald-400 pr-4 py-3">${fyActFemale > 0 ? fyActFemale.toLocaleString('en-US') : '-'}</td>
                <td class="text-right text-emerald-400 font-extrabold pr-4 bg-emerald-500/5 py-3">${fyActTot > 0 ? fyActTot.toLocaleString('en-US') : '-'}</td>
                <td class="text-right text-rose-400 pr-4 py-3">${fyInactMale > 0 ? fyInactMale.toLocaleString('en-US') : '-'}</td>
                <td class="text-right text-rose-400 pr-4 py-3">${fyInactFemale > 0 ? fyInactFemale.toLocaleString('en-US') : '-'}</td>
                <td class="text-right text-rose-400 font-extrabold pr-4 bg-rose-500/5 py-3">${fyInactTot > 0 ? fyInactTot.toLocaleString('en-US') : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  });

  container.innerHTML = containerHtml;
}

function onSearchInputReportStudent() { compileReportStudentData(); }

/**
 * 💡 STUDENT DEMOGRAPHICS CSV FILE DOWNLOAD
 */
function exportToCSVReportStudent() {
  const cache = window.erpCache['student-report-details'] || {};
  const students = cache.students || [];
  const incomeMap = cache.incomeMap || {};

  if (students.length === 0) { showToast("ERROR", "ထုတ်ယူရန် မည်သည့်စာရင်းမျှမရှိပါ!"); return; }

  var fyGroups = {};
  students.forEach(s => {
    var fy = s.fy || "Unknown-FY";
    var cls = s.class || "Unknown-Class";
    var status = String(s.status || "").trim().toLowerCase();
    var gender = String(s.gender || "").trim().toLowerCase();

    if (!fyGroups[fy]) fyGroups[fy] = {};
    if (!fyGroups[fy][cls]) fyGroups[fy][cls] = { activeMale: 0, activeFemale: 0, inactiveMale: 0, inactiveFemale: 0 };

    if (status === "active") {
      if (gender === "male") fyGroups[fy][cls].activeMale++;
      else if (gender === "female") fyGroups[fy][cls].activeFemale++;
    } else {
      if (gender === "male") fyGroups[fy][cls].inactiveMale++;
      else if (gender === "female") fyGroups[fy][cls].inactiveFemale++;
    }
  });

  var sortedFYs = Object.keys(fyGroups).sort((a, b) => b.localeCompare(a));
  let csv = "";

  sortedFYs.forEach(fy => {
    csv += `--- FISCAL YEAR: ${fy} ---\n`;
    csv += "NO,FY,CLASS,CLASS AMOUNT,ACTIVE MALE,ACTIVE FEMALE,ACTIVE TOTAL,INACTIVE MALE,INACTIVE FEMALE,INACTIVE TOTAL\n";
    
    var classes = Object.keys(fyGroups[fy]).sort();
    var idx = 1;

    classes.forEach(cls => {
      var d = fyGroups[fy][cls];
      var actTot = d.activeMale + d.activeFemale;
      var inactTot = d.inactiveMale + d.inactiveFemale;

      var classAmount = 0;
      if (incomeMap[fy] && incomeMap[fy][cls]) classAmount = cleanNum(incomeMap[fy][cls]);

      csv += `${idx++},${fy},"${cls}",${classAmount},${d.activeMale},${d.activeFemale},${actTot},${d.inactiveMale},${d.inactiveFemale},${inactTot}\n`;
    });
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Student_Demographics_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

// ============================================================================
// 5️⃣ STANDALONE STAFF FUND REPORT
// ============================================================================

async function loadReportStaffFundData(isSilent = false) {
  try {
    if (!isSilent && typeof toggleLoading === 'function') toggleLoading(true);

    const res = await callApi('getFundReportData', {});
    if (res && res.success) {
      window.erpCache['staff-fund-report'] = res.data || [];
      compileReportStaffFundData();
    } else {
      showToast("ERROR", res.message || "Fund Report ဒေတာ မရရှိပါ");
    }
  } catch (err) {
    showToast("ERROR", "Error loading Staff Fund Report: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

function compileReportStaffFundData() {
  const tableBody = document.getElementById('report-staff-fund-table-body');
  if (!tableBody) return;

  const fundData = window.erpCache['staff-fund-report'] || [];
  const searchVal = document.getElementById('report-staff-fund-search')?.value.toLowerCase().trim() || "";

  const filtered = fundData.filter(row => {
    if (searchVal) {
      const name = row.name ? row.name.toLowerCase() : "";
      const sId = row.staffId ? row.staffId.toLowerCase() : "";
      return name.includes(searchVal) || sId.includes(searchVal);
    }
    return true;
  });

  let totalBonus = 0;
  let totalFund = 0;
  let idx = 1;

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-500 font-bold">No records found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(row => {
    const bonus = cleanNum(row.bonusBalance);
    const fund = cleanNum(row.fundBalance);
    const total = bonus + fund;

    totalBonus += bonus;
    totalFund += fund;

    return `
      <tr class="hover:bg-slate-800/20 text-slate-300">
        <td class="text-center font-semibold text-slate-500 py-2.5">${idx++}</td>
        <td class="text-center text-indigo-400 font-bold py-2.5">${row.fundDate || '-'}</td>
        <td class="font-bold text-slate-400 py-2.5">${row.staffId || '-'}</td>
        <td class="font-bold text-slate-200 py-2.5">${row.name || '-'}</td>
        <td class="text-right text-emerald-400 font-semibold font-mono py-2.5 pr-4">${bonus > 0 ? bonus.toLocaleString('en-US') + ' MMK' : '-'}</td>
        <td class="text-right text-teal-400 font-semibold font-mono py-2.5 pr-4">${fund > 0 ? fund.toLocaleString('en-US') + ' MMK' : '-'}</td>
        <td class="text-right text-indigo-400 font-black font-mono bg-indigo-500/5 py-2.5 pr-4">${total > 0 ? total.toLocaleString('en-US') + ' MMK' : '-'}</td>
        <td class="text-slate-500 text-xs py-2.5">
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">
            ${row.status || 'Active'}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  const bonusEl = document.getElementById('report-fund-total-bonus');
  const fundEl = document.getElementById('report-fund-total-fund');
  const totalEl = document.getElementById('report-fund-total-all');
  const countEl = document.getElementById('report-fund-total-count');

  if (bonusEl) bonusEl.textContent = `${totalBonus.toLocaleString('en-US')} MMK`;
  if (fundEl) fundEl.textContent = `${totalFund.toLocaleString('en-US')} MMK`;
  if (totalEl) totalEl.textContent = `${(totalBonus + totalFund).toLocaleString('en-US')} MMK`;
  if (countEl) countEl.textContent = filtered.length;
}

function onSearchInputReportStaffFund() { compileReportStaffFundData(); }

/**
 * 💡 STAFF FUND CSV FILE DOWNLOAD
 */
function exportToCSVReportStaffFund() {
  const fundData = window.erpCache['staff-fund-report'] || [];
  if (fundData.length === 0) { showToast("ERROR", "ထုတ်ယူရန် မည်သည့်ဒေတာမျှ မရှိသေးပါ!"); return; }

  let csv = "NO,FUND DATE,STAFF ID,NAME,BONUS BALANCE,FUND BALANCE,TOTAL BALANCES,STATUS\n";
  let idx = 1;
  fundData.forEach(row => {
    const bonus = cleanNum(row.bonusBalance);
    const fund = cleanNum(row.fundBalance);
    const total = bonus + fund;
    csv += `${idx++},${row.fundDate || ''},${row.staffId || ''},"${row.name || ''}",${bonus},${fund},${total},${row.status || 'Active'}\n`;
  });

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Staff_Fund_Report_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}
