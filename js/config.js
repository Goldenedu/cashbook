/**
 * GOLDEN ERP SYSTEM - GLOBAL CONFIGURATION & CONSTANTS
 * File: js/config.js
 * 💡 Direct 1-to-1 Conversion from 02_Config.gs (100% Complete)
 */

window.START_ROW = 6;

// ==========================================
// BOOK NAME MAPPING
// ==========================================
window.BOOK_MAP = {
  "Bank Book": "bank",
  "Cash Book": "cash",
  "Office Exp Book": "office",
  "Kitchen Exp Book": "kitchen",
  "HR Payroll Exp Book": "payroll",
  "Office Book": "office",
  "Kitchen Book": "kitchen",
  "Salary Book": "payroll",
  "office": "office",
  "kitchen": "kitchen",
  "payroll": "payroll"
};

// ==========================================
// MAGIC NUMBERS CONFIGURATION
// ==========================================
window.MAGIC_NUMBERS = {
  TRANSACTION_LOCK_DAYS: 7,           // ရှေးဟောင်း transactions များကို ပြင်ဆင်ခွင့်ပိတ်ရန် ရက်အရေအတွက်
  SESSION_EXPIRY_HOURS: 8,            // Session သက်တမ်း (နာရီ)
  DASHBOARD_CACHE_TTL_SECONDS: 180,   // Dashboard cache သက်တမ်း (စက္ကန့်) - 3 မိနစ်
  LOGIN_LOCK_TTL_SECONDS: 300,        // Login attempt lock သက်တမ်း (စက္ကန့်) - 5 မိနစ်
  AUDIT_LOG_MAX_ROWS: 5000,           // Audit log အများဆုံး မှတ်တမ်းအရေအတွက်
  PASSWORD_HASH_ITERATIONS: 1000,     // SHA-256 hash iterations
  LOCK_TIMEOUT_MS: 15000,             // LockService timeout (မီလီစက္ကန့်)
  PROMO_CACHE_TTL_SECONDS: 600        // Promotion cache သက်တမ်း (စက္ကန့်) - 10 မိနစ်
};

