/**
 * GOLDEN ERP SYSTEM - SYSTEM SETTINGS CONTROLLER
 * File: js/settings.js (CLEANED - EOY PURGED)
 */

/**
 * 💡 Trigger Manual Spreadsheet Backup (EMAIL + DIRECT EXCEL DOWNLOAD)
 */
async function triggerManualBackup() {
  if (!confirm("goldeneduprivateschool@gmail.com သို့ အီးမေးလ် ပေးပို့ပြီး စက်ထဲသို့ Excel (.xlsx) ဖိုင် ဒေါင်းလုဒ် ရယူရန် သေချာပါသလားရှင်။")) {
    return;
  }

  try {
    toggleLoading(true);
    const res = await callApi('triggerManualBackup', {});

    if (res && res.success) {
      showToast("SUCCESS", res.message || "Manual Backup အောင်မြင်စွာ ပြုလုပ်ပြီးပါပြီရှင်။");

      // Direct Excel (.xlsx) file download on browser
      if (res.backupUrl) {
        window.open(res.backupUrl, '_blank');
      }
    } else {
      throw new Error(res?.message || "Backup ပြုလုပ်ခြင်း မအောင်မြင်ပါ။");
    }
  } catch (err) {
    showToast("ERROR", err.message);
  } finally {
    toggleLoading(false);
  }
}
