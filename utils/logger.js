/**
 * GOLDEN ERP SYSTEM - AUDIT TRAIL & SYSTEM LOGGER ENGINE
 * File: utils/logger.js
 */

import { appendSheetValues } from '../google.js';

/**
 * 💡 WRITE AUDIT TRAIL LOG TO GOOGLE SHEETS
 * မည်သူက မည်သည့်အချိန်တွင် မည်သည့် စာရင်းကို ဖျက်/ပြင် သွားသည်ဟူသော သမိုင်းကြောင်းအား AuditLogs Sheet တွင် မှတ်တမ်းတင်ခြင်း
 */
export async function writeAuditLog(spreadsheetId, accessToken, session, actionType, moduleName, recordId, details = {}) {
  try {
    const timestamp = new Date().toISOString();
    const username = session?.username || "System";
    const role = session?.role || "Unknown";
    const detailsJson = typeof details === "object" ? JSON.stringify(details) : String(details);

    const logRow = [
      timestamp,
      username,
      role,
      actionType, // CREATE, UPDATE, DELETE, EOY_RESET, LOGIN
      moduleName, // Income Book, Office Exp Book, Student Directory, etc.
      recordId || "-",
      detailsJson
    ];

    // Append log to 'AuditLogs' sheet in Google Sheets asynchronously
    await appendSheetValues(spreadsheetId, accessToken, "AuditLogs!A2:G", logRow);
  } catch (err) {
    // Audit logging ပြုလုပ်ရာတွင် အမှားဖြစ်ခဲ့ပါက မူလ စာရင်းသွင်းမှု လုပ်ငန်းစဉ်အား မထိခိုက်စေရန် Fail-Safe ထိန်းသိမ်းခြင်း
    console.warn("[AuditLog Warning] Failed to persist audit log:", err.message);
  }
}

/**
 * 💡 CONSOLE REQUEST LOGGER FOR CLOUDFLARE WORKERS
 */
export function logRequest(action, userSession, extraInfo = {}) {
  const time = new Date().toLocaleTimeString();
  const user = userSession?.username || "Public/Anon";
  const role = userSession?.role || "None";
  console.log(`[REQ ${time}] Action: '${action}' | User: ${user} (${role})`, extraInfo);
}

/**
 * 💡 CONSOLE ERROR LOGGER FOR CLOUDFLARE WORKERS
 */
export function logError(action, error, userSession) {
  const time = new Date().toLocaleTimeString();
  const user = userSession?.username || "Unknown";
  console.error(`[ERR ${time}] Action: '${action}' | User: ${user} | Message: ${error?.message || error}`, error?.stack || "");
}
