# AuraVisa Global — AI e-Visa Consultancy & Management System

AuraVisa Global is a full-stack electronic visa consultancy and case management platform designed for international travelers, immigration consultants, and regulatory administrators. Built with a strict premium white design system, isolated private document storage outside web roots, SQLite persistence with Prisma ORM, and Google Gemini AI integration with verified official sovereign government sources.

---

## 🌟 Key Features

1. **Strict Premium White Theme**
   - Strictly conforms to the requested color palette: `#FFFFFF` primary background, `#F8FAFC` and `#F1F5F9` secondary backgrounds, `#2563EB` primary actions, `#1F2937` primary text, and `#E2E8F0` borders.
   - Zero dark full-page slop, zero gold/navy/yellow accents.
   - Accessible contrast, clean typography, responsive navigation across mobile, tablet, and desktop.

2. **Verified Sovereign Government Knowledge Base**
   - Verified visa rules, fees, validity, and processing durations for:
     - 🇦🇪 United Arab Emirates (UAE / Dubai) Tourist eVisa — *Federal Authority for Identity, Citizenship, Customs and Port Security (ICP UAE)*
     - 🇮🇳 Republic of India 30-Day e-Visa — *Bureau of Immigration (BoI), Ministry of Home Affairs, Government of India*
     - 🇬🇧 United Kingdom Standard Visitor Visa — *UK Visas and Immigration (UKVI), Home Office*
     - 🇫🇷 Schengen Area Visitor Visa (France / Europe) — *France-Visas Official Portal*
     - 🇸🇬 Singapore Electronic Visa (e-Visa) — *Immigration & Checkpoints Authority (ICA) Singapore*
     - 🇻🇳 Vietnam 90-Day Multiple Entry e-Visa — *Vietnam Immigration Department*
   - Official government portal links and verification timestamps.

3. **Multi-Language AI Visa Assistant**
   - Powered by `@google/genai` (model: `gemini-3.8-flash`) accessed strictly on the server.
   - Grounded directly with verified database sources to prevent hallucinations.
   - Supports **English**, **Gujarati (ગુજરાતી)**, and **Hindi (हिंदी)**.
   - Includes official government source citations, verification dates, and statutory disclaimers.
   - Safe failure states and automatic fallback if the AI provider experiences outages or rate limits.

4. **Private Document Storage Architecture (Vault)**
   - Uploaded files are stored in `storage/uploads/` completely outside public frontend assets or static web hosting.
   - Unguessable cryptographically randomized UUID filenames.
   - Strict validation: file extensions (`.jpg`, `.jpeg`, `.png`, `.pdf`), MIME types, and magic-number file signatures.
   - Cryptographic SHA-256 integrity checksums stored in database.
   - Path traversal and symlink guards (`../` attempts return 404/rejected).
   - Authenticated streaming download endpoints verifying customer ownership or assigned consultant permissions.

5. **Three Distinct, Isolated Portals**
   - **Customer Portal (`/customer/*`)**:
     - Dashboard with KPI cards, application tracker, upcoming consultation alerts.
     - New application dossier submission with automated reference numbers (`AV-YYYY-XXXXX`).
     - Private Document Vault with upload, view verification status, download, and delete.
     - Scheduled consultations with direct video meeting links.
     - Support enquiries and traveler profile management.
   - **Consultant Panel (`/consultant/*`)**:
     - Caseload desk limited strictly to assigned applicant dossiers.
     - Audit desk for reviewing and downloading private documents.
     - Verify or request re-upload with tailored applicant feedback notes.
     - Status progression (`UNDER_REVIEW`, `DOCUMENTS_REQUESTED`, `PROCESSING`, `APPROVED`, `REJECTED`) with automatic audit trails.
     - Confidential staff case notes feed.
     - Scheduled consultation hearings calendar.
     - Action tasks checklist.
   - **Executive Admin Console (`/admin/*`)**:
     - System KPI metrics (users, applications, approval rates, audit events).
     - User directory with role governance (`CUSTOMER`, `CONSULTANT`, `ADMIN`), status activation/suspension, and self-demotion guards.
     - Case reassignment engine to delegate dossiers to active consultants.
     - Executive status override capability.
     - Complete CRUD for Visa Programs, Official Government Sources, and Document Requirements.
     - Real-time immutable security audit log viewer with JSON payload inspector.

---

## 🔑 Demo Credentials

