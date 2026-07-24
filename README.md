# 🎓 SYSTEM — Cashbook & Payroll Platform

An enterprise-grade, serverless Single Page Application APP System designed for educational institutions and corporate cashbook/payroll operations. Built using **Pure JavaScript, Tailwind CSS, Cloudflare Workers (Edge Serverless API), and Google Sheets API**.

---

## 🏗️ System Architecture

┌─────────────────────────┐ ┌──────────────────────────────┐ ┌────────────────────────┐
│ GitHub Pages │ HTTP │ Cloudflare Worker │ REST │ Google Sheets API v4 │
│ (Vanilla JS SPA UI) │ ────► │ (Edge Serverless API) │ ────► │ & Drive API v3 │
│ HTML5 / Tailwind CSS │ Bearer│ JWT Auth Guard / RBAC Matrix │ OAuth│ (Cloud Database Store)│
└─────────────────────────┘ └──────────────────────────────┘ └────────────────────────┘
code Code

---

## 📁 Project Folder Structure

golden-erp/
├── css/
│ └── style.css # Global Dark Theme, Responsive Utilities & Print CSS (@media print)
├── js/
│ ├── api.js # Central API Bridge Client with Bearer Token Injection & 401 Handler
│ ├── app.js # Single Page Application Router, View Injector & Module Initializer
│ ├── auth.js # Authentication & Session Management
│ ├── bank-cash-kit.js # Main Bank & Main Cash Book Controller
│ ├── hr.js # HR Payroll Book Controller & Payslip Generator
│ ├── income.js # Main Income Book & Student Auto-Lookup Controller
│ ├── office.js # Office & Kitchen Expense Book Controller
│ ├── promotion.js # Promotion Fee Matrix Controller
│ ├── reports.js # Financial Statements & Analytics Reports Controller
│ ├── settings.js # Control Center, Backup & EOY Reset Trigger Controller
│ ├── staff.js # Staff Directory & Live Salary Calculation Engine
│ ├── student.js # Student Directory Controller
│ └── uniform.js # Uniform Inventory Ledger Controller
├── views/
│ ├── bank-cash-kit.html # Bank/Cash Ledger View Template
│ ├── dashboard.html # Home Dashboard KPI Cards & Live Balances
│ ├── hr.html # HR Payroll & Staff Directory Tab Shell
│ ├── income.html # Main Income Book View Template
│ ├── office.html # Office Expense View Template
│ ├── promotion.html # Promotion Fee Matrix View Template
│ ├── reports.html # Financial Reports Sub-Panels View Template
│ ├── reports-fund.html # Staff Fund Report View Template
│ ├── settings.html # System Controls View Template
│ ├── staff.html # Staff List View Template
│ ├── student.html # Student List View Template
│ └── uniform.html # Uniform Inventory View Template
├── validators/
│ └── validation.js # Input Validation Engine (Dates, Amounts, Text Payload Sanitizers)
├── utils/
│ └── logger.js # Audit Trail Logger & Server Error Logger
├── google.js # Google OAuth2 Service Account Authentication & Batch Sheets API Helpers
├── handlers-dashboard-reports.js # Dashboard Analytics, Reports & Secure JWT Authentication
├── handlers-eoy-backup.js # Safe EOY Fiscal Reset & Google Drive Archive Backup Engine
├── handlers-income-student.js # Income, Student, Uniform & Promotion CRUD Handlers
├── handlers-ledger.js # General Ledger Engine, Transfer Inter-Book Sync & Fast Parallel Deletion
├── handlers-staff.js # Staff Directory, Grade Matrix & Accrual Sync Handlers
├── worker.js # Cloudflare Worker Main Router & Middleware Authorization Guard
├── index.html # Main Application Shell & Global Modals / Print Areas
└── README.md # System Documentation
code Code

---

## 🔑 Environment Variables & Cloudflare Secrets

Configure these **Secrets** in your Cloudflare Worker environment settings (`wrangler.toml` or Cloudflare Dashboard):

| Variable Name | Type | Description |
| :--- | :--- | :--- |
| `SPREADSHEET_ID` | Environment Variable | Google Sheets Database Unique Spreadsheet ID |
| `AUTH_SECRET` | Secret Key | Cryptographic HMAC SHA-256 Secret Key for signing JWT tokens |
| `GOOGLE_SERVICE_ACCOUNT` | Secret JSON String | Google Service Account Private Key credentials JSON string |

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| User Role | View Ledgers | Add/Edit Entries | Delete Entries | Update Payroll Grades | Run EOY Reset |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **HR** | ✅ | ✅ | ✅ (Staff Only) | ✅ | ❌ |
| **Finance / Account** | ✅ | ✅ | ✅ (Ledgers) | ❌ | ❌ |
| **Main Cashier / Cashier** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🗄️ Google Sheets Database Schema (Sheet Tabs)

1. `Home` - Live Dashboard KPI Summary & Financial Balances
2. `Bank` - Main Bank Ledger Book (`A6:P`)
3. `Cash` - Main Cash Ledger Book (`A6:P`)
4. `Income` - Main Student Income Book (`A6:S`)
5. `Office` - Office Expense Ledger Book (`A6:S`)
6. `Kitchen` - Kitchen Expense Ledger Book (`A6:P`)
7. `Payroll` - HR Payroll Expense Book (`A6:R`)
8. `Student` - Student Directory Master List (`A6:R`)
9. `FullTime` - Full-Time Staff Directory & Salary Grade Matrix (`A6:AC` + `I1:U2`)
10. `PartTime` - Part-Time Staff Directory (`A6:T`)
11. `Uniform` - Uniform Product Inventory Ledger (`A6:N`)
12. `Promo` - Promotion Fee Rate Matrix (`A6:O`)
13. `FundReport` - Staff Accrued Bonus & Fund Report (`A6:H`)
14. `Users` - Authorized System User Accounts & Passwords/Hashes (`A2:C`)
15. `AuditLogs` - Audit Trail Activity Records (`A2:G`)

---

## 🚀 End of Year (EOY) Reset & Backup Protocol

When executing EOY Fiscal Year Reset from `System Settings`:
1. **Automatic Drive Archive:** The system triggers Google Drive API v3 to copy the entire spreadsheet to Google Drive with title `GOLDEN_ERP_ARCHIVE_FY2025-2026_RESET_[Timestamp]`.
2. **Balance Rollforward:** Saves ending balances for Bank & Cash books.
3. **Transactional Reset:** Clears Rows 6-10,000 for `Income`, `Office`, `Kitchen`, `Payroll`, `Bank`, and `Cash`.
4. **Opening Balance Insertion:** Writes Row 6 opening balances on Bank & Cash.
5. **Master Data Preservation:** Leaves `Student`, `FullTime`, `PartTime`, `Promo`, `Users`, and `AuditLogs` sheets 100% untouched.

---

## 🛡️ Security Best Practices Applied

* **Formula Injection Prevention:** Input values starting with `=`, `+`, `-`, `@` are automatically escaped in `google.js` (`sanitizeCellValue`) to prevent formula execution exploits.
* **No Hardcoded Secrets:** JWT signing strictly requires `env.AUTH_SECRET` on Cloudflare Workers.
* **Bearer Token Authorization:** All private endpoints require HTTP `Authorization: Bearer <JWT>` header verification.
* **Tamper-Proof Audit Logging:** Write operations automatically log operator details, timestamps, and payload metadata to `AuditLogs`.
