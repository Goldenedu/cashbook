/**
 * GOLDEN ERP SYSTEM - GLOBAL CONFIGURATION & CONSTANTS
 * File: js/config.js
 * 💡 Centralized Single Source of Truth for System Configurations
 */

window.CONFIG = {
  // 1. Central API Endpoint URL
  API_URL: "https://cashbook-api.goldeneduprivateschool.workers.dev/",

  // 2. Application Title Mappings
  TITLE_MAP: {
    'dashboard': 'Home Dashboard',
    'bank': 'Main Bank Book',
    'cash': 'Main Cash Book',
    'income': 'Main Income Book',
    'office': 'Office Exp Book',
    'kitchen': 'Kitchen Exp Book',
    'payroll': 'HR Payroll Exp Book',
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

  // 3. Default Page Limits
  PAGINATION: {
    DEFAULT_LIMIT: 30,
    INCOME_LIMIT: 200,
    STAFF_LIMIT: 50,
    PROMO_LIMIT: 50
  },

  // 4. Central Dropdown Options Configuration
  DROPDOWNS: {
    classes: [
      "Pre School", "KG Student", "Grade 1", "Grade 2", "Grade 3", 
      "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", 
      "Grade 9", "Grade 10", "Grade 11", "Grade 12"
    ],
    categories: ["Boarder", "Semi Boarder", "Day Student", "Others"],
    methods: ["Cash", "Bank"],
    transfers: ["Bank Book", "Cash Book", "Office Book", "Kitchen Book", "Salary Book"],
    promos: ["Original price", "Pro A", "Pro B", "Pro C", "Pro D", "Pro E", "Half scholar", "Full scholar"],
    education: ["PhD", "Master", "Degree", "High Graduate", "Middle", "Primary", "High School"],
    fullTimePositions: [
      "Admin", "Teacher", "Finance", "Computer", "Log & Support", 
      "Assistant Teacher", "Office", "Chef", "Assistant Chef", "Home Chef", "General"
    ],
    partTimePositions: [
      "သင်ကြားရေး", "အခြား နည်းပြဆရာ", "Zumba Instructor", "တိုက်ကွမ်ဒိုနည်းပြ", 
      "ဓမ္မစကူးလ်နည်းပြ", "ပန်းချီဆရာ", "အားကစားနည်းပြ", "အလုပ်သင်"
    ],
    salaryGrades: ["Non", "Grade A", "Grade B", "Grade C", "Grade D", "Grade E", "Grade F", "Grade G", "Grade H", "Grade I", "Grade J"]
  }
};