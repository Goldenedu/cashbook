/**
 * GOLDEN ERP SYSTEM - INPUT VALIDATION & SANITIZATION ENGINE
 * File: validators/validation.js
 * 💡 Serverless Input Validation, Formula Injection Sanitizer & Formal Error Handling Engine
 */

/**
 * 💡 SANITIZE FORMULA INJECTION ATTACKS FOR GOOGLE SHEETS
 * Escapes characters (=, +, -, @) to prevent formula execution exploits in Google Sheets
 * 
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeFormulaInput(str) {
  if (typeof str !== 'string') return str;
  const trimmed = str.trim();
  if (/^[=+\-@\t\r]/.test(trimmed)) {
    return `'${trimmed}`;
  }
  return trimmed;
}

/**
 * 💡 Validate ISO Date Format (YYYY-MM-DD)
 * 
 * @param {string} dateStr 
 * @param {string} fieldName 
 * @returns {object} { valid: boolean, message?: string }
 */
export function validateDateStr(dateStr, fieldName = "Date") {
  if (!dateStr || typeof dateStr !== "string") {
    return { valid: false, message: `${fieldName} ဖြည့်သွင်းရန် လိုအပ်ပါသည်။` };
  }

  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr.trim())) {
    return { valid: false, message: `${fieldName} ၏ ပုံစံမှာ YYYY-MM-DD ဖြစ်ရပါမည်။ (ဥပမာ - 2026-07-26)` };
  }

  const d = new Date(dateStr.trim());
  if (isNaN(d.getTime())) {
    return { valid: false, message: `မမှန်ကန်သော ${fieldName} ဖြစ်နေပါသည်။` };
  }

  return { valid: true };
}

/**
 * 💡 Validate Currency / Numeric Amount
 * 
 * @param {any} val 
 * @param {string} fieldName 
 * @param {boolean} allowNegative 
 * @returns {object} { valid: boolean, value?: number, message?: string }
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
    return { valid: false, message: `${fieldName} သည် ၀ ထက် ငယ်၍ မရပါ။` };
  }

  return { valid: true, value: Number(num.toFixed(2)) };
}

/**
 * 💡 Validate Required Text Input with Length & Formula Injection Sanitization
 * 
 * @param {string} str 
 * @param {string} fieldName 
 * @param {number} minLen 
 * @param {number} maxLen 
 * @returns {object} { valid: boolean, cleanValue?: string, message?: string }
 */
export function validateRequiredText(str, fieldName = "Field", minLen = 1, maxLen = 500) {
  const cleanStr = String(str || "").trim();

  if (!cleanStr || cleanStr.length < minLen) {
    return { valid: false, message: `${fieldName} ဖြည့်သွင်းရန် လိုအပ်ပါသည်။` };
  }

  if (cleanStr.length > maxLen) {
    return { valid: false, message: `${fieldName} သည် စာလုံးရေ ${maxLen} လုံးထက် မကျော်လွန်ရပါ။` };
  }

  const safeValue = sanitizeFormulaInput(cleanStr);
  return { valid: true, cleanValue: safeValue };
}

/**
 * 💡 Validate Ledger Entry Body Payload (Bank, Cash, Office, Kitchen, HR)
 */
export function validateLedgerPayload(body = {}) {
  const dateCheck = validateDateStr(body.date, "Transaction Date");
  if (!dateCheck.valid) return dateCheck;

  const descCheck = validateRequiredText(body.description, "Description", 2, 500);
  if (!descCheck.valid) return descCheck;

  const debitCheck = validateAmount(body.debit, "Debit Amount", true);
  if (!debitCheck.valid) return debitCheck;

  const creditCheck = validateAmount(body.credit, "Credit Amount", true);
  if (!creditCheck.valid) return creditCheck;

  return { valid: true };
}

/**
 * 💡 Validate Student Profile Body Payload
 */
export function validateStudentPayload(body = {}) {
  const nameCheck = validateRequiredText(body.name, "Student Name", 2, 150);
  if (!nameCheck.valid) return nameCheck;

  const classCheck = validateRequiredText(body.class, "Class Name", 1, 50);
  if (!classCheck.valid) return classCheck;

  return { valid: true };
}

/**
 * 💡 Validate Staff Profile Body Payload
 */
export function validateStaffPayload(body = {}) {
  const nameCheck = validateRequiredText(body.name, "Staff Name", 2, 150);
  if (!nameCheck.valid) return nameCheck;

  const joinDateCheck = validateDateStr(body.joinDate, "Join Date");
  if (!joinDateCheck.valid) return joinDateCheck;

  return { valid: true };
}
