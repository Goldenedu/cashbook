/**
 * GOLDEN ERP SYSTEM - SYSTEM SETTINGS & CONTROL PANEL
 * File: js/settings.js
 */

/**
 * 💡 Trigger Manual Excel Backup Email
 */
async function triggerManualBackup() {
  if (confirm("လက်ရှိ ERP Spreadsheet တစ်ခုလုံးအား Excel (.xlsx) အဖြစ် goldeneduprivateschool@gmail.com သို့ ချက်ချင်း ပို့ဆောင်ရန် အတည်ပြုပါသလားရှင်?")) {
    showToast("SUCCESS", "Excel Backup ဖိုင် တည်ဆောက်နေပါသည်...");
    toggleLoading(true);

    try {
      const response = await callApi('runSpreadsheetBackupEmail', {});
      toggleLoading(false);

      if (response && response.success) {
        showToast("SUCCESS", response.message || "Backup ဖိုင်အား အီးမေးလ်သို့ ပို့ဆောင်ပြီးပါပြီရှင်။");
      } else {
        showToast("ERROR", "မအောင်မြင်ပါ: " + (response ? response.message : ""));
      }
    } catch (err) {
      toggleLoading(false);
      showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
    }
  }
}

/**
 * 💡 Trigger Monthly Staff Payslips Dispatch
 */
async function triggerSendPayslips() {
  if (confirm("ဝန်ထမ်းများအားလုံးထံသို့ ယခုလအတွက် လစာရှင်းတမ်း (Payslip) များ ပေးပို့ပါမည်။\n\n(ပို့ပြီးသားသူများနှင့် အီးမေးလ်မရှိသူများကို စနစ်က အလိုအလျောက် ကျော်သွားမည် ဖြစ်ပါသည်)။")) {
    showToast("SUCCESS", "လစာရှင်းတမ်းများကို စိစစ်ပေးပို့နေပါသည်...");
    toggleLoading(true);

    try {
      const response = await callApi('sendMonthlyPayslipsToStaff', {});
      toggleLoading(false);

      if (response && response.success) {
        showToast("SUCCESS", response.message || "Payslips ပေးပို့မှု ပြီးစီးပါပြီရှင်။");
      } else {
        showToast("ERROR", "မအောင်မြင်ပါ: " + (response ? response.message : ""));
      }
    } catch (err) {
      toggleLoading(false);
      showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
    }
  }
}

/**
 * 💡 Trigger EOY Fiscal Year Reset (Admin Only - 3 Steps Confirmation)
 */
async function triggerEOYReset() {
  if (window.AppState.currentUserRole !== "Admin") {
    alert("လုပ်ပိုင်ခွင့် မရှိပါ။ ဤလုပ်ငန်းစဉ်အား Admin သာ လုပ်ဆောင်နိုင်ပါသည်။");
    return;
  }

  // Step 1 Confirmation
  if (!confirm("ပညာသင်နှစ်ကုန်ဆုံး၍ စာရင်းသစ်ဖွင့်လှစ်ခြင်း (EOY Process) ကို အမှန်တကယ် လုပ်ဆောင်လိုပါသလားရှင်?")) return;

  // Step 2 Confirmation
  if (!confirm("စနစ်သည် လက်ရှိ FY Spreadsheet ကို Google Drive ထဲသို့ အရင် Backup ပွားယူမည်ဖြစ်ပြီး၊ ထို့နောက် စာရင်းဟောင်းများကို ရှင်းလင်းပါမည်။ သေချာပါသလားရှင်?")) return;

  // Step 3 Final Confirmation
  if (!confirm("⚠️ သတိပေးချက်- ဤလုပ်ငန်းစဉ်သည် ယခင်နှစ် ဒေတာဟောင်းများကို ရှင်းလင်းပြီး Opening စာရင်းသစ် ဖွင့်လှစ်မည်ဖြစ်ပါသည်။ သေချာပေါက် ဆက်လက်လုပ်ဆောင်လိုပါသလားရှင်?")) return;

  showToast("SUCCESS", "အရန်သင့် သိမ်းဆည်းခြင်းနှင့် စာရင်းသစ်ဖွင့်ခြင်းများ ဆောင်ရွက်နေပါသည်...");
  toggleLoading(true);

  try {
    const response = await callApi('runEOYFiscalYearReset', {});
    toggleLoading(false);

    if (response && response.success) {
      showToast("SUCCESS", response.message || "ဘဏ္ဍာရေးနှစ်သစ် ကူးပြောင်းခြင်း အောင်မြင်စွာ ပြီးစီးပါပြီရှင်။");
      
      // Reload Dashboard
      if (typeof loadDashboardData === 'function') {
        loadDashboardData(true, true);
      }
    } else {
      showToast("ERROR", "မအောင်မြင်ပါ: " + (response ? response.message : ""));
    }
  } catch (err) {
    toggleLoading(false);
    showToast("ERROR", "ဆာဗာချိတ်ဆက်မှု အမှား- " + err.message);
  }
}