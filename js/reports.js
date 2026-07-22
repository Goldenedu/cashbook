/**
 * GOLDEN ERP SYSTEM - FINANCIAL & GENERAL REPORTING MODULE
 * File: js/reports.js
 */

window.ReportsState = {
  activePanel: 'financial', // 'financial', 'income-detail', 'monthly-income', 'staff-fund', 'student-report'
  financialData: null,
  incomeDetailData: null,
  monthlyIncomeData: null,
  staffFundData: [],
  studentReportData: null
};

/**
 * 💡 Switch Between Report Panels
 */
function showReportPanel(panelId) {
  document.querySelectorAll('.report-panel').forEach(panel => panel.classList.add('hidden'));

  const target = document.getElementById(panelId);
  if (target) target.classList.remove('hidden');

  if (panelId === 'panel-report-financial') {
    window.ReportsState.activePanel = 'financial';
    loadReportFinancialData(false);
  } else if (panelId === 'panel-report-income-detail') {
    window.ReportsState.activePanel = 'income-detail';
    loadReportIncomeDetailData(false);
  } else if (panelId === 'panel-report-monthly-income') {
    window.ReportsState.activePanel = 'monthly-income';
    loadReportMonthlyIncomeData(false);
  } else if (panelId === 'panel-report-staff-fund') {
    window.ReportsState.activePanel = 'staff-fund';
    loadReportStaffFundData(false);
  } else if (panelId === 'panel-report-student') {
    window.ReportsState.activePanel = 'student-report';
    loadReportStudentData(false);
  }
}

/**
 * 1️⃣ Financial Report Handler (Home Sheet Cell-Based)
 */
async function loadReportFinancialData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  try {
    const response = await callApi('getFinancialReportData', {}, 'GET');
    if (!isSilent) toggleLoading(false);

    if (response && response.data) {
      window.ReportsState.financialData = response.data;
      renderReportFinancial();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Financial Report:", err);
  }
}

function renderReportFinancial() {
  const data = window.ReportsState.financialData;
  if (!data) return;

  // Student Category Income
  const catBody = document.getElementById('report-fin-inc-cat-body');
  if (catBody) {
    catBody.innerHTML = `
      <tr><td class="text-center font-bold py-2">1</td><td>Boarder (ဘော်ဒါ)</td><td class="text-right font-bold text-emerald-400">${Number(data.categories.boarder || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center font-bold py-2">2</td><td>Semi Boarder (ဆီမီးဘော်ဒါ)</td><td class="text-right font-bold text-emerald-400">${Number(data.categories.semiBoarder || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center font-bold py-2">3</td><td>Day Student (နေ့ကျောင်းသား)</td><td class="text-right font-bold text-emerald-400">${Number(data.categories.dayStudent || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr class="bg-emerald-500/5 font-black text-emerald-400"><td colspan="2" class="text-center py-2.5">Total Category Income</td><td class="text-right py-2.5 pr-2">${Number(data.categories.total || 0).toLocaleString('en-US')} MMK</td></tr>
    `;
  }

  // Account Name Income
  const accBody = document.getElementById('report-fin-inc-acc-body');
  if (accBody) {
    accBody.innerHTML = `
      <tr><td class="text-center font-bold py-2">1</td><td>Registration (ကျောင်းအပ်ခ)</td><td class="text-right font-bold text-emerald-400">${Number(data.accounts.registration || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center font-bold py-2">2</td><td>Services (သင်ကြားရေး)</td><td class="text-right font-bold text-emerald-400">${Number(data.accounts.services || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center font-bold py-2">3</td><td>Ferry (ဖယ်ရီခ)</td><td class="text-right font-bold text-emerald-400">${Number(data.accounts.ferry || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center font-bold py-2">4</td><td>Night Study Fees (ညစာကျက်)</td><td class="text-right font-bold text-emerald-400">${Number(data.accounts.nightStudy || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center font-bold py-2">5</td><td>Others (အထွေထွေ)</td><td class="text-right font-bold text-emerald-400">${Number(data.accounts.others || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr class="bg-emerald-500/5 font-black text-emerald-400"><td colspan="2" class="text-center py-2.5">Total Account Income</td><td class="text-right py-2.5 pr-2">${Number(data.accounts.total || 0).toLocaleString('en-US')} MMK</td></tr>
    `;
  }

  // Expenses Breakdown
  const expBody = document.getElementById('report-fin-exp-body');
  if (expBody) {
    const totalExp = (data.office.total || 0) + (data.kitchen.total || 0) + (data.payroll.total || 0);
    expBody.innerHTML = `
      <tr><td class="text-center py-1.5">1</td><td>Office - Admin Exp</td><td class="text-right text-rose-400">${Number(data.office.adminExp || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center py-1.5">2</td><td>Office - Vehicle Exp</td><td class="text-right text-rose-400">${Number(data.office.vehicleExp || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center py-1.5">3</td><td>Office - HR Staff Benefit</td><td class="text-right text-rose-400">${Number(data.office.hrStaffBenefit || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center py-1.5">4</td><td>Kitchen - Rice & Oil</td><td class="text-right text-rose-400">${Number(data.kitchen.riceOil || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center py-1.5">5</td><td>Kitchen - Meat & Eggs</td><td class="text-right text-rose-400">${Number(data.kitchen.fishMeatEggs || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center py-1.5">6</td><td>Payroll - Full Time Salary</td><td class="text-right text-rose-400">${Number(data.payroll.fullTimeSalary || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr><td class="text-center py-1.5">7</td><td>Payroll - Part Time Salary</td><td class="text-right text-rose-400">${Number(data.payroll.partTimeSalary || 0).toLocaleString('en-US')} MMK</td></tr>
      <tr class="bg-rose-500/5 font-black text-rose-400"><td colspan="2" class="text-center py-2.5">Total Combined Expenses</td><td class="text-right py-2.5 pr-2">${totalExp.toLocaleString('en-US')} MMK</td></tr>
    `;
  }
}

