# NeuroPath AI — Security & Authentication Architecture

This document details the backend authentication, role-based access control (RBAC), password security, and audit logging architecture implemented for **NeuroPath AI** in compliance with prototype security guidelines for the **Precision Care Challenge 2026**.

---

## 🔒 Security Architecture Overview

```text
                  LOGIN PORTAL
                       │ (Email + Password)
                       ▼
         POST /api/auth/login Endpoint
                       │
              1. Lookup User by Email
              2. Verify `bcrypt` Salted Hash
              3. Check `is_active` Flag
                       │
                       ▼
           Generate Signed JWT Access Token
                       │ (Claims: sub, email, role)
                       ▼
             Frontend Auth Context
                       │
          Headers: `Authorization: Bearer <token>`
                       │
                       ▼
            Backend Protected API Routes
                       │
              `get_current_user`
                       │
           RBAC Role Verification (`require_role`)
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
    CLINICIAN        ADMIN        EVALUATOR
        │              │              │
        └──────────────┼──────────────┘
                       ▼
              Execute Endpoint Logic
                       │
                       ▼
             Record Audit Log Event
```

---

## 🔑 Key Security Components

### 1. User Database Model (`backend/app/database/models.py`)
- **Table**: `users`
- **Fields**: `id`, `email` (normalized lowercase), `password_hash`, `full_name`, `role` (`CLINICIAN`, `ADMIN`, `EVALUATOR`), `is_active`, `created_at`, `last_login_at`.
- **Security Policy**: Plaintext passwords are **NEVER** stored in SQLite. Only salted `bcrypt` hashes are saved.

### 2. Password Security (`backend/app/services/auth_service.py`)
- **Algorithm**: `bcrypt` salted password hashing (`bcrypt.hashpw` / `bcrypt.checkpw`).
- **Validation**: Enforces minimum length, UTF-8 byte boundary truncation ($72$ bytes), and timing-safe verification.

### 3. JWT Access Tokens
- **Algorithm**: `HS256` signed using `JWT_SECRET_KEY`.
- **Claims**: `sub` (User ID), `email`, `role`, `full_name`, `iat` (Issued At), `exp` (Expiration).
- **Lifespan**: Configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` (Default: 120 minutes).
- **Zero Medical Data in Tokens**: Patient records and clinical data are excluded from JWT token payloads.

### 4. Role-Based Access Control (RBAC)
Backend source of truth for authorization:
- **`CLINICIAN`**: View patient queue, search patients, inspect clinical records, run batch prioritization, view pathways, view analytics, and generate reports.
- **`EVALUATOR`**: Evaluate prioritization prototype, view synthetic demonstration cohorts, inspect transparency metrics, and test decision support workflow.
- **`ADMIN`**: All clinical capabilities plus administrative dataset ingestion (`POST /api/patients/upload`), ML algorithm switching (`POST /api/model/algorithm`), user management, and security audit log entry.

### 5. Idempotent Demo Accounts
Pre-configured for hackathon evaluation:
- **Clinician**: `clinician@neuropath.demo` / `ClinicianPass2026!` (Role: `CLINICIAN`)
- **Admin**: `admin@neuropath.demo` / `AdminPass2026!` (Role: `ADMIN`)
- **Evaluator**: `evaluator@neuropath.demo` / `EvaluatorPass2026!` (Role: `EVALUATOR`)

---

## 📜 Audit Logging Integration

Authentication & authorization events are recorded in SQLite table `audit_logs`:
* `LOGIN_SUCCESS`: Authenticated user email, role, and timestamp.
* `LOGIN_FAILURE`: Generic failure logged without exposing email existence.
* `LOGOUT`: Client logout event recorded.
* `FORBIDDEN_ROLE_ACCESS`: Access denial logged when a user attempts an unauthorized route (e.g. `CLINICIAN` attempting `ADMIN` algorithm switch).

---

## ⚠️ Positioning & Disclaimers

> *Authentication has been upgraded from client-side persona switching to backend JWT authentication with role-based authorization (RBAC) for the de-identified hackathon sandbox. Additional controls would be required for production clinical deployment.*
