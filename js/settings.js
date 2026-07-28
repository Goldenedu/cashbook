/**
 * GOLDEN ERP SYSTEM - SYSTEM SETTINGS & CONTROLS CONTROLLER
 * File: js/settings.js
 * 💡 Balances Control Reader (Home!J4:M10) & Automated Email/Excel Backup System
 */

function formatNumWithCommas(val) {
  if (val === null || val === undefined || val === '') return '0';
  const num = parseFloat(String(val).replace(/,/g, ''));
  if (isNaN(num)) return String(val);
  return num.toLocaleString('en-US');
}

/**
 * 💡 1. LOAD SETTINGS DATA (Home!J4:M10 Balances Control)
 */
async function loadSettingsData(forceRefresh = false) {
  try {
    if (typeof toggleLoading === 'function') toggleLoading(true);
    const res = await callApi('getSettingsData', { forceRefresh });

    if (res && res.success && res.balancesControl) {
      renderBalancesControlTable(res.balancesControl);
    } else if (res && res.warning) {
      if (typeof showToast === 'function') showToast("INFO", "Balances Control သတိပေးချက်: " + res.warning);
    }
  } catch (err) {
    console.warn('loadSettingsData error:', err.message);
    if (typeof showToast === 'function') showToast("ERROR", "Balances Control အချက်အလက်များ ရယူ၍ မရပါ: " + err.message);
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

/**
 * 💡 Render Balances Control Comparison Table
 */
function renderBalancesControlTable(bcData) {
  const tbody = document.getElementById('settings-balances-table-body');
  const tfoot = document.getElementById('settings-balances-table-foot');

  if (!tbody) return;

  const dataRows = bcData.data || [];
  const totalRow = bcData.total || [];

  if (!dataRows || dataRows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="py-4 text-center text-slate-500 italic">Home!J4:M10 တွင် Balances Control အချက်အလက်များ ရှာမတွေ့ပါ။</td></tr>`;
    if (tfoot) tfoot.innerHTML = '';
    return;
  }

  // Render Data Rows (Bank Book, Cash Book, Office Exp Book, Kitchen Exp Book, HR Payroll Exp Book)
  tbody.innerHTML = dataRows.map(r => {
    const bookName = r[0] || '-';
    const accountantAmt = r[1];
    const cashierAmt = r[2];
    const controlAmt = r[3];

    const isNegAcc = String(accountantAmt || '').includes('-') || String(accountantAmt || '').includes('(');
    const isNegCtrl = String(controlAmt || '').includes('-') || String(controlAmt || '').includes('(');

    return `
      <tr class="hover:bg-slate-800/30 transition border-b border-slate-800/40">
        <td class="py-2.5 px-3 font-extrabold text-slate-200">${escapeHtml(bookName)}</td>
        <td class="py-2.5 px-3 text-right font-mono font-bold ${isNegAcc ? 'text-rose-400' : 'text-emerald-400'}">${formatNumWithCommas(accountantAmt)}</td>
        <td class="py-2.5 px-3 text-right font-mono text-slate-300">${formatNumWithCommas(cashierAmt)}</td>
        <td class="py-2.5 px-3 text-right font-mono font-black ${isNegCtrl ? 'text-rose-400' : 'text-indigo-300'}">${formatNumWithCommas(controlAmt)}</td>
      </tr>
    `;
  }).join('');

  // Render Total Row
  if (tfoot && totalRow && totalRow.length > 0) {
    const isNegAccTot = String(totalRow[1] || '').includes('-') || String(totalRow[1] || '').includes('(');
    const isNegCtrlTot = String(totalRow[3] || '').includes('-') || String(totalRow[3] || '').includes('(');

    tfoot.innerHTML = `
      <tr class="bg-indigo-500/10 font-black text-indigo-300 border-t-2 border-indigo-500/30">
        <td class="py-3 px-3 uppercase text-xs tracking-wider text-slate-200">${escapeHtml(totalRow[0] || 'Total')}</td>
        <td class="py-3 px-3 text-right font-mono text-sm ${isNegAccTot ? 'text-rose-400' : 'text-emerald-300'}">${formatNumWithCommas(totalRow[1])}</td>
        <td class="py-3 px-3 text-right font-mono text-slate-300">${formatNumWithCommas(totalRow[2])}</td>
        <td class="py-3 px-3 text-right font-mono text-sm font-black ${isNegCtrlTot ? 'text-rose-400' : 'text-indigo-300'}">${formatNumWithCommas(totalRow[3])}</td>
      </tr>
    `;
  }
}

/**
 * 💡 2. Trigger Manual Spreadsheet Backup (EMAIL REPORT + DIRECT EXCEL DOWNLOAD)
 */
async function triggerManualBackup() {
  if (!confirm("goldeneduprivateschool@gmail.com သို့ အီးမေးလ် အစီရင်ခံစာ ပေးပို့၍ အလိုအလျောက် Excel (.xlsx) Backup ဖိုင် ဒေါင်းလုဒ် ရယူရန် သေချာပါသလား။")) {
    return;
  }

  try {
    if (typeof toggleLoading === 'function') toggleLoading(true);
    const res = await callApi('triggerManualBackup', {});

    if (res && res.success) {
      if (typeof showToast === 'function') {
        showToast("SUCCESS", res.message || "Manual Backup အောင်မြင်စွာ ဆောင်ရွက်ပြီးပါပြီ။");
      }

      // Direct Excel (.xlsx) file download trigger on browser
      const downloadUrl = res.backupUrl || res.downloadUrl;
      if (downloadUrl) {
        window.open(downloadUrl, '_blank');
      }
    } else {
      throw new Error(res?.message || "Backup ဆောင်ရွက်ခြင်း မအောင်မြင်ပါ။");
    }
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast("ERROR", err.message);
    } else {
      alert("အမှားအယွင်း: " + err.message);
    }
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

/**
 * 💡 3. Start Google Drive Backup & Safe Reset Workflow
 */
async function startDriveBackupAndResetWorkflow() {
  if (!confirm("Google Drive ထဲသို့ နှစ်အလိုက် ဖိုဒါဖြင့် Backup ဖိုင် ပွားယူ သိမ်းဆည်းရန် သေချာပါသလား။\n(Backup အောင်မြင်မှသာ ဖျက်လိုသော Sheet များကို ရွေးချယ်နိုင်ပါမည်)")) {
    return;
  }

  try {
    if (typeof toggleLoading === 'function') {
      toggleLoading(true, "Google Drive တွင် Backup Copy ကူးယူနေပါသည်။ ကျေးဇူးပြု၍ ခဏစောင့်ပါ...");
    }

    const res = await callApi('createDriveBackup', {});

    if (res && res.success) {
      if (typeof showToast === 'function') {
        showToast("SUCCESS", res.message || "Google Drive Backup အောင်မြင်ပါသည်။");
      }

      // Open High-Contrast Clean Reset Modal
      openDriveResetModal(res);
    } else {
      throw new Error(res?.message || "Google Drive Backup ကူးယူခြင်း မအောင်မြင်ပါ။");
    }
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast("ERROR", err.message);
    } else {
      alert("အမှားအယွင်း: " + err.message);
    }
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}

/**
 * 💡 HIGH-CONTRAST TIDY MODAL RENDERER
 */
function renderDriveResetModalContent(resData = {}) {
  const container = document.getElementById('drive-reset-modal') || document.getElementById('reset-modal');
  if (!container) return;

  const folderTitle = resData.fyFolderName || "FY 2026-2027 CASH BOOK DATA";
  const fileTitle = resData.backupFileName || "";

  // Update or inject Status Banner
  const statusMsg = document.getElementById('drive-backup-status-msg');
  if (statusMsg) {
    statusMsg.className = "p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl space-y-1 mb-4 shadow-lg shadow-emerald-500/5";
    statusMsg.innerHTML = `
      <div class="flex items-center gap-2 font-black text-emerald-400 uppercase tracking-wider text-xs">
        <i class="fa-solid fa-circle-check text-sm"></i> Backup Confirmed & Secured!
      </div>
      <div class="text-slate-200 font-bold text-xs flex flex-wrap items-center gap-2 pt-1">
        <span class="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5">
          <i class="fa-solid fa-folder-closed text-amber-400"></i> ${escapeHtml(folderTitle)}
        </span>
        ${fileTitle ? `<span class="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-1 rounded-lg font-mono flex items-center gap-1.5"><i class="fa-solid fa-file-csv text-indigo-400"></i> ${escapeHtml(fileTitle)}</span>` : ''}
      </div>
    `;
  }

  // Schema for Main & Cashier Sheets
  const mainSheets = [
    { id: 'Bank', name: 'BANK (Main Bank Book)', icon: 'fa-building-columns text-amber-400' },
    { id: 'Cash', name: 'CASH (Main Cash Book)', icon: 'fa-money-bill-wave text-emerald-400' },
    { id: 'Office', name: 'OFFICE (Office Exp Book)', icon: 'fa-briefcase text-cyan-400' },
    { id: 'Kitchen', name: 'KITCHEN (Kitchen Exp Book)', icon: 'fa-utensils text-rose-400' },
    { id: 'Payroll', name: 'PAYROLL (HR Payroll Exp)', icon: 'fa-money-check-dollar text-teal-400' },
    { id: 'Income', name: 'INCOME (Main Income Book)', icon: 'fa-wallet text-sky-400' },
    { id: 'Student', name: 'STUDENT (Student List)', icon: 'fa-user-graduate text-indigo-400' }
  ];

  const cashierSheets = [
    { id: 'CABank', name: 'CABANK (Cashier Bank)', icon: 'fa-building-columns text-amber-300' },
    { id: 'CACash', name: 'CACASH (Cashier Cash)', icon: 'fa-cash-register text-emerald-300' },
    { id: 'CAOffice', name: 'CAOFFICE (Cashier Office)', icon: 'fa-briefcase text-cyan-300' },
    { id: 'CAKitchen', name: 'CAKITCHEN (Cashier Kitchen)', icon: 'fa-utensils text-rose-300' },
    { id: 'CAPayroll', name: 'CAPAYROLL (Cashier Payroll)', icon: 'fa-purple-400 fa-money-check-dollar text-purple-300' }
  ];

  // Render Grid Sheets Selection if container exists
  const sheetsBox = document.getElementById('drive-reset-sheets-box') || document.getElementById('reset-sheets-container');
  if (sheetsBox) {
    sheetsBox.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- MAIN BOOKS -->
        <div class="bg-[#0e172a] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-book"></i> MAIN CASH BOOK SHEETS
            </span>
            <button type="button" onclick="toggleGroupCheckboxes('main', true)" class="text-[10px] font-bold text-slate-400 hover:text-white underline">Select All</button>
          </div>
          <div class="space-y-1.5">
            ${mainSheets.map(s => `
              <label class="flex items-center justify-between p-2 bg-[#090d16] hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 rounded-lg cursor-pointer transition group">
                <div class="flex items-center gap-2.5">
                  <i class="fa-solid ${s.icon} text-xs w-4 text-center"></i>
                  <span class="font-extrabold text-slate-100 group-hover:text-white text-xs tracking-wide">${s.name}</span>
                </div>
                <input type="checkbox" value="${s.id}" checked class="sheet-reset-cb cb-main w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer">
              </label>
            `).join('')}
          </div>
        </div>

        <!-- CASHIER BOOKS -->
        <div class="bg-[#0e172a] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <i class="fa-solid fa-cash-register"></i> CASHIER SUB-LEDGER SHEETS
            </span>
            <button type="button" onclick="toggleGroupCheckboxes('cashier', true)" class="text-[10px] font-bold text-slate-400 hover:text-white underline">Select All</button>
          </div>
          <div class="space-y-1.5">
            ${cashierSheets.map(s => `
              <label class="flex items-center justify-between p-2 bg-[#090d16] hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 rounded-lg cursor-pointer transition group">
                <div class="flex items-center gap-2.5">
                  <i class="fa-solid ${s.icon} text-xs w-4 text-center"></i>
                  <span class="font-extrabold text-slate-100 group-hover:text-white text-xs tracking-wide">${s.name}</span>
                </div>
                <input type="checkbox" value="${s.id}" checked class="sheet-reset-cb cb-cashier w-5 h-5 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer">
              </label>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }
}

/**
 * 💡 Modal Controls for Drive Reset Workflow
 */
function openDriveResetModal(resData = {}) {
  renderDriveResetModalContent(resData);
  const modal = document.getElementById('drive-reset-modal') || document.getElementById('reset-modal');
  if (modal) {
    modal.classList.remove('hidden');
    toggleGroupCheckboxes('main', true);
    toggleGroupCheckboxes('cashier', true);
  }
}

function closeDriveResetModal() {
  const modal = document.getElementById('drive-reset-modal') || document.getElementById('reset-modal');
  if (modal) modal.classList.add('hidden');
}

function toggleGroupCheckboxes(groupType, isChecked) {
  const selector = groupType === 'main' ? '.cb-main' : '.cb-cashier';
  document.querySelectorAll(selector).forEach(cb => {
    cb.checked = isChecked;
  });
}

/**
 * 💡 Confirm and Execute Sheet Reset (Clear Rows 6+)
 */
async function confirmAndExecuteSheetReset() {
  const selectedCbs = document.querySelectorAll('.sheet-reset-cb:checked');
  const selectedSheets = Array.from(selectedCbs).map(cb => cb.value);

  if (selectedSheets.length === 0) {
    alert("ကျေးဇူးပြု၍ ဒေတာ ရှင်းလင်းရန် အနည်းဆုံး Sheet တစ်ခု ရွေးချယ်ပေးပါ (Main Cash Book သို့မဟုတ် Cashier Cash Book)။");
    return;
  }

  const confirmMsg = `သေချာပါသလား။ ရွေးချယ်ထားသော Sheet (${selectedSheets.join(', ')}) များ၏ Row 6 အောက်ပိုင်း ဒေတာများကို ရှင်းလင်းပစ်ပါမည်။\n\n* (Google Drive ထဲတွင် Backup ကူးယူပြီးပါပြီ။ Row 1-5 ၏ Formula များ လုံးဝ ထိခိုက်မည်မဟုတ်ပါ)`;

  if (!confirm(confirmMsg)) {
    return;
  }

  try {
    if (typeof toggleLoading === 'function') {
      toggleLoading(true, "ရွေးချယ်ထားသော Sheet ဒေတာများကို Row 6 မှ စတင် ရှင်းလင်းနေပါသည်...");
    }

    const res = await callApi('executeSafeSheetReset', { sheetsToClear: selectedSheets });

    if (res && res.success) {
      closeDriveResetModal();

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: 'success',
          title: 'ဒေတာ ရှင်းလင်းခြင်း အောင်မြင်ပါသည်',
          text: res.message || 'ရွေးချယ်ထားသော Sheet များ၏ ဒေတာများကို Row 6 မှ စ၍ အောင်မြင်စွာ ရှင်းလင်းပြီးပါပြီ။',
          confirmButtonColor: '#7e22ce'
        });
      } else if (typeof showToast === 'function') {
        showToast("SUCCESS", res.message || "Sheet ဒေတာများ အောင်မြင်စွာ ရှင်းလင်းပြီးပါပြီ။");
      } else {
        alert(res.message || "Sheet ဒေတာများ အောင်မြင်စွာ ရှင်းလင်းပြီးပါပြီ။");
      }

      // Reload settings balances
      loadSettingsData(true);
    } else {
      throw new Error(res?.message || "Sheet ဒေတာ ရှင်းလင်းခြင်း မအောင်မြင်ပါ။");
    }
  } catch (err) {
    if (typeof showToast === 'function') {
      showToast("ERROR", err.message);
    } else {
      alert("အမှားအယွင်း: " + err.message);
    }
  } finally {
    if (typeof toggleLoading === 'function') toggleLoading(false);
  }
}
