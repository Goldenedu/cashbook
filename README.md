# 🎓 GOLDEN ERP SYSTEM — Enterprise Cashbook & Payroll Platform

An enterprise-grade, serverless Single Page Application (SPA) ERP System designed for educational institutions and corporate cashbook/payroll operations. Built using **Pure JavaScript, Tailwind CSS, Cloudflare Workers (Edge Serverless API), Resend Email API, and Google Sheets API**.

---

## 🏗️ System Architecture

┌─────────────────────────┐ ┌──────────────────────────────┐ ┌────────────────────────┐
│ GitHub Pages │ HTTP │ Cloudflare Worker │ REST │ Google Sheets API v4 │
│ (Vanilla JS SPA UI) │ ────► │ (Edge Serverless API) │ ────► │ & Resend Email API │
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
│ ├── app.js # SPA Router, View Injector & Live Clock Engine
│ ├── auth.js # Authentication, Login Form Submission & Session Management
│ ├── bank-cash-kit.js # Main Bank & Main Cash Book Controller
│ ├── hr.js # HR Payroll Book Controller & A4 Payslip Generator
│ ├── income.js # Main Income Book, Dual-Copy Print Engine & Student Auto-Lookup
│ ├── office.js # Office & Kitchen Expense Book Controller
│ ├── promotion.js # Promotion Fee Rate Matrix Controller
│ ├── reports.js # Financial Statements & Analytics Reports Controller
│ ├── settings.js # Control Center & Manual Backup Controller
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
├── google.js # Google OAuth2 Service Account Auth, Formula Sanitizer & Batch API
├── handlers-dashboard-reports.js # Dashboard Analytics, Reports & SHA-256 JWT Authentication
├── handlers-eoy-backup.js # Email Backup Sender & Instant Excel Download Engine
├── handlers-income-student.js # Income, Student, Uniform & Promotion CRUD Handlers
├── handlers-ledger.js # General Ledger Engine, Smart Tab Fallbacks & Parallel Deletion
├── handlers-staff.js # Staff Directory, Grade Matrix & Accrual Sync Handlers
├── worker.js # Cloudflare Worker Main Router & Middleware Authorization Guard
├── index.html # Main Application Shell, Global Modals & Dual-Copy Print Areas
└── README.md # System Documentation
code Code

---

## 🔑 Environment Variables & Cloudflare Secrets

Configure these **Secrets** in your Cloudflare Worker environment settings (`wrangler.toml` or Cloudflare Dashboard):

| Variable Name | Type | Description |
| :--- | :--- | :--- |
| `SPREADSHEET_ID` | Plaintext Variable | Google Sheets Database Unique Spreadsheet ID (e.g. `1GCDHdCfGE...`) |
| `AUTH_SECRET` | Secret Key | Cryptographic HMAC SHA-256 Secret Key for signing JWT tokens |
| `GOOGLE_SERVICE_ACCOUNT` | Plaintext / Secret | Google Service Account Private Key credentials JSON string |
| `RESEND_API_KEY` | Plaintext / Secret | Resend API Key for sending automated backup email reports (`re_...`) |

---

## 🔐 Role-Based Access Control (RBAC) Matrix

| User Role | View Ledgers | Add/Edit Entries | Delete Entries | Update Payroll Grades | Backup System |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Owner** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **HR** | ✅ | ✅ | ✅ (Staff Only) | ✅ | ❌ |
| **Finance / Account** | ✅ | ✅ | ✅ (Ledgers) | ❌ | ✅ |
| **Main Cashier / Cashier** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Viewer** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🗄️ Google Sheets Database Schema (Sheet Tabs)

1. `Home` - Live Dashboard KPI Summary & Financial Balances
2. `Bank` - Main Bank Ledger Book (Supports `Bank`, `Bank Book`, `Bank and Cash Book`)
3. `Cash` - Main Cash Ledger Book (Supports `Cash`, `Cash Book`, `Bank and Cash Book`)
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

---

## 📊 Backup & Email Export System

When clicking **Run Immediate Manual Backup** from `System Settings`:
1. **Automated Resend Email:** Sends a formatted HTML backup report to `goldeneduprivateschool@gmail.com` containing the timestamp (Myanmar Timezone UTC+6:30) and direct sheet edit link.
2. **Instant Excel Export:** Triggers a direct download of the live database in Excel (`.xlsx`) format to the user's local device.

---

## 🛡️ Security Best Practices Applied

* **Formula Injection Prevention:** Input values starting with `=`, `+`, `-`, `@` are automatically escaped in `google.js` (`sanitizeCellValue`) to prevent formula execution exploits.
* **No Hardcoded Secrets:** JWT signing strictly requires `env.AUTH_SECRET` on Cloudflare Workers.
* **Bearer Token Authorization:** All private endpoints require HTTP `Authorization: Bearer <JWT>` header verification.
* **Myanmar Timezone (UTC+6:30):** All backup timestamps and date strings are calculated in Myanmar Standard Time.
