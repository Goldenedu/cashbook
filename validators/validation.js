/**
 * GOLDEN ERP SYSTEM - INPUT VALIDATION & SANITIZATION ENGINE
 * File: validators/validation.js
 */

/**
 * 💡 Validate ISO Date Format (YYYY-MM-DD)
 */
export function validateDateStr(dateStr, fieldName = "Date") {
  if (!dateStr || typeof dateStr !== "string") {
    return { valid: false, message: `${fieldName} ဖြည့်သွင်းရန် လိုအပ်ပါသည်။` };
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr.trim())) {
    return { valid: false, message: `${fieldName} ၏ ပုံစံမှာ YYYY-MM-DD ဖြစ်ရပါမည်။ (ဥပမာ - 2026-07-24)` };
  }

  const d = new Date(dateStr.trim());
  if (isNaN(d.getTime())) {
    return { valid: false, message: `မမှန်ကန်သော ${fieldName} ဖြစ်နေပါသည်။` };
  }

  return { valid: true };
}

/**
 * 💡 Validate Currency / Numeric Amount
 */
export function validateAmount(val, fieldName = "Amount", allowNegative = false) {
  if (val === undefined || val === null || val === "") {
    return { valid: true, value: 0 };
  }

  const num = Number(val);
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} တွင် ဂဏန်းသန့်သန့်သာ ရေးသွင်းရပါမည်။` };
  }

  if (!allowNegative && num < 0) {
    return { valid: false, message: `${fieldName} သည် ၀ ထက် ငယ်၍ မရပါရှင်။` };
  }

  return { valid: true, value: Math.round(num) };
}

/**
 * 💡 Validate Required Text Input
 */
export function validateRequiredText(str, fieldName = "Field", minLen = 1, maxLen = 250) {
  const cleanStr = String(str || "").trim();

  if (!cleanStr || cleanStr.length < minLen) {
    return { valid: false, message: `${fieldName} ဖြည့်သွင်းရန် လိုအပ်ပါသည်။` };
  }

  if (cleanStr.length > maxLen) {
    return { valid: false, message: `${fieldName} သည် စာလုံးရေ ${maxLen} လုံးထက် မကျော်ရပါရှင်။` };
  }

  return { valid: true, cleanValue: cleanStr };
}

/**
 * 💡 Validate Ledger Entry Body Payload
 */
export function validateLedgerPayload(body) {
  const dateCheck = validateDateStr(body.date, "Transaction Date");
  if (!dateCheck.valid) return dateCheck;

  const descCheck = validateRequiredText(body.description, "Description", 2, 500);
  if (!descCheck.valid) return descCheck;

  const debitCheck = validateAmount(body.debit, "Debit Amount");
  if (!debitCheck.valid) return debitCheck;

  const creditCheck = validateAmount(body.credit, "Credit Amount");
  if (!creditCheck.valid) return creditCheck;

  return { valid: true };
}

/**
 * 💡 Validate Student Profile Body Payload
 */
export function validateStudentPayload(body) {
  const nameCheck = validateRequiredText(body.name, "Student Name", 2, 100);
  if (!nameCheck.valid) return nameCheck;

  const classCheck = validateRequiredText(body.class, "Class Name", 1, 50);
  if (!classCheck.valid) return classCheck;

  return { valid: true };
}

/**
 * 💡 Validate Staff Profile Body Payload
 */
export function validateStaffPayload(body) {
  const nameCheck = validateRequiredText(body.name, "Staff Name", 2, 100);
  if (!nameCheck.valid) return nameCheck;

  const joinDateCheck = validateDateStr(body.joinDate, "Join Date");
  if (!joinDateCheck.valid) return joinDateCheck;

  return { valid: true };
}
