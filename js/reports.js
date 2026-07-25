/**
 * GOLDEN ERP SYSTEM - FINANCIAL & DEMOGRAPHIC REPORTS CONTROLLER
 * File: js/reports.js
 */

let gStudentReportRawData = null;

function formatNumWithCommas(val) {
  if (val === null || val === undefined || val === '') return '0';
  const num = parseFloat(String(val).replace(/,/g, ''));
  if (isNaN(num)) return String(val);
  return num.toLocaleString('en-US');
}

function showReportPanel(panelId) {
  document.querySelectorAll('.report-panel').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.rep-sub-tab-btn').forEach(btn => {
    btn.classList.remove('bg-emerald-600', 'bg-sky-600', 'bg-indigo-600', 'bg-amber-600', 'text-white');
    btn.classList.add('bg-slate-800', 'text-slate-400');
  });

  const targetPanel = document.getElementById(panelId);
  if (targetPanel) targetPanel.classList.remove('hidden');

  if (panelId === 'panel-report-financial') {
    const btn = document.getElementById('btn-rep-fin');
    if (btn) btn.classList.add('bg-emerald-600', 'text-white');
    loadReportFinancialData();
  } else if (panelId === 'panel-report-income-detail') {
    const btn = document.getElementById('btn-rep-indetail');
    if (btn) btn.classList.add('bg-sky-600', 'text-white');
    loadReportIncomeData();
  } else if (panelId === 'panel-report-monthly-income') {
    const btn = document.getElementById('btn-rep-inrep');
    if (btn) btn.classList.add('bg-indigo-600', 'text-white');
    loadReportGeneralData();
  } else if (panelId === 'panel-report-student') {
    const btn = document.getElementById('btn-rep-student');
    if (btn) btn.classList.add('bg-amber-600', 'text-white');
    loadReportStudentData();
  }
}

// 💡 1. FINANCIAL STATEMENT
async function loadReportFinancialData(forceRefresh = false) {
  try {
    showLoading(true);
    const res = await callApi('getFinancialReportData', { forceRefresh });
    if (res && res.success && res.data) {
      renderFinancialReportData(res.data);
    }
  } catch (err) {
    showToast('Financial Statement Load Error: ' + err.message, 'error');
  } finally {
    showLoading(false);
  }
}

