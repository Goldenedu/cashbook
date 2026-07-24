/**
 * GOLDEN ERP SYSTEM - SYSTEM SETTINGS & EOY RESET CONTROLLER
 * File: js/settings.js
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

      // 💡 1. စက်ထဲသို့ Excel (.xlsx) ဖိုင် တိုက်ရိုက် ဒေါင်းလုဒ် ဆွဲပေးခြင်း
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
 * 💡 Safe Trigger End of Year (EOY) Fiscal Reset
 */
async function triggerEOYReset() {
  const userRole = localStorage.getItem('golden_user_role');
  if (!["Owner", "Admin"].includes(userRole)) {
    showToast("ERROR", "Forbidden: EOY Reset ကို Owner နှင့် Admin သာ ပြုလုပ်ခွင့်ရှိပါသည်ရှင်။");
    return;
  }

  const confirm1 = confirm("⚠️ သတိပေးချက်- ဘဏ္ဍာရေးနှစ်သစ် စာရင်းဖွင့်လှစ်ရန် သေချာပါသလားရှင်။\n\n(ယခင်နှစ် စာရင်းဟောင်းများကို goldeneduprivateschool@gmail.com သို့ အီးမေးလ်ဖြင့် အလိုအလျောက် Backup ပို့ပေးမည်ဖြစ်ပြီး၊ ဘဏ်နှင့် ငွေသား စတင်လက်ကျန်ငွေများကို အလိုအလျောက် သယ်ဆောင်ပေးပါမည်။)");
  if (!confirm1) return;

  const promptText = prompt("အတည်ပြုရန်အတွက် 'RESET' ဟု စာလုံးကြီးဖြင့် ရိုက်ထည့်ပေးပါရှင် -");
  if (promptText !== "RESET") {
    showToast("ERROR", "အတည်ပြုချက် စာလုံး မမှန်ကန်သဖြင့် EOY Reset ကို ရပ်တန့်လိုက်ပါသည်ရှင်။");
    return;
  }

  try {
    toggleLoading(true);
    const res = await callApi('triggerEOYReset', {});

    if (res && res.success) {
      showToast("SUCCESS", res.message);
      alert(`🎉 EOY Reset အောင်မြင်ပါပြီရှင်!\n\ngoldeneduprivateschool@gmail.com သို့ အီးမေးလ် ပေးပို့ခဲ့ပါသည်ရှင်။\nBank Opening: ${Number(res.bankOpeningBalance || 0).toLocaleString('en-US')} MMK\nCash Opening: ${Number(res.cashOpeningBalance || 0).toLocaleString('en-US')} MMK`);
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