// ==========================================
// CORE CONFIG MAPS & SHEET HEADERS
// ==========================================
window.CONFIG = {
  API_URL: "https://cashbook-api.goldeneduprivateschool.workers.dev/",

  sheets: {
    bank: {
      bookName: "Bank Book",
      prefix: "BNK",
      sheetName: "Bank", 
      requiredHeaders: ["NO", "DATE", "CATEGORY", "DESCRIPTION", "METHOD", "DEBIT", "CREDIT", "BALANCES", "TRANSFER", "VR NO", "MY", "FY", "BOOK NAME", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    cash: {
      bookName: "Cash Book",
      prefix: "CAH",
      sheetName: "Cash", 
      requiredHeaders: ["NO", "DATE", "CATEGORY", "DESCRIPTION", "METHOD", "DEBIT", "CREDIT", "BALANCES", "TRANSFER", "VR NO", "MY", "FY", "BOOK NAME", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    kitchen: {
      bookName: "Kitchen Exp Book",
      prefix: "KIT",
      sheetName: "Kitchen", 
      requiredHeaders: ["NO", "DATE", "CATEGORY", "DESCRIPTION", "METHOD", "DEBIT", "CREDIT", "BALANCES", "TRANSFER", "VR NO", "MY", "FY", "BOOK NAME", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    office: {
      bookName: "Office Exp Book",
      prefix: "OFF",
      sheetName: "Office", 
      requiredHeaders: ["NO", "DATE", "CATEGORY", "ID PID", "DESCRIPTION", "UNIT", "UNIT PRICE", "METHOD", "DEBIT", "CREDIT", "BALANCES", "LIABILITIES", "TRANSFER", "VR NO", "MY", "FY", "BOOK NAME", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    payroll: {
      bookName: "HR Payroll Exp Book",
      prefix: "SAL",
      sheetName: "Payroll", 
      requiredHeaders: ["NO", "DATE", "CATEGORY", "ID PID", "DESCRIPTION", "METHOD", "DEBIT", "CREDIT", "BALANCES", "UNPAID BONUS", "UNPAID FUND", "TRANSFER", "VR NO", "MY", "FY", "BOOK NAME", "CREATED BY", "CREATED AT","SEND MAIL", "UNIQUEID"]
    },
    staffFullTime: {
      bookName: "Full Time Staff List",
      prefix: "FID",
      sheetName: "FullTime", 
      requiredHeaders: ["NO", "JOIN DATE", "CATEGORY", "STAFF ID", "NAME", "STAFF IDNAME", "EDUCATION", "POSITION", "SALARY GRADE", "WORKING DAYS", "BASIC AMT", "EXTRA AMT", "TOTAL SALARY", "BONUS", "FUND", "TOTAL NET AMT", "RESIGNED DATE", "STATUS", "GENDER", "NRC NO", "BANK ACCOUNT", "PHONE NO", "EMAIL", "FUND DATE", "UNPAID BONUS", "UNPAID FUND", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    staffPartTime: {
      bookName: "Part Time Staff List",
      prefix: "PID",
      sheetName: "PartTime", 
      requiredHeaders: ["NO", "JOIN DATE", "CATEGORY", "STAFF ID", "NAME", "STAFF IDNAME", "EDUCATION", "POSITION", "TOTAL SALARY", "TOTAL NET AMT", "RESIGNED DATE", "STATUS", "GENDER", "NRC NO", "BANK ACCOUNT", "PHONE NO", "EMAIL", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    income: {
      bookName: "Income Book",
      prefix: "INC",
      sheetName: "Income", 
      requiredHeaders: ["NO", "EFFECT DATE", "DATE", "FY", "ID", "FYID", "FYID NAME", "CLASS", "CATEGORY", "ACCOUNT NAME", "METHOD", "DEBIT", "CREDIT", "AUT AMOUNT", "PROMO", "MY", "VR NO", "REMARK", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    student: {
      bookName: "Student List",
      prefix: "STU",
      sheetName: "Student", 
      requiredHeaders: ["NO", "Date", "FY", "ID", "FYID", "NAME", "FYID NAME", "CLASS", "CATEGORY", "PROMO", "STU STATUS", "TRNANSFER DATE", "STATUS", "GENDER", "PARENTS NAME", "PHONE NO", "ADDRESS", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    promotion: {
      bookName: "Promotion List",
      prefix: "PRO",
      sheetName: "Promo", 
      requiredHeaders: ["NO", "FY", "CLASS", "CATEGORY", "Registration", "Original price", "Pro A", "Pro B", "Pro C", "Pro D", "Pro E", "Half scholar", "Full scholar", "Remark", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    uniformLedger: {
      bookName: "Uniform Ledger",
      prefix: "UNI",
      sheetName: "Uniform", 
      requiredHeaders: ["NO", "PRODUCT ID", "PRODUCT NAME", "TYPE", "SIZE", "OPENING STOCK", "UNIT PRICE", "TOTAL AMOUNT", "SELLING PRICE", "PROFIT AMOUNT", "SELLING UNIT", "CURRENT QTY", "TOTAL STOCK VALUE", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    fundReport: {
      bookName: "Staff Fund Report",
      prefix: "FND",
      sheetName: "FundReport", 
      requiredHeaders: ["NO", "FUND DATE", "STAFF ID", "NAME", "BONUS BALANCE", "FUND BALANCE", "TOTAL BALANCES", "STATUS"]
    }
  }
};

// ==========================================
// DROPDOWNS CONFIGURATION (EXACT MATCH)
// ==========================================
window.DROPDOWNS = {
  bankBook: {
    category: ["Non","Opening","Transfer","Bank Loan", "Bank Fees","Other Income", "Income", "Closing" ],
    method: ["Bank"],
    transfer: ["Cash Book", "Office Book", "Kitchen Book", "Salary Book"]
  },
  cashBook: {
    category: ["Non","Opening", "Transfer", "Cash Loan", "Other Income","Income",  "Closing"],
    method: ["Cash"],
    transfer: ["Bank Book", "Office Book", "Kitchen Book", "Salary Book"]
  },
  officeExpBook: {
    category: ["Non","Adv / Ref", "Liabilities", "Admin Exp", "Vehicle Related Exp", "Assets Materials", "Donation & Social", "HR Staff Benefit", "Construction", "Student Refund", "Drawing Account 1", "Drawing Account 2", "Student Refund",  "Adv Capital Snack Shop", "Ferry Payment","Advance Unifrom","Opening", "Income","Closing", "Transfer" ],
    method: ["Cash", "Bank"],
    transfer: ["Bank Book", "Cash Book"]
  },
  kitchenExpBook: {
    category: ["Non","Rice & Oil", "Fish & meat/Eggs", "Beans/Vegetables", "Others", "HOME: 1 Exp", "HOME: 2 Exp", "Income","Opening",  "Closing", "Transfer"],
    method: ["Cash", "Bank"],
    transfer: ["Bank Book", "Cash Book"]
  },
  hrPayrollExpBook: {
    category: ["Non","Full Time Salary", "Part Time Salary", "Full Time Bonus", "Full Time Fund", "Income","Opening",  "Closing", "Transfer"],
    method: ["Cash", "Bank"],
    transfer: ["Bank Book", "Cash Book"]
  },
  student: {
    class: ["Non","Pre School", "KG Student", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    category: ["Boarder", "Semi Boarder", "Day Student"],
    promo: ["Original price", "Pro A", "Pro B", "Pro C", "Pro D", "Pro E", "Half scholar", "Full scholar"]
  },
  incomeBook: {
    category: ["Non","Boarder", "Semi Boarder", "Day Student", "Others"],
    accountName: ["Registration", "Services", "Ferry", "Night Study Fees", "Others"],
    method: ["Cash", "Bank"]
  },
  staffCommon: {
    education: ["Non","Phd", "Master", "Degree", "High Graduate", "Middle", "Primary", "High School"],
    fullTimePositions: ["Non","Admin", "Teacher", "Finance", "Computer", "Log & Support", "Assistant Teacher", "Office", "Chef", "Assistant Chef", "Home Chef", "General"],
    partTimePositions: ["Non","သင်ကြားရေး", "အခြား နည်းပြဆရာ", "Zumba Instructor", "တိုက်ကွမ်ဒိုနည်းပြ", "ဓမ္မစကူးလ်နည်းပြ", "ပန်းချီဆရာ", "အားကစားနည်းပြ", "အလုပ်သင်"],
    salaryGrades: ["Non", "Grade A", "Grade B", "Grade C", "Grade D", "Grade E", "Grade F", "Grade G", "Grade H", "Grade I", "Grade J"]
  }
};
