/**
 * GOLDEN ERP SYSTEM - SYSTEM SETTINGS & EOY RESET CONTROLLER
 * File: js/settings.js (DUAL-MODE RESET CONTROLLER)
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

      // 💡 Direct Excel file download on browser
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

/**
 * 💡 Open EOY Dual-Mode Reset Modal
 */
function openEOYModal() {
  const userRole = localStorage.getItem('golden_user_role');
  if (!["Owner", "Admin"].includes(userRole)) {
    showToast("ERROR", "Forbidden: EOY Reset ကို Owner နှင့် Admin သာ ပြုလုပ်ခွင့်ရှိပါသည်ရှင်။");
    return;
  }

  const modal = document.getElementById('eoy-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

/**
 * 💡 Close EOY Dual-Mode Reset Modal
 */
function closeEOYModal() {
  const modal = document.getElementById('eoy-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

/**
 * 💡 Confirm and Execute EOY Fiscal Reset with Selected Mode
 */
async function confirmEOYResetModal() {
  const userRole = localStorage.getItem('golden_user_role');
  if (!["Owner", "Admin"].includes(userRole)) {
    showToast("ERROR", "Forbidden: EOY Reset ကို Owner နှင့် Admin သာ ပြုလုပ်ခွင့်ရှိပါသည်ရှင်။");
    closeEOYModal();
    return;
  }

  // Read Selected Reset Mode from Radio Inputs
  const selectedRadio = document.querySelector('input[name="eoy-reset-mode"]:checked');
  const resetMode = selectedRadio ? selectedRadio.value : "ANNUAL_FY";

  const modeLabelMap = {
    'ANNUAL_FY': '၁။ နှစ်ပတ်လည် ဘဏ္ဍာရေးနှစ်အလိုက် (Annual Fiscal Reset)',
    'ADHOC_CUTOFF': '၂။ ယနေ့ ရက်စွဲဖြင့် စာရင်းဖြတ်တောက် (Ad-hoc Cut-off Reset)'
  };

  const selectedModeLabel = modeLabelMap[resetMode] || 'Annual Fiscal Reset';

  closeEOYModal();

  // Double Confirmation Prompt (မှားယွင်းနှိပ်မိခြင်းမှ ကာကွယ်ရန်)
  const confirmText = prompt(`⚠️ သတိပေးချက်- အောက်ပါ ရွေးချယ်မှုဖြင့် စာရင်း ပိတ်သိမ်းရန် သေချာပါသလားရှင်။\n\n📌 ရွေးချယ်မှု: ${selectedModeLabel}\n\nအတည်ပြုပါက 'RESET' ဟု စာလုံးကြီးဖြင့် ရိုက်ထည့်ပေးပါရှင် -`);

  if (confirmText !== "RESET") {
    showToast("ERROR", "အတည်ပြုချက် စာလုံး မမှန်ကန်သဖြင့် စာရင်းပိတ်သိမ်းမှုကို ရပ်တန့်လိုက်ပါသည်ရှင်။");
    return;
  }

  try {
    toggleLoading(true);

    const res = await callApi('triggerEOYReset', { resetMode: resetMode });

    if (res && res.success) {
      showToast("SUCCESS", res.message || "EOY Reset အောင်မြင်စွာ ပြီးမြောက်ပါပြီရှင်။");

      const bankOpeningStr = Number(res.bankOpeningBalance || 0).toLocaleString('en-US');
      const cashOpeningStr = Number(res.cashOpeningBalance || 0).toLocaleString('en-US');
      const officeOpeningStr = Number(res.officeOpeningBalance || 0).toLocaleString('en-US');

      alert(`🎉 EOY Reset အောင်မြင်ပါပြီရှင်!\n\n📌 ပိတ်သိမ်းမှု အမျိုးအစား: ${selectedModeLabel}\n\n📊 စတင်လက်ကျန်ငွေများ (Opening Balances):\n• Main Bank Book: ${bankOpeningStr} MMK\n• Main Cash Book: ${cashOpeningStr} MMK\n• Office Exp Book: ${officeOpeningStr} MMK\n\ngoldeneduprivateschool@gmail.com သို့ အရန်သိမ်းဆည်းမှု မဂ္ဂဇင်း ပေးပို့ခဲ့ပြီးပါပြီရှင်။`);

      location.reload();
    } else {
      throw new Error(res?.message || "EOY Reset မအောင်မြင်ပါ။");
    }
  } catch (err) {
    showToast("ERROR", err.message);
  } finally {
    toggleLoading(false);
  }
}
