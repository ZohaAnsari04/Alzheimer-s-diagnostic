# 3–5 Minute Judge Demonstration Walkthrough

## Step 1: Launch System (30 Seconds)
1. Run `python run.py` and open `http://localhost:3000`.
2. Observe the prominent Safety Banner at the top ("Clinical Decision Support Only").
3. Click the **"Demo Mode (248 Cohort)"** button in the topbar to initialize the benchmark cohort.

## Step 2: Command Center & KPI Overview (1 Minute)
1. Review the dynamic KPI cards: Total Screened (248), High Priority (32), MRI Candidates (18), PET Candidates (7).
2. Point out the **Progressive Diagnostic Pipeline Flow**: Cognitive Screening → Blood Biomarkers → MRI → PET.

## Step 3: Priority Queue & Benchmark Patient P-1042 (1.5 Minutes)
1. Click **"Patient Priority Queue"** in the sidebar.
2. Observe patient `P-1042` (Age 72, Score 91.0/100, HIGH Priority).
3. Click **"Inspect"** on `P-1042`.
4. Inspect the **Patient Intelligence** view:
   - Note the explicit score disclaimer ("Priority score for decision support — not a diagnostic probability").
   - Review the **4-Stage Pathway Timeline** (Stage 3 MRI Evaluation recommended).
   - Review the **"Why was this patient prioritized?"** factor contribution chart (+28 Cognitive, +18 Age, +16 Biomarkers).
   - Note the MRI data disclaimer (*"MRI image analysis is not enabled in this prototype... structured features used only"*).

## Step 4: Population Analytics & Resource Capacity Planner (1 Minute)
1. Click **"Population Analytics"** in the sidebar.
2. View the Population Conversion Funnel.
3. Move the **MRI & PET Daily Capacity sliders** to demonstrate dynamic backlog and utilization calculations.

## Step 5: Model Transparency & Ethics (30 Seconds)
1. Click **"Model & Explainability"** to view the Model Transparency Card and Global Feature Importance.
2. Click **"Ethics & Limitations"** to highlight intended use boundaries and human-in-the-loop clinical oversight.