function renderFinancialReportData(data) {
  const catBody = document.getElementById('report-fin-inc-cat-body');
  if (catBody && data.categories) {
    catBody.innerHTML = `
      <tr><td class="text-center font-bold">1</td><td class="font-semibold">Boarder</td><td class="text-right font-extrabold text-emerald-400 font-mono pr-2">${formatNumWithCommas(data.categories.boarder)} MMK</td></tr>
      <tr><td class="text-center font-bold">2</td><td class="font-semibold">Semi Boarder</td><td class="text-right font-extrabold text-emerald-400 font-mono pr-2">${formatNumWithCommas(data.categories.semiBoarder)} MMK</td></tr>
      <tr><td class="text-center font-bold">3</td><td class="font-semibold">Day Student</td><td class="text-right font-extrabold text-emerald-400 font-mono pr-2">${formatNumWithCommas(data.categories.dayStudent)} MMK</td></tr>
      <tr class="bg-emerald-500/10 font-black text-emerald-300"><td colspan="2" class="py-2.5 uppercase tracking-wider pl-2">Total Category Income</td><td class="text-right font-mono pr-2 text-sm">${formatNumWithCommas(data.categories.total)} MMK</td></tr>
    `;
  }

  const accBody = document.getElementById('report-fin-inc-acc-body');
  if (accBody && data.accounts) {
    accBody.innerHTML = `
      <tr><td class="text-center font-bold">1</td><td class="font-semibold">Registration</td><td class="text-right font-extrabold text-indigo-400 font-mono pr-2">${formatNumWithCommas(data.accounts.registration)} MMK</td></tr>
      <tr><td class="text-center font-bold">2</td><td class="font-semibold">Services</td><td class="text-right font-extrabold text-indigo-400 font-mono pr-2">${formatNumWithCommas(data.accounts.services)} MMK</td></tr>
      <tr><td class="text-center font-bold">3</td><td class="font-semibold">Ferry</td><td class="text-right font-extrabold text-indigo-400 font-mono pr-2">${formatNumWithCommas(data.accounts.ferry)} MMK</td></tr>
      <tr><td class="text-center font-bold">4</td><td class="font-semibold">Night Study Fees</td><td class="text-right font-extrabold text-indigo-400 font-mono pr-2">${formatNumWithCommas(data.accounts.nightStudy)} MMK</td></tr>
      <tr><td class="text-center font-bold">5</td><td class="font-semibold">Others</td><td class="text-right font-extrabold text-indigo-400 font-mono pr-2">${formatNumWithCommas(data.accounts.others)} MMK</td></tr>
      <tr class="bg-indigo-500/10 font-black text-indigo-300"><td colspan="2" class="py-2.5 uppercase tracking-wider pl-2">Total Account Income</td><td class="text-right font-mono pr-2 text-sm">${formatNumWithCommas(data.accounts.total)} MMK</td></tr>
    `;
  }

  const expBody = document.getElementById('report-fin-exp-body');
  if (expBody && data.office) {
    expBody.innerHTML = `
      <tr><td class="text-center font-bold">1</td><td>Office Expenses</td><td class="text-right font-extrabold text-rose-400 font-mono pr-2">${formatNumWithCommas(data.office.total)} MMK</td></tr>
      <tr><td class="text-center font-bold">2</td><td>Kitchen Expenses</td><td class="text-right font-extrabold text-rose-400 font-mono pr-2">${formatNumWithCommas(data.kitchen?.total || 0)} MMK</td></tr>
      <tr><td class="text-center font-bold">3</td><td>HR Payroll Expenses</td><td class="text-right font-extrabold text-rose-400 font-mono pr-2">${formatNumWithCommas(data.payroll?.total || 0)} MMK</td></tr>
      <tr class="bg-rose-500/10 font-black text-rose-300"><td colspan="2" class="py-2.5 uppercase tracking-wider pl-2">Grand Total Expenses</td><td class="text-right font-mono pr-2 text-sm">${formatNumWithCommas((data.office.total || 0) + (data.kitchen?.total || 0) + (data.payroll?.total || 0))} MMK</td></tr>
    `;
  }
}

// 💡 2. INCOME DETAIL (InDetail)
async function loadReportIncomeData(forceRefresh = false) {
  try {
    showLoading(true);
    const res = await callApi('getIncomeDetailReportData', { forceRefresh });
    if (res && res.success) {
      renderGenericTable('report-income-main-table', res.headers || [], res.data || []);
    }
  } catch (err) {
    showToast('Income Detail Load Error: ' + err.message, 'error');
  } finally {
    showLoading(false);
  }
}

// 💡 3. MONTHLY INCOME (InRep)
async function loadReportGeneralData(forceRefresh = false) {
  try {
    showLoading(true);
    const res = await callApi('getMonthlyIncomeReportData', { forceRefresh });
    if (res && res.success) {
      if (res.table1) renderGenericTable('report-general-table-1', res.table1.headers || [], res.table1.data || []);
      if (res.table2) renderGenericTable('report-general-table-2', res.table2.headers || [], res.table2.data || []);
    }
  } catch (err) {
    showToast('Monthly Income Report Load Error: ' + err.message, 'error');
  } finally {
    showLoading(false);
  }
}

function renderGenericTable(tableId, headers, rows) {
  const table = document.getElementById(tableId);
  if (!table) return;

  let headHtml = '<thead><tr class="bg-[#0e172a] text-slate-300 text-xs uppercase font-bold">';
  headers.forEach(h => { headHtml += `<th class="px-4 py-3 border border-slate-800">${h || ''}</th>`; });
  headHtml += '</tr></thead>';

  let bodyHtml = '<tbody class="divide-y divide-slate-800/40 text-xs text-slate-300">';
  rows.forEach(r => {
    bodyHtml += '<tr class="hover:bg-slate-800/30 transition">';
    r.forEach((cell, idx) => {
      const isNum = !isNaN(parseFloat(String(cell).replace(/,/g, ''))) && isFinite(cell);
      const alignClass = isNum ? 'text-right font-mono' : 'text-left';
      bodyHtml += `<td class="px-4 py-2.5 border border-slate-800/60 ${alignClass}">${isNum ? formatNumWithCommas(cell) : (cell || '')}</td>`;
    });
    bodyHtml += '</tr>';
  });
  bodyHtml += 'tbody>';

  table.innerHTML = headHtml + bodyHtml;
}

