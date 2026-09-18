# Institutional Event & Academic KPI Automation Platform (EventPulse)

An enterprise-grade, end-to-end institutional event lifecycle and academic KPI automation platform designed for universities, colleges, and accreditation bodies (NAAC, NIRF, NBA). The system features prefix-gated student feedback, an automated 12-rubric scoring engine, role-based executive dashboards, digital signature compliance sign-offs, and hardened Cloud Firestore security.

---

## 📌 Table of Contents
1. [Executive Summary & Features](#executive-summary--features)
2. [Technology Stack](#technology-stack)
3. [System Architecture & Roles](#system-architecture--roles)
4. [Relational Data Model (Firestore Schema)](#relational-data-model-firestore-schema)
5. [The 12-Rubric Academic KPI Scoring Engine](#the-12-rubric-academic-kpi-scoring-engine)
6. [Prefix-Gated Student Feedback Flow](#prefix-gated-student-feedback-flow)
7. [Compliance Audit & Digital Sign-off](#compliance-audit--digital-sign-off)
8. [Security Architecture & The "Dirty Dozen" Protection](#security-architecture--the-dirty-dozen-protection)
9. [Project Structure & Key Modules](#project-structure--key-modules)
10. [Local Development & Deployment Guide](#local-development--deployment-guide)

---

## 🚀 Executive Summary & Features

Institutions organize hundreds of workshops, conferences, seminars, faculty development programs (FDPs), and hackathons annually. Traditional methods rely on paper forms, scattered Google Sheets, and unverified self-reporting, resulting in audit bottlenecks and unvalidated KPI reports.

**EventPulse solves this with:**
- **Automated Lifecycle Management**: From event proposal and circular dissemination to live execution and archiving.
- **Prefix-Gated Feedback Verification**: Students must input their authentic college registration number; regex prefix matching prevents unauthorized or cross-department feedback spam.
- **Automated 12-Dimension KPI Engine**: Dynamically calculates institutional performance scores (0–100) and assigns letter grades (Excellent, Good, Satisfactory, Needs Improvement).
- **Executive Leadership & HoD Dashboards**: Real-time drill-downs across departments, budget utilization, student attendance, industry expert involvement, and research outputs.
- **One-Click Compliance Reporting**: Instant data exports to Excel, CSV, and formatted institutional accreditation audit reports.
- **Tamper-Proof Audit Sign-off**: Cryptographic digital canvas signature with timestamp verification.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Styling & UI System** | Tailwind CSS v4, Lucide React Icons |
| **Animation & Transitions** | Motion (`motion/react`) |
| **Database & Persistence** | Google Cloud Firestore (Live NoSQL Cloud DB) |
| **Authentication** | Multi-role session simulation + Firebase Auth tokens |
| **Export Formats** | CSV, JSON, formatted audit print engine |
| **Security & Auditing** | Granular Firestore Security Rules with schema validation |

---

## 👥 System Architecture & Roles

The platform implements strict **Role-Based Access Control (RBAC)** across three distinct tiers:

### 1. Head Administrator / Dean / Principal (`HEAD_ADMIN`)
- **Full Institutional Overview**: Aggregate KPI health score across all departments (CSE, IT, ECE, EEE, MECH, CIVIL, MBA, S&H).
- **Accreditation Readiness**: View NAAC/NIRF metrics, budget vs. expenditure, and faculty research linkages.
- **Event Audit & Sign-off**: Review completed event metrics, verify attendance and speaker profiles, and digitally sign off on official circulars.
- **Data Export**: Export institutional-wide compliance spreadsheets for board meetings.

### 2. Department Staff Coordinator (`STAFF_COORDINATOR`)
- **Event Creation & Scheduling**: Create events (FDP, Workshop, Conference, Seminar, IV, Hackathon).
- **Speaker & Agenda Curation**: Add guest speakers, industry affiliations, contact details, and topics.
- **Dynamic Media Management**: Upload brochures, circulars, attendance sheets, and event photos.
- **Real-time Metric Tracking**: Monitor participant turnouts, internal vs. external registrations, and student feedback sentiment.

### 3. Student / Attendee (`STUDENT`)
- **Personalized Event Catalog**: Filter by department, event type, date, or hybrid/offline mode.
- **Registration Prefix Validation**: Secure feedback entry gated by academic year/batch prefix (e.g. `23`, `24CS`, `22ME`).
- **5-Star Multi-Criterion Rating**: Rate content quality, speaker effectiveness, organizational logistics, and knowledge gain.

---

## 🗄️ Relational Data Model (Firestore Schema)

The database schema is organized into structured collections designed to maintain referential integrity:

### 1. `campus_events` (Collection)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `number` | Unique sequential institutional event identifier |
| `name` | `string` | Official event title |
| `event_type` | `enum` | `FDP`, `WORKSHOP`, `SEMINAR`, `CONFERENCE`, `IV`, `HACKATHON`, `GUEST_LECTURE` |
| `department_id` | `string` | Primary organizing department (e.g. `CSE`, `ECE`) |
| `date_start` / `date_end` | `string` | ISO dates of execution |
| `venue_mode` | `enum` | `ONLINE`, `OFFLINE`, `HYBRID` |
| `eligibility_prefixes` | `string[]` | Allowed roll number prefixes for feedback |
| `feedback_open` | `boolean` | Allows or closes feedback submission window |
| `digital_signature` | `string` | Base64 signature data of HoD/Dean sign-off |
| `audit_completed` | `boolean` | Locks document against modifications post-audit |

### 2. `event_speakers` (Collection)
Contains profiles for industry experts and keynote lecturers linked via `event_id`:
- Name, designation, organization, mobile, email, profile summary, and industry expert flag.

### 3. `event_metrics` (Collection)
Performance data evaluated against institutional targets:
- `target_participants` vs. `achieved_participants`
- `target_external` vs. `achieved_external`
- `budget_allocated` vs. `budget_spent`
- `ideas_projects_count`, `research_papers_count`, `internships_linkages_count`
- `final_kpi_score` (0–100) & `final_grade`

### 4. `event_feedback` (Collection)
Immutable student feedback records:
- `register_no` (alphanumeric ID)
- Multi-criterion scores (1–5): `satisfaction_score`, `content_quality_score`, `speaker_effectiveness_score`, `organization_quality_score`, `knowledge_gain_score`.
- `objective_clarity_met` (`boolean`) and `acquired_skills` (`string`).

---

## 📊 The 12-Rubric Academic KPI Scoring Engine

Every event is evaluated by a deterministic 12-dimension rubric engine located in `src/services/kpiScoring.ts`:

| # | Dimension | Weightage | Scoring Logic |
| :---: | :--- | :---: | :--- |
| **1** | **Attendance Target Ratio** | **15%** | Ratio of achieved participants to target (capped at 100%). |
| **2** | **External Participant Ratio** | **10%** | Measures state/national reach and inter-college collaboration. |
| **3** | **Student Feedback Rating** | **15%** | Aggregated average of all 5 rating metrics across student submissions. |
| **4** | **Industry Expert Involvement** | **10%** | Verified industry practitioners bridging academia and market needs. |
| **5** | **Hands-on / Practical Depth** | **10%** | Lab experiments, hackathon coding, or software tool demonstrations. |
| **6** | **Budget Efficiency** | **8%** | Ratio of actual expenditure vs. allocated budget (penalizes overspending). |
| **7** | **Curriculum Alignment** | **7%** | Course outcome (CO) and program outcome (PO) mapping (1-5 scale). |
| **8** | **Certificate Issuance** | **5%** | Percentage of eligible attendees who received verified certificates. |
| **9** | **Research & Paper Linkages** | **5%** | Publications and research proposals directly resulting from the session. |
| **10** | **Idea/Project Outcomes** | **5%** | Prototypes, patents, or capstone projects generated. |
| **11** | **Inter-Department Collaboration** | **5%** | Joint hosting between multiple academic departments. |
| **12** | **Industry Linkage / Internship** | **5%** | MoUs signed, internship offers, or direct placement linkages. |

### Letter Grade Classification:
- **`Excellent`**: Score ≥ 85.0
- **`Good`**: Score between 70.0 and 84.9
- **`Satisfactory`**: Score between 50.0 and 69.9
- **`Needs Improvement`**: Score < 50.0

---

## 🔒 Prefix-Gated Student Feedback Flow

To guarantee authentic institutional metrics:
1. When a student opens the feedback dialog, they must input their **College Registration Number** (e.g., `23CS101`).
2. The system checks the event's `eligibility_prefixes` (e.g., `['23', '24CS']`).
3. If the registration number does not start with an approved prefix, feedback submission is immediately rejected with a descriptive error.
4. If valid, the submission is recorded in Firestore and calculated into real-time aggregates.

---

## ✍️ Compliance Audit & Digital Sign-off

Under NAAC/NIRF quality benchmarks:
1. Once an event is marked completed, the **Head Administrator** reviews all metrics, speaker profiles, and budget receipts.
2. In the **Audit Sign-off Studio**, the Head Admin signs directly onto an HTML5 canvas.
3. The cryptographic signature is paired with an ISO timestamp and saved to Firestore.
4. Once signed, `audit_completed` is set to `true`, permanently locking the event against arbitrary modifications.

---

## 🛡️ Security Architecture & The "Dirty Dozen" Protection

The Firestore database is governed by comprehensive security rules (`firestore.rules`) designed to resist the institutional **"Dirty Dozen"** adversarial attack vectors:

- **Anti-Ghost Field Injection**: Prohibits rogue keys such as `isAdmin` or `bypassed` in event documents.
- **Anti-Denial-of-Wallet String Bombs**: Limits descriptions and names to strict character boundaries (e.g., descriptions ≤ 5000 characters).
- **Path Traversal Protection**: Enforces sanitized integer IDs to prevent directory escapes (`../../`).
- **Rating Inflation & Negative Score Defense**: Enforces integer bounds `(score >= 1 && score <= 5)`.
- **Immutable Feedback**: Prevents retroactive tampering with historical student ratings.
- **Audit Tamper Defense**: Prevents resetting `audit_completed` once signed.

---

## 📁 Project Structure & Key Modules

```
├── public/                     # Icons, static assets, manifest
├── src/
│   ├── components/
│   │   ├── EventCard3D.tsx     # Interactive event card with live status & KPI grade
│   │   ├── EventDetailModal.tsx# Comprehensive event details, speakers & attachments
│   │   ├── EventFilters.tsx    # Multi-facet filters (Department, Type, Venue mode)
│   │   ├── HeadAdminDashboard.tsx # Executive overview, audit sign-off & analytics
│   │   ├── HeadLoginPanel.tsx  # Executive administrator authentication view
│   │   ├── HeaderNavbar.tsx    # Institutional branding, role switchers & notifications
│   │   ├── HeroCarousel.tsx    # Featured campus events showcase
│   │   ├── LiveTicker.tsx      # Real-time event ticker & updates
│   │   ├── LoginPage.tsx       # Unified role selection screen
│   │   ├── MediaViewerModal.tsx# Circular and document previewer
│   │   ├── StaffLoginPanel.tsx # Faculty coordinator sign-in
│   │   ├── StaffManagementStudio.tsx # Event creation, metric logging & media uploads
│   │   ├── StudentDashboard.tsx# Student view with prefix-gated feedback triggers
│   │   ├── StudentFeedbackModal.tsx # Gated feedback form with 5-star rubric
│   │   └── StudentLoginPanel.tsx# Student authentication view
│   ├── hooks/
│   │   └── usePWAInstall.ts    # Progressive Web App installer hook
│   ├── services/
│   │   ├── auth.ts             # Session and role state management
│   │   ├── dataExport.ts       # CSV & structured report generation
│   │   ├── db.ts               # Firestore CRUD operations & fallbacks
│   │   ├── fileSecurity.ts     # Magic bytes validation & size boundary checks
│   │   ├── firebase.ts         # Firebase App & Firestore initialization
│   │   └── kpiScoring.ts       # 12-rubric mathematical calculation engine
│   ├── types.ts                # TypeScript domain models and interfaces
│   ├── App.tsx                 # Root application controller
│   └── main.tsx                # React entry point
├── firestore.rules             # Production security rules
├── firebase-blueprint.json     # Schema blueprint representation
├── package.json                # Project dependencies and scripts
└── vite.config.ts              # Vite configuration
```

---

## 💻 Local Development & Deployment Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or bun

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/Alkarim786/eventpulse.git
cd eventpulse
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The application will launch on `http://localhost:3000`.

### 3. Build for Production
To create an optimized production bundle:
```bash
npm run build
```
Compiled static assets will be output to the `dist/` directory.

### 4. Deploying Firestore Security Rules
Ensure the Firebase CLI is installed and logged in, then deploy:
```bash
firebase deploy --only firestore:rules
```

---

## 📜 License & Accreditation
Developed for institutional accreditation tracking under NAAC Criterion 3 & 6, NIRF Teaching & Learning Resources (TLR), and NBA Outcome-Based Education (OBE) compliance frameworks.