| Role | Email Address | Password | Default Portal |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@auravisa.com` | `AdminPassword123!` | `/admin/dashboard` |
| **Senior Consultant** | `consultant@auravisa.com` | `Consultant123!` | `/consultant/dashboard` |
| **Verified Customer** | `customer@auravisa.com` | `Customer123!` | `/customer/dashboard` |

*Note: One-click demo profile buttons are also provided directly on the `/login` page for instant testing.*

---

## 💻 Exact Windows PowerShell Commands

### 1. Install Dependencies
```powershell
npm install --legacy-peer-deps
```

### 2. Initialize Database & Push Schema
```powershell
npx prisma db push
```

### 3. Seed Database with Verified Government Data & Demo Users
```powershell
npx tsx prisma/seed.ts
```

### 4. Run Automated Test Suite
```powershell
npm run test
```

### 5. Start Development Server (Full-Stack on Port 3000)
```powershell
npm run dev
```

### 6. Production Build & Execution
```powershell
npm run build
$env:NODE_ENV="production"
npm run start
```

---

## 📁 Project Folder Structure

```
auravisa-global/
├── .env.example              # Environment variables template
├── index.html                # HTML entry point with synchronized metadata
├── metadata.json             # AI Studio applet capabilities
├── package.json              # Dependencies and execution scripts
├── prisma/
│   ├── dev.db                # SQLite database file
│   ├── schema.prisma         # Prisma schema with 16 data models
│   └── seed.ts               # Demo data & verified government sources seed script
├── server/
│   ├── src/
│   │   ├── config.ts         # Environment settings and paths
│   │   ├── db.ts             # Prisma Client singleton
│   │   ├── middleware/
│   │   │   ├── audit.ts      # Immutable audit logging service
│   │   │   └── auth.ts       # Session authentication and role guards
│   │   ├── routes/
│   │   │   ├── admin.routes.ts      # Executive administration endpoints
│   │   │   ├── auth.routes.ts       # Registration, login, logout, session
│   │   │   ├── consultant.routes.ts # Case review desk endpoints
│   │   │   ├── customer.routes.ts   # Private applicant vault endpoints
│   │   │   └── visa.routes.ts       # Public programs, eligibility & AI chat
│   │   └── services/
│   │       ├── aiService.ts         # Gemini 3.8 Flash multi-language assistant
│   │       └── storageService.ts    # Private vault storage & MIME signature checks
├── server.ts                 # Full-stack Express entry point with Vite middleware
├── src/
│   ├── App.tsx               # Client router with role-gated routes
│   ├── components/
│   │   └── common/
│   │       ├── AiVisaAssistantModal.tsx # EN, GU, HI AI assistant modal
│   │       ├── BookAppointmentModal.tsx # Collision-free consultation booking
│   │       ├── EligibilityModal.tsx     # Multi-step eligibility evaluator
│   │       ├── ErrorBoundary.tsx        # React crash preventer
│   │       ├── Footer.tsx               # White theme footer with official portals
│   │       ├── Navbar.tsx               # Navigation bar with role badges
│   │       └── ProtectedRoute.tsx       # Client-side authorization guard
│   ├── context/
│   │   └── AuthContext.tsx   # React authentication state and session sync
│   ├── layouts/
│   │   ├── AdminLayout.tsx       # Admin sidebar & topbar
│   │   ├── ConsultantLayout.tsx  # Consultant sidebar & desk
│   │   ├── CustomerLayout.tsx    # Customer sidebar & vault
│   │   └── PublicLayout.tsx      # Public website layout
│   ├── pages/
│   │   ├── admin/            # 9 Admin management views
│   │   ├── consultant/       # 5 Consultant verification views
│   │   ├── customer/         # 6 Customer dossier & vault views
│   │   └── public/           # 6 Public website views
│   ├── services/
│   │   └── api.ts            # Safe fetch wrapper with JSON guard
│   └── types/
│       └── index.ts          # Complete TypeScript domain interfaces
├── storage/
│   └── uploads/              # Private document storage outside web root
└── tests/
    └── system.test.ts        # Automated unit and integration test suite
```

---

## 🔒 Security Architecture Highlights

1. **Customer Data Isolation**: Applications and private documents enforce strict database filtering by authenticated `customerId`. Modifying query parameters or IDs returns `403 Forbidden` / `404 Not Found`.
2. **Consultant Scoping**: Consultants can only access files for applicants with an active `ConsultantAssignment` in SQLite.
3. **Role Escalation Protection**: Public registration (`/auth/register`) strictly sets role `CUSTOMER`. Role upgrades require administrative authorization (`PATCH /api/v1/admin/users/:id/role`).
4. **Self-Demotion Guard**: Administrators cannot demote or suspend their own account.
5. **Path Traversal Guards**: Filenames in `storageService.ts` are strictly stripped with `path.basename()` and verified against `path.resolve(storagePath)`.
6. **MIME & File Signature Enforcement**: Evaluates magic bytes for PDF (`%PDF`) and JPEG/PNG headers before saving documents.
7. **HttpOnly Session Cookies**: Session IDs are stored in `auravisa.sid` with `httpOnly: true` and `sameSite: 'lax'`.
