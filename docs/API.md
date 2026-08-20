# API Endpoint Specification

## Summary Endpoints
- `GET /api/health` — System status & disclaimers
- `GET /api/dashboard/summary` — High-level KPI counts

## Patient Management
- `GET /api/patients` — List patients with search, filtering, sorting, pagination
- `GET /api/patients/{patient_id}` — Get single patient record details
- `POST /api/patients/upload` — Ingest CSV dataset with schema validation

## Prioritization & Pathways
- `POST /api/prioritization/run` — Run model prioritization scoring on cohort
- `GET /api/pathway/{patient_id}` — Get patient timeline & stage recommendation

## Analytics & Resource Overview
- `GET /api/analytics` — Population distribution & funnel data
- `GET /api/analytics/resource-capacity` — Resource demand vs capacity calculations

## Model & Security
- `GET /api/model/metrics` — Model card, performance metrics & global feature importances
- `GET /api/model/explainability/{patient_id}` — Patient factor contribution breakdown
- `GET /api/audit-logs` — Security audit logs
- `POST /api/demo/generate` — Seed synthetic demo cohort
