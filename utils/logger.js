/**
 * GOLDEN ERP SYSTEM - AUDIT TRAIL & SYSTEM LOGGER ENGINE 
 * File: utils/logger.js
 * 💡 Serverless Audit Trail Logging to Google Sheets ('AuditLogs' Sheet) & Cloudflare Worker Console
 * 🛠️ SECURED (Phase 3): Flexible Parameter Resolver, Fail-Safe Logging & Audit Trail Persistence
 */

import { appendSheetValues } from '../google.js';

/**
 * 💡 WRITE AUDIT TRAIL LOG TO GOOGLE SHEETS
 * မည်သူက မည်သည့်အချိန်တွင် မည်သည့် စာရင်းကို ဖျက်/ပြင်/သွင်း သွားသည်ဟူသော သမိုင်းကြောင်းအား AuditLogs Sheet တွင် မှတ်တမ်းတင်ခြင်း
 * 
 * @param {string} spreadsheetId 
 * @param {string} accessToken 
 * @param {object|string} sessionOrUser - User session object or username string
 * @param {string} actionType - CREATE | UPDATE | DELETE | EOY_RESET | LOGIN | BACKUP | action name
 * @param {object|string} moduleOrPayload - Module name string OR Request payload object
 * @param {string|number} recordIdInput - Record ID if available
 * @param {object|string} extraDetails - Extra details if available
 */
export async function writeAuditLog(spreadsheetId, accessToken, sessionOrUser, actionType, moduleOrPayload = {}, recordIdInput = null, extraDetails = {}) {
  try {
    const timestamp = new Date().toISOString();
    
    // 💡 1. Username & Role Resolver
    let username = "System";
    let role = "User";
    if (typeof sessionOrUser === "string") {
      username = sessionOrUser;
      role = "User";
    } else if (sessionOrUser && typeof sessionOrUser === "object") {
      username = sessionOrUser.username || sessionOrUser.user || "System";
      role = sessionOrUser.role || "User";
    }

    let moduleName = "General";
    let recordId = recordIdInput || "-";
    let detailsObj = extraDetails;

    // 💡 2. Flexible Payload / Module Resolver (Handles direct payload passing from worker.js)
    if (moduleOrPayload && typeof moduleOrPayload === "object") {
      detailsObj = moduleOrPayload;
      moduleName = moduleOrPayload.bookName || moduleOrPayload.category || moduleOrPayload.action || actionType || "General";
      if (!recordIdInput) {
        recordId = moduleOrPayload.uniqueId || moduleOrPayload.id || moduleOrPayload.staffId || moduleOrPayload.studentId || "-";
      }
    } else if (typeof moduleOrPayload === "string") {
      moduleName = moduleOrPayload;
    }

    const detailsJson = typeof detailsObj === "object" ? JSON.stringify(detailsObj) : String(detailsObj || "");

    const logRow = [
      timestamp,
      username,
      role,
      actionType || "ACTION",
      moduleName,
      recordId,
      detailsJson
    ];

    // 💡 Append 7-Column Audit Log Row to 'AuditLogs!A2:G' in Google Sheets
    await appendSheetValues(spreadsheetId, accessToken, "AuditLogs!A2:G", [logRow]);
  } catch (err) {
    // Audit logging ပြုလုပ်ရာတွင် အမှားဖြစ်ခဲ့ပါက မူလ စာရင်းသွင်းမှု လုပ်ငန်းစဉ်အား မထိခိုက်စေရန် Fail-Safe ထိန်းသိမ်းခြင်း
    console.warn("[AuditLog Warning] Failed to persist audit log to Google Sheets:", err.message);
  }
}

/**
 * 💡 CONSOLE REQUEST LOGGER FOR CLOUDFLARE WORKERS
 */
export function logRequest(action, userSession, extraInfo = {}) {
  const time = new Date().toISOString();
  const user = userSession?.username || "Public/Anon";
  const role = userSession?.role || "None";
  console.log(`[REQ ${time}] Action: '${action}' | User: ${user} (${role})`, extraInfo);
}

/**
 * 💡 CONSOLE ERROR LOGGER FOR CLOUDFLARE WORKERS
 */
export function logError(action, error, userSession) {
  const time = new Date().toISOString();
  const user = userSession?.username || "Unknown";
  console.error(`[ERR ${time}] Action: '${action}' | User: ${user} | Message: ${error?.message || error}`, error?.stack || "");
}