/**
 * 2️⃣ Income Detail Matrix Report (InDetail)
 */
async function loadReportIncomeDetailData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  try {
    const response = await callApi('getIncomeDetailReportData', {}, 'GET');
    if (!isSilent) toggleLoading(false);

    if (response && response.success) {
      window.ReportsState.incomeDetailData = response;
      renderReportIncomeDetail();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Income Detail Report:", err);
  }
}

function renderReportIncomeDetail() {
  const res = window.ReportsState.incomeDetailData;
  if (!res) return;

  const table = document.getElementById('report-income-detail-table');
  if (!table) return;

  const headers = res.headers || [];
  const rows = res.data || [];

  let headerHtml = `<thead><tr class="bg-[#0c1322] text-slate-400">${headers.map(h => `<th class="text-xs uppercase py-3 px-4 font-bold border-b border-slate-800">${escapeHtml(h)}</th>`).join('')}</tr></thead>`;

  let bodyHtml = `<tbody class="divide-y divide-slate-800/40 text-slate-300">`;
  rows.forEach(r => {
    bodyHtml += `<tr class="hover:bg-slate-800/20">`;
    r.forEach((cell, idx) => {
      const valStr = String(cell || "").trim();
      const numVal = parseFloat(valStr.replace(/,/g, ""));
      if (!isNaN(numVal) && valStr !== "" && idx > 4) {
        bodyHtml += `<td class="text-right font-medium pr-4">${numVal.toLocaleString('en-US')}</td>`;
      } else {
        bodyHtml += `<td>${escapeHtml(valStr)}</td>`;
      }
    });
    bodyHtml += `</tr>`;
  });
  bodyHtml += `</tbody>`;

  table.innerHTML = headerHtml + bodyHtml;
}

/**
 * 3️⃣ Monthly Income Summary Report (InRep)
 */
async function loadReportMonthlyIncomeData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  try {
    const response = await callApi('getMonthlyIncomeReportData', {}, 'GET');
    if (!isSilent) toggleLoading(false);

    if (response && response.success) {
      window.ReportsState.monthlyIncomeData = response;
      renderReportMonthlyIncome();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Monthly Income Report:", err);
  }
}

function renderReportMonthlyIncome() {
  const res = window.ReportsState.monthlyIncomeData;
  if (!res) return;

  const table = document.getElementById('report-monthly-income-table');
  if (!table) return;

  const headers = res.headers || [];
  const rows = res.data || [];

  let headerHtml = `<thead><tr class="bg-[#0e172a] text-slate-400">${headers.map(h => `<th class="text-xs uppercase py-3 px-4 font-bold border-b border-slate-800">${escapeHtml(h)}</th>`).join('')}</tr></thead>`;

  let bodyHtml = `<tbody class="divide-y divide-slate-800/40 text-slate-300">`;
  rows.forEach(r => {
    bodyHtml += `<tr class="hover:bg-slate-800/20">`;
    r.forEach((cell, idx) => {
      const valStr = String(cell || "").trim();
      const numVal = parseFloat(valStr.replace(/,/g, ""));
      if (!isNaN(numVal) && valStr !== "" && idx > 0) {
        bodyHtml += `<td class="text-right font-medium pr-4">${numVal.toLocaleString('en-US')}</td>`;
      } else {
        bodyHtml += `<td class="font-bold text-slate-100">${escapeHtml(valStr)}</td>`;
      }
    });
    bodyHtml += `</tr>`;
  });
  bodyHtml += `</tbody>`;

  table.innerHTML = headerHtml + bodyHtml;
}

/**
 * 4️⃣ Staff Fund Report Handler
 */
async function loadReportStaffFundData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  try {
    const response = await callApi('getFundReportData', {}, 'GET');
    if (!isSilent) toggleLoading(false);

    if (response && response.success && response.data) {
      window.ReportsState.staffFundData = response.data;
      renderReportStaffFund();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Staff Fund Report:", err);
  }
}