// 💡 4. STUDENT DEMOGRAPHICS (StRep SHEET READER WITH 2 BEAUTIFUL COLORED TABLES)
async function loadReportStudentData(forceRefresh = false) {
  try {
    showLoading(true);
    const res = await callApi('getStudentReportDetails', { forceRefresh });
    if (res && res.success) {
      gStudentReportRawData = res;
      renderStudentReportTables();
    }
  } catch (err) {
    showToast('Student Demographics Load Error: ' + err.message, 'error');
  } finally {
    showLoading(false);
  }
}

function renderStudentReportTables() {
  const container = document.getElementById('report-student-tables-container');
  if (!container || !gStudentReportRawData) return;

  const searchVal = (document.getElementById('report-student-search')?.value || '').toLowerCase().trim();
  const { table1, table2 } = gStudentReportRawData;

  const filterRows = (dataRows) => {
    if (!searchVal || !Array.isArray(dataRows)) return dataRows || [];
    return dataRows.filter(row =>
      Array.isArray(row) && row.some(cell => String(cell || '').toLowerCase().includes(searchVal))
    );
  };

  const rows1 = filterRows(table1?.data);
  const rows2 = filterRows(table2?.data);

  let html = '';

  // 🟢 TABLE 1: CURRENT FY STUDENT REPORT (Emerald / Cyan Theme)
  html += `
    <div class="bg-[#0c1322] border border-emerald-500/30 rounded-2xl p-5 shadow-2xl space-y-4">
      <div class="flex justify-between items-center border-b border-emerald-500/20 pb-3">
        <h3 class="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
          <i class="fa-solid fa-graduation-cap text-base"></i> ${table1?.title || 'Current FY Student Report'}
        </h3>
        <span class="text-[10px] font-bold text-emerald-300 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          Showing ${rows1.length} Classes
        </span>
      </div>

      <div class="overflow-x-auto table-container">
        <table class="w-full text-left border-collapse text-xs min-w-[1100px]">
          <thead>
            <tr class="bg-emerald-950/40 text-emerald-300 font-extrabold uppercase border-b border-emerald-500/30">
              ${(table1?.headers || []).map((h, i) => `<th class="py-3 px-3 ${i >= 3 ? 'text-right' : 'text-left'}">${h || ''}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-slate-200">
            ${rows1.map(r => `
              <tr class="hover:bg-emerald-500/5 transition">
                <td class="py-2.5 px-3 text-center font-bold text-slate-400">${r[0] || ''}</td>
                <td class="py-2.5 px-3 font-semibold text-slate-300">${r[1] || ''}</td>
                <td class="py-2.5 px-3 font-extrabold text-white">${r[2] || ''}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">${formatNumWithCommas(r[3])}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-teal-300">${formatNumWithCommas(r[4])}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-teal-300">${formatNumWithCommas(r[5])}</td>
                <td class="py-2.5 px-3 text-right font-mono font-black text-emerald-300">${formatNumWithCommas(r[6])}</td>
                <td class="py-2.5 px-3 text-right font-mono text-slate-400">${formatNumWithCommas(r[7])}</td>
                <td class="py-2.5 px-3 text-right font-mono text-slate-400">${formatNumWithCommas(r[8])}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-400">${formatNumWithCommas(r[9])}</td>
              </tr>
            `).join('')}
          </tbody>
          ${table1?.total && table1.total.length > 0 ? `
            <tfoot>
              <tr class="bg-emerald-500/10 font-black text-emerald-300 border-t-2 border-emerald-500/40">
                <td colspan="3" class="py-3 px-3 uppercase text-xs tracking-wider">${table1.total[0] || 'Total'}</td>
                <td class="py-3 px-3 text-right font-mono text-emerald-300">${formatNumWithCommas(table1.total[3])}</td>
                <td class="py-3 px-3 text-right font-mono">${formatNumWithCommas(table1.total[4])}</td>
                <td class="py-3 px-3 text-right font-mono">${formatNumWithCommas(table1.total[5])}</td>
                <td class="py-3 px-3 text-right font-mono text-sm">${formatNumWithCommas(table1.total[6])}</td>
                <td class="py-3 px-3 text-right font-mono text-slate-300">${formatNumWithCommas(table1.total[7])}</td>
                <td class="py-3 px-3 text-right font-mono text-slate-300">${formatNumWithCommas(table1.total[8])}</td>
                <td class="py-3 px-3 text-right font-mono text-slate-300">${formatNumWithCommas(table1.total[9])}</td>
              </tr>
            </tfoot>
          ` : ''}
        </table>
      </div>
    </div>
  `;

  // 🟣 TABLE 2: NEXT YEAR STUDENT REPORT (Indigo / Amber Theme)
  html += `
    <div class="bg-[#0c1322] border border-indigo-500/30 rounded-2xl p-5 shadow-2xl space-y-4 mt-6">
      <div class="flex justify-between items-center border-b border-indigo-500/20 pb-3">
        <h3 class="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <i class="fa-solid fa-calendar-plus text-base"></i> ${table2?.title || 'Next Year Student Report'}
        </h3>
        <span class="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Showing ${rows2.length} Classes
        </span>
      </div>

      <div class="overflow-x-auto table-container">
        <table class="w-full text-left border-collapse text-xs min-w-[1100px]">
          <thead>
            <tr class="bg-indigo-950/40 text-indigo-300 font-extrabold uppercase border-b border-indigo-500/30">
              ${(table2?.headers || []).map((h, i) => `<th class="py-3 px-3 ${i >= 3 ? 'text-right' : 'text-left'}">${h || ''}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/40 text-slate-200">
            ${rows2.map(r => `
              <tr class="hover:bg-indigo-500/5 transition">
                <td class="py-2.5 px-3 text-center font-bold text-slate-400">${r[0] || ''}</td>
                <td class="py-2.5 px-3 font-semibold text-slate-300">${r[1] || ''}</td>
                <td class="py-2.5 px-3 font-extrabold text-white">${r[2] || ''}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-indigo-400">${formatNumWithCommas(r[3])}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-amber-300">${formatNumWithCommas(r[4])}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-amber-300">${formatNumWithCommas(r[5])}</td>
                <td class="py-2.5 px-3 text-right font-mono font-black text-indigo-300">${formatNumWithCommas(r[6])}</td>
                <td class="py-2.5 px-3 text-right font-mono text-slate-400">${formatNumWithCommas(r[7])}</td>
                <td class="py-2.5 px-3 text-right font-mono text-slate-400">${formatNumWithCommas(r[8])}</td>
                <td class="py-2.5 px-3 text-right font-mono font-bold text-slate-400">${formatNumWithCommas(r[9])}</td>
              </tr>
            `).join('')}
          </tbody>
          ${table2?.total && table2.total.length > 0 ? `
            <tfoot>
              <tr class="bg-indigo-500/10 font-black text-indigo-300 border-t-2 border-indigo-500/40">
                <td colspan="3" class="py-3 px-3 uppercase text-xs tracking-wider">${table2.total[0] || 'Total'}</td>
                <td class="py-3 px-3 text-right font-mono text-indigo-300">${formatNumWithCommas(table2.total[3])}</td>
                <td class="py-3 px-3 text-right font-mono">${formatNumWithCommas(table2.total[4])}</td>
                <td class="py-3 px-3 text-right font-mono">${formatNumWithCommas(table2.total[5])}</td>
                <td class="py-3 px-3 text-right font-mono text-sm">${formatNumWithCommas(table2.total[6])}</td>
                <td class="py-3 px-3 text-right font-mono text-slate-300">${formatNumWithCommas(table2.total[7])}</td>
                <td class="py-3 px-3 text-right font-mono text-slate-300">${formatNumWithCommas(table2.total[8])}</td>
                <td class="py-3 px-3 text-right font-mono text-slate-300">${formatNumWithCommas(table2.total[9])}</td>
              </tr>
            </tfoot>
          ` : ''}
        </table>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function onSearchInputReportStudent() {
  renderStudentReportTables();
}

function exportToCSVReportStudent() {
  if (!gStudentReportRawData) return showToast('No student demographics data available', 'warning');

  const { table1, table2 } = gStudentReportRawData;
  let csvRows = [];

  // Table 1
  csvRows.push([`"${table1?.title || 'Current FY Student Report'}"`]);
  if (table1?.headers) csvRows.push(table1.headers.map(h => `"${h || ''}"`));
  if (table1?.data) table1.data.forEach(r => csvRows.push(r.map(c => `"${c || ''}"`)));
  if (table1?.total) csvRows.push(table1.total.map(c => `"${c || ''}"`));

  csvRows.push([]); // Empty line separator

  // Table 2
  csvRows.push([`"${table2?.title || 'Next Year Student Report'}"`]);
  if (table2?.headers) csvRows.push(table2.headers.map(h => `"${h || ''}"`));
  if (table2?.data) table2.data.forEach(r => csvRows.push(r.map(c => `"${c || ''}"`)));
  if (table2?.total) csvRows.push(table2.total.map(c => `"${c || ''}"`));

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Student_Demographics_Report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 💡 5. STAFF FUND REPORT
async function loadReportStaffFundData(forceRefresh = false) {
  try {
    showLoading(true);
    const res = await callApi('getFundReportData', { forceRefresh });
    if (res && res.success && Array.isArray(res.data)) {
      renderStaffFundReportData(res.data);
    }
  } catch (err) {
    showToast('Staff Fund Report Load Error: ' + err.message, 'error');
  } finally {
    showLoading(false);
  }
}

function renderStaffFundReportData(list) {
  const tbody = document.getElementById('report-staff-fund-table-body');
  if (!tbody) return;

  const searchVal = (document.getElementById('report-staff-fund-search')?.value || '').toLowerCase().trim();
  let filtered = list;
  if (searchVal) {
    filtered = list.filter(r =>
      (r.name || '').toLowerCase().includes(searchVal) ||
      (r.staffId || '').toLowerCase().includes(searchVal)
    );
  }

  let totBonus = 0, totFund = 0, totAll = 0;
  list.forEach(r => {
    totBonus += r.bonusBalance || 0;
    totFund += r.fundBalance || 0;
    totAll += r.totalBalances || 0;
  });

  document.getElementById('report-fund-total-bonus').innerText = formatNumWithCommas(totBonus) + ' MMK';
  document.getElementById('report-fund-total-fund').innerText = formatNumWithCommas(totFund) + ' MMK';
  document.getElementById('report-fund-total-all').innerText = formatNumWithCommas(totAll) + ' MMK';
  document.getElementById('report-fund-total-count').innerText = list.length;

  tbody.innerHTML = filtered.map((r, i) => `
    <tr class="hover:bg-slate-800/30 transition">
      <td class="py-2.5 text-center font-bold text-slate-400">${r.no || (i + 1)}</td>
      <td class="py-2.5 text-center font-mono">${r.fundDate || '-'}</td>
      <td class="py-2.5 font-mono font-bold text-indigo-400">${r.staffId || '-'}</td>
      <td class="py-2.5 font-extrabold text-white">${r.name || '-'}</td>
      <td class="py-2.5 text-right font-mono font-bold text-emerald-400">${formatNumWithCommas(r.bonusBalance)}</td>
      <td class="py-2.5 text-right font-mono font-bold text-teal-400">${formatNumWithCommas(r.fundBalance)}</td>
      <td class="py-2.5 text-right font-mono font-black text-indigo-300 bg-indigo-500/5 pr-4">${formatNumWithCommas(r.totalBalances)}</td>
      <td class="py-2.5 text-center font-bold text-xs"><span class="px-2 py-0.5 rounded ${r.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}">${r.status || 'Active'}</span></td>
    </tr>
  `).join('');
}

function onSearchInputReportStaffFund() {
  loadReportStaffFundData();
}

function exportToCSVReportStaffFund() {
  showToast('Exporting Staff Fund Report to CSV...', 'info');
}
