/**
 * GOLDEN ERP SYSTEM - GLOBAL CONFIGURATION & CONSTANTS
 * File: js/config.js
 */

window.START_ROW = 6;

window.BOOK_MAP = {
  "Bank Book": "bank",
  "Cash Book": "cash",
  "Office Exp Book": "office",
  "Kitchen Exp Book": "kitchen",
  "HR Payroll Exp Book": "payroll",
  "Office Book": "office",
  "Kitchen Book": "kitchen",
  "Salary Book": "payroll",
  "bank": "bank",
  "cash": "cash",
  "kitchen": "kitchen",
  "office": "office",
  "payroll": "payroll",
  "hr": "payroll"
};

window.MAGIC_NUMBERS = {
  TRANSACTION_LOCK_DAYS: 7,
  SESSION_EXPIRY_HOURS: 8,
  DASHBOARD_CACHE_TTL_SECONDS: 180,
  LOGIN_LOCK_TTL_SECONDS: 300,
  AUDIT_LOG_MAX_ROWS: 5000,
  PASSWORD_HASH_ITERATIONS: 1000,
  LOCK_TIMEOUT_MS: 15000,
  PROMO_CACHE_TTL_SECONDS: 600
};

window.CONFIG = {
  API_URL: "https://cashbook-api.goldeneduprivateschool.workers.dev/",
  API_BASE_URL: "https://cashbook-api.goldeneduprivateschool.workers.dev/",

  TITLE_MAP: {
    'dashboard': 'Home Dashboard',
    'bank': 'Main Bank Book',
    'cash': 'Main Cash Book',
    'income': 'Main Income Book',
    'office': 'Office Exp Book',
    'kitchen': 'Kitchen Exp Book',
    'payroll': 'HR Payroll Exp Book',
    'hr': 'HR Payroll Exp Book',
    'fulltime': 'Full Time Staff List (FID)',
    'parttime': 'Part Time Staff List (PID)',
    'student': 'Student List',
    'uniform': 'Uniform Ledger',
    'promotion': 'Promotion Reference Matrix',
    'report-financial': 'Financial Statement Report',
    'report-in-detail': 'Income Detail Report (InDetail)',
    'report-in-rep': 'Monthly Income Report (InRep)',
    'report-staff-fund': 'Staff Fund Report',
    'report-student': 'Student Demographics Report',
    'settings': 'System Settings & Controls'
  },

  sheets: {
    bank: {
      bookName: "Bank Book", prefix: "BNK", sheetName: "Bank",
      requiredHeaders: ["NO", "DATE", "CATEGORY", "DESCRIPTION", "METHOD", "DEBIT", "CREDIT", "BALANCES", "TRANSFER", "VR NO", "MY", "FY", "BOOK NAME", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    cash: {
      bookName: "Cash Book", prefix: "CAH", sheetName: "Cash",
      requiredHeaders: ["NO", "DATE", "CATEGORY", "DESCRIPTION", "METHOD", "DEBIT", "CREDIT", "BALANCES", "TRANSFER", "VR NO", "MY", "FY", "BOOK NAME", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    kitchen: {
      bookName: "Kitchen Exp Book", prefix: "KIT", sheetName: "Kitchen",
      requiredHeaders: ["NO", "DATE", "CATEGORY", "DESCRIPTION", "METHOD", "DEBIT", "CREDIT", "BALANCES", "TRANSFER", "VR NO", "MY", "FY", "BOOK NAME", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    office: {
      bookName: "Office Exp Book", prefix: "OFF", sheetName: "Office",
      requiredHeaders: ["NO", "DATE", "CATEGORY", "DESCRIPTION", "UNIT", "UNIT PRICE", "METHOD", "DEBIT", "CREDIT", "BALANCES", "LIABILITIES", "TRANSFER", "VR NO", "MY", "FY", "BOOK NAME", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    payroll: {
      bookName: "HR Payroll Exp Book", prefix: "SAL", sheetName: "Payroll",
      requiredHeaders: ["NO", "DATE", "CATEGORY", "DESCRIPTION", "METHOD", "DEBIT", "CREDIT", "BALANCES", "UNPAID BONUS", "UNPAID FUND", "TRANSFER", "VR NO", "MY", "FY", "BOOK NAME", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    staffFullTime: {
      bookName: "Full Time Staff List", prefix: "FID", sheetName: "FullTime",
      requiredHeaders: ["NO", "JOIN DATE", "CATEGORY", "STAFF ID", "NAME", "STAFF IDNAME", "EDUCATION", "POSITION", "SALARY GRADE", "WORKING DAYS", "BASIC AMT", "EXTRA AMT", "TOTAL SALARY", "BONUS", "FUND", "TOTAL NET AMT", "RESIGNED DATE", "STATUS", "GENDER", "NRC NO", "BANK ACCOUNT", "PHONE NO", "EMAIL", "FUND DATE", "UNPAID BONUS", "UNPAID FUND", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    staffPartTime: {
      bookName: "Part Time Staff List", prefix: "PID", sheetName: "PartTime",
      requiredHeaders: ["NO", "JOIN DATE", "CATEGORY", "STAFF ID", "NAME", "STAFF IDNAME", "EDUCATION", "POSITION", "TOTAL SALARY", "TOTAL NET AMT", "RESIGNED DATE", "STATUS", "GENDER", "NRC NO", "BANK ACCOUNT", "PHONE NO", "EMAIL", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    income: {
      bookName: "Income Book", prefix: "INC", sheetName: "Income",
      requiredHeaders: ["NO", "EFFECT DATE", "DATE", "FY", "ID", "FYID", "FYID NAME", "CLASS", "CATEGORY", "ACCOUNT NAME", "METHOD", "DEBIT", "CREDIT", "AUT AMOUNT", "PROMO", "MY", "VR NO", "REMARK", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    student: {
      bookName: "Student List", prefix: "STU", sheetName: "Student",
      requiredHeaders: ["NO", "Date", "FY", "ID", "FYID", "NAME", "FYID NAME", "CLASS", "CATEGORY", "PROMO", "STU STATUS", "TRNANSFER DATE", "STATUS", "GENDER", "PARENTS NAME", "PHONE NO", "ADDRESS", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    promotion: {
      bookName: "Promotion List", prefix: "PRO", sheetName: "Promo",
      requiredHeaders: ["NO", "FY", "CLASS", "CATEGORY", "Registration", "Original price", "Pro A", "Pro B", "Pro C", "Pro D", "Pro E", "Half scholar", "Full scholar", "Remark", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    uniformLedger: {
      bookName: "Uniform Ledger", prefix: "UNI", sheetName: "Uniform",
      requiredHeaders: ["NO", "PRODUCT ID", "PRODUCT NAME", "TYPE", "SIZE", "OPENING STOCK", "UNIT PRICE", "TOTAL AMOUNT", "SELLING PRICE", "PROFIT AMOUNT", "SELLING UNIT", "CURRENT QTY", "TOTAL STOCK VALUE", "CREATED BY", "CREATED AT", "UNIQUEID"]
    },
    fundReport: {
      bookName: "Staff Fund Report", prefix: "FND", sheetName: "FundReport",
      requiredHeaders: ["NO", "FUND DATE", "STAFF ID", "NAME", "BONUS BALANCE", "FUND BALANCE", "TOTAL BALANCES", "STATUS"]
    }
  }
};

// 💡 Compatibility Aliases
window.CONFIG.books = window.CONFIG.sheets;
var CONFIG = window.CONFIG;

window.DROPDOWNS = {
  bankBook: {
    category: ["Non", "Opening", "Transfer", "Bank Loan", "Bank Fees", "Other Income", "Income", "Closing"],
    method: ["Bank"],
    transfer: ["Cash Book", "Office Exp Book", "Kitchen Exp Book", "HR Payroll Exp Book"]
  },
  cashBook: {
    category: ["Non", "Opening", "Transfer", "Cash Loan", "Other Income", "Income", "Closing"],
    method: ["Cash"],
    transfer: ["Bank Book", "Office Exp Book", "Kitchen Exp Book", "HR Payroll Exp Book"]
  },
  officeExpBook: {
    category: ["Non", "Adv / Ref", "Liabilities", "Admin Exp", "Vehicle Related Exp", "Assets Materials", "Donation & Social", "HR Staff Benefit", "Construction", "Student Refund", "Drawing Account 1", "Drawing Account 2", "Adv Capital Snack Shop", "Ferry Payment", "Advance Uniform", "Opening", "Income", "Closing", "Transfer"],
    method: ["Cash", "Bank"],
    transfer: ["Bank Book", "Cash Book"]
  },
  kitchenExpBook: {
    category: ["Non", "Rice & Oil", "Fish & meat/Eggs", "Beans/Vegetables", "Others", "HOME: 1 Exp", "HOME: 2 Exp", "Income", "Opening", "Closing", "Transfer"],
    method: ["Cash", "Bank"],
    transfer: ["Bank Book", "Cash Book"]
  },
  hrPayrollExpBook: {
    category: ["Non", "Full Time Salary", "Part Time Salary", "Full Time Bonus", "Full Time Fund", "Income", "Opening", "Closing", "Transfer"],
    method: ["Cash", "Bank"],
    transfer: ["Bank Book", "Cash Book"]
  },
  student: {
    class: ["Non", "Pre School", "KG Student", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"],
    category: ["Boarder", "Semi Boarder", "Day Student"],
    promo: ["Original price", "Pro A", "Pro B", "Pro C", "Pro D", "Pro E", "Half scholar", "Full scholar"]
  },
  incomeBook: {
    category: ["Non", "Boarder", "Semi Boarder", "Day Student", "Others"],
    accountName: ["Registration", "Services", "Ferry", "Night Study Fees", "Others"],
    method: ["Cash", "Bank"]
  },
  staffCommon: {
    education: ["Non", "Phd", "Master", "Degree", "High Graduate", "Middle", "Primary", "High School"],
    fullTimePositions: ["Non", "Admin", "Teacher", "Finance", "Computer", "Log & Support", "Assistant Teacher", "Office", "Chef", "Assistant Chef", "Home Chef", "General"],
    partTimePositions: ["Non", "သင်ကြားရေး", "အခြား နည်းပြဆရာ", "Zumba Instructor", "တိုက်ကွမ်ဒိုနည်းပြ", "ဓမ္မစကူးလ်နည်းပြ", "ပန်းချီဆရာ", "အားကစားနည်းပြ", "အလုပ်သင်"],
    salaryGrades: ["Non", "Grade A", "Grade B", "Grade C", "Grade D", "Grade E", "Grade F", "Grade G", "Grade H", "Grade I", "Grade J", "Grade K"]
  }
};

var DROPDOWNS = window.DROPDOWNS;
