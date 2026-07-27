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

      // Update backup status text inside modal
      const statusMsg = document.getElementById('drive-backup-status-msg');
      if (statusMsg) {
        statusMsg.innerHTML = `<strong>ဖိုင်အမည်:</strong> ${escapeHtml(res.backupFileName)}<br><strong>ဖိုဒါအမည်:</strong> ${escapeHtml(res.fyFolderName)}`;
      }

      // Open Sheet Reset Selection Modal
      openDriveResetModal();
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
 * 💡 Modal Controls for Drive Reset Workflow
 */
function openDriveResetModal() {
  const modal = document.getElementById('drive-reset-modal');
  if (modal) {
    modal.classList.remove('hidden');
    // Check all checkboxes by default
    toggleGroupCheckboxes('main', true);
    toggleGroupCheckboxes('cashier', true);
  }
}

function closeDriveResetModal() {
  const modal = document.getElementById('drive-reset-modal');
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