function renderReportStaffFund() {
  const tableBody = document.getElementById('report-staff-fund-table-body');
  if (!tableBody) return;

  const data = window.ReportsState.staffFundData || [];
  let idx = 1;
  let totBonus = 0, totFund = 0;

  if (data.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-8 text-slate-500 font-bold">No staff fund records found.</td></tr>`;
    return;
  }

  tableBody.innerHTML = data.map(row => {
    const bonus = cleanNumber(row.bonusBalance);
    const fund = cleanNumber(row.fundBalance);
    const total = bonus + fund;

    totBonus += bonus;
    totFund += fund;

    return `
      <tr class="hover:bg-slate-800/20 text-slate-300">
        <td class="text-center font-semibold text-slate-500">${idx++}</td>
        <td class="text-center text-indigo-400 font-bold">${escapeHtml(row.fundDate || '-')}</td>
        <td class="font-bold text-slate-400">${escapeHtml(row.staffId || '-')}</td>
        <td class="font-bold text-slate-200">${escapeHtml(row.name || '-')}</td>
        <td class="text-right text-emerald-400 font-semibold">${bonus.toLocaleString('en-US')}</td>
        <td class="text-right text-teal-400 font-semibold">${fund.toLocaleString('en-US')}</td>
        <td class="text-right text-indigo-400 font-black bg-indigo-500/5">${total.toLocaleString('en-US')}</td>
        <td><span class="px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}">${escapeHtml(row.status || 'Active')}</span></td>
      </tr>
    `;
  }).join('');

  const bonusEl = document.getElementById('report-fund-total-bonus');
  if (bonusEl) bonusEl.innerText = totBonus.toLocaleString('en-US') + " MMK";

  const fundEl = document.getElementById('report-fund-total-fund');
  if (fundEl) fundEl.innerText = totFund.toLocaleString('en-US') + " MMK";

  const totEl = document.getElementById('report-fund-total-all');
  if (totEl) totEl.innerText = (totBonus + totFund).toLocaleString('en-US') + " MMK";
}

/**
 * 5️⃣ Student Demographics Report Handler (Map-Reduce Class Amounts)
 */
async function loadReportStudentData(isSilent = false) {
  if (!isSilent) toggleLoading(true);

  try {
    const response = await callApi('getStudentReportDetails', {}, 'GET');
    if (!isSilent) toggleLoading(false);

    if (response && response.success) {
      window.ReportsState.studentReportData = response;
      renderReportStudent();
    }
  } catch (err) {
    if (!isSilent) toggleLoading(false);
    console.error("Error loading Student Demographics Report:", err);
  }
}

function renderReportStudent() {
  const container = document.getElementById('report-student-container');
  if (!container) return;

  const res = window.ReportsState.studentReportData;
  if (!res || !res.students) return;

  const students = res.students || [];
  const incomeMap = res.incomeMap || {};

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
  var html = "";

  sortedFYs.forEach(fy => {
    html += `
      <div class="space-y-2.5 mb-6">
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
                <th scope="col" class="w-36 text-right text-xs pr-4 text-indigo-400 font-bold" rowspan="2">CLASS AMOUNT</th>
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
        classAmount = cleanNumber(incomeMap[fy][cls]);
      }
      fyClassAmountTotal += classAmount;

      html += `
        <tr class="hover:bg-slate-800/20 text-slate-300">
          <td class="text-center font-semibold text-slate-500">${idx++}</td>
          <td class="text-center font-semibold text-slate-400">${fy}</td>
          <td class="font-bold text-slate-100 pl-4">${cls}</td>
          <td class="text-right text-indigo-400 font-bold pr-4">${classAmount > 0 ? classAmount.toLocaleString('en-US') + ' MMK' : '-'}</td>
          <td class="text-right text-emerald-400 pr-4">${d.activeMale || '-'}</td>
          <td class="text-right text-emerald-400 pr-4">${d.activeFemale || '-'}</td>
          <td class="text-right text-emerald-400 font-bold pr-4">${actTot || '-'}</td>
          <td class="text-right text-rose-400 pr-4">${d.inactiveMale || '-'}</td>
          <td class="text-right text-rose-400 pr-4">${d.inactiveFemale || '-'}</td>
          <td class="text-right text-rose-400 font-bold pr-4">${inactTot || '-'}</td>
        </tr>
      `;
    });

    html += `
              <tr class="bg-slate-900/60 font-black text-slate-200 border-t border-slate-700">
                <td colspan="3" class="text-center text-xs uppercase py-3">Totals</td>
                <td class="text-right text-indigo-400 font-extrabold pr-4 bg-indigo-500/5">${fyClassAmountTotal > 0 ? fyClassAmountTotal.toLocaleString('en-US') + ' MMK' : '-'}</td>
                <td class="text-right text-emerald-400 pr-4">${fyActMale || '-'}</td>
                <td class="text-right text-emerald-400 pr-4">${fyActFemale || '-'}</td>
                <td class="text-right text-emerald-400 font-extrabold pr-4 bg-emerald-500/5">${(fyActMale + fyActFemale) || '-'}</td>
                <td class="text-right text-rose-400 pr-4">${fyInactMale || '-'}</td>
                <td class="text-right text-rose-400 pr-4">${fyInactFemale || '-'}</td>
                <td class="text-right text-rose-400 font-extrabold pr-4 bg-rose-500/5">${(fyInactMale + fyInactFemale) || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}