from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Dict, Any
from app.database.connection import get_db
from app.database.models import Patient, PrioritizationResult, CognitiveAssessment, BloodMarkers, ImagingFeatures, User
from app.schemas.analytics import AnalyticsResponse, ResourceCapacityResponse, ResourceCapacityConfig
from app.services.patient_service import seed_database_if_empty
from app.api.dashboard import get_dashboard_summary
from app.api.auth_deps import get_current_user
from app.services.notification_service import notify_mri_capacity_threshold, notify_pet_queue_increase

router = APIRouter()

@router.get("", response_model=AnalyticsResponse)
def get_analytics_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_database_if_empty(db)
    summary = get_dashboard_summary(db, current_user=current_user)

    total = summary.total_screened if summary.total_screened > 0 else 1

    priority_dist = [
        {"level": "HIGH", "count": summary.high_priority, "percentage": round((summary.high_priority / total) * 100, 1)},
        {"level": "MEDIUM", "count": summary.medium_priority, "percentage": round((summary.medium_priority / total) * 100, 1)},
        {"level": "LOW", "count": summary.low_priority, "percentage": round((summary.low_priority / total) * 100, 1)},
    ]

    stages = ["Cognitive Screening", "Blood-Based Biomarkers", "MRI Evaluation", "PET Scan Prioritization"]
    stage_breakdown = []
    for s in stages:
        c = db.query(Patient).filter(Patient.current_stage == s).count()
        pending = db.query(Patient).filter(Patient.current_stage == s, Patient.review_status == "Pending Review").count()
        stage_breakdown.append({
            "stage": s,
            "count": c,
            "percentage": round((c / total) * 100, 1),
            "candidates_awaiting_review": pending
        })

    funnel = [
        {"stage": "Screened Population", "count": total, "conversion_rate": 100.0},
        {"stage": "High/Med Prioritized", "count": summary.high_priority + summary.medium_priority, "conversion_rate": round(((summary.high_priority + summary.medium_priority) / total) * 100, 1)},
        {"stage": "Biomarker Candidates", "count": summary.biomarker_candidates, "conversion_rate": round((summary.biomarker_candidates / total) * 100, 1)},
        {"stage": "MRI Candidates", "count": summary.mri_candidates, "conversion_rate": round((summary.mri_candidates / total) * 100, 1)},
        {"stage": "PET Candidates", "count": summary.pet_candidates, "conversion_rate": round((summary.pet_candidates / total) * 100, 1)},
    ]

    results = db.query(PrioritizationResult.recommended_next_stage).all()
    next_stage_counts = {}
    for r in results:
        nst = r[0]
        next_stage_counts[nst] = next_stage_counts.get(nst, 0) + 1
    
    recommended_next = [
        {"stage": k, "count": v, "percentage": round((v / total) * 100, 1)}
        for k, v in next_stage_counts.items()
    ]

    scores = [r[0] for r in db.query(PrioritizationResult.priority_score).all()]
    bins = [0] * 10
    for s in scores:
        idx = min(9, int(s // 10))
        bins[idx] += 1

    score_histogram = [
        {"range": f"{i*10}-{i*10+9}", "count": bins[i]}
        for i in range(10)
    ]

    ages = [p.age for p in db.query(Patient.age).all()]
    age_groups = {"<60": 0, "60-69": 0, "70-79": 0, "80+": 0}
    for a in ages:
        if a < 60: age_groups["<60"] += 1
        elif a < 70: age_groups["60-69"] += 1
        elif a < 80: age_groups["70-79"] += 1
        else: age_groups["80+"] += 1

    age_distribution = [
        {"group": k, "count": v, "percentage": round((v / total) * 100, 1)}
        for k, v in age_groups.items()
    ]

    missing_blood = db.query(BloodMarkers).filter(BloodMarkers.ptau_181.is_(None)).count()
    missing_mri = db.query(ImagingFeatures).filter(ImagingFeatures.hippocampal_volume_mm3.is_(None)).count()
    missing_cog = db.query(CognitiveAssessment).filter(CognitiveAssessment.mmse_score.is_(None)).count()

    missing_summary = [
        {"domain": "Blood Biomarkers", "missing_count": missing_blood, "missing_pct": round((missing_blood / total) * 100, 1)},
        {"domain": "MRI Structural Data", "missing_count": missing_mri, "missing_pct": round((missing_mri / total) * 100, 1)},
        {"domain": "Cognitive Scores", "missing_count": missing_cog, "missing_pct": round((missing_cog / total) * 100, 1)},
    ]

    return AnalyticsResponse(
        summary=summary,
        priority_distribution=priority_dist,
        stage_breakdown=stage_breakdown,
        funnel=funnel,
        recommended_next_stages=recommended_next,
        score_histogram=score_histogram,
        age_distribution=age_distribution,
        missing_data_summary=missing_summary
    )

@router.get("/resource-capacity", response_model=ResourceCapacityResponse)
def get_resource_capacity(
    mri_capacity: int = Query(15, ge=1),
    pet_capacity: int = Query(5, ge=1),
    biomarker_capacity: int = Query(40, ge=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_database_if_empty(db)
    summary = get_dashboard_summary(db, current_user=current_user)

    mri_demand = summary.mri_candidates
    pet_demand = summary.pet_candidates
    biomarker_demand = summary.biomarker_candidates

    mri_util = round((mri_demand / mri_capacity) * 100.0, 1)
    pet_util = round((pet_demand / pet_capacity) * 100.0, 1)
    bio_util = round((biomarker_demand / biomarker_capacity) * 100.0, 1)

    mri_wait = round(mri_demand / mri_capacity, 1)
    pet_wait = round(pet_demand / pet_capacity, 1)

    # Check capacity notification thresholds
    if mri_util >= 80.0:
        notify_mri_capacity_threshold(db, utilization=mri_util, threshold=80.0)

    if pet_demand > 15:
        notify_pet_queue_increase(db, current_count=pet_demand, previous_count=15)

    return ResourceCapacityResponse(
        config=ResourceCapacityConfig(
            mri_daily_capacity=mri_capacity,
            pet_daily_capacity=pet_capacity,
            biomarker_daily_capacity=biomarker_capacity
        ),
        mri_demand=mri_demand,
        pet_demand=pet_demand,
        biomarker_demand=biomarker_demand,
        mri_utilization_pct=mri_util,
        pet_utilization_pct=pet_util,
        biomarker_utilization_pct=bio_util,
        mri_wait_days=mri_wait,
        pet_wait_days=pet_wait
    )

@router.get("/impact")
def get_impact_savings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    seed_database_if_empty(db)
    total_screened = db.query(Patient).count()
    summary = get_dashboard_summary(db, current_user=current_user)

    # Calculate un-prioritized baseline vs AI prioritized pathway
    unprioritized_pet_scans = total_screened
    unprioritized_mri_scans = total_screened

    ai_pet_scans = summary.pet_candidates
    ai_mri_scans = summary.mri_candidates

    pet_reduction_pct = round(((unprioritized_pet_scans - ai_pet_scans) / (unprioritized_pet_scans or 1)) * 100.0, 1)
    mri_reduction_pct = round(((unprioritized_mri_scans - ai_mri_scans) / (unprioritized_mri_scans or 1)) * 100.0, 1)

    # Cost savings estimation (avg PET scan $3,000, avg MRI $1,200)
    pet_cost_saved = (unprioritized_pet_scans - ai_pet_scans) * 3000
    mri_cost_saved = (unprioritized_mri_scans - ai_mri_scans) * 1200
    total_cost_saved = pet_cost_saved + mri_cost_saved

    return {
        "total_screened": total_screened,
        "pet_scans_avoided": unprioritized_pet_scans - ai_pet_scans,
        "pet_reduction_pct": pet_reduction_pct,
        "mri_scans_avoided": unprioritized_mri_scans - ai_mri_scans,
        "mri_reduction_pct": mri_reduction_pct,
        "estimated_cost_saved_usd": total_cost_saved,
        "mri_wait_days_saved": round((total_screened - ai_mri_scans) / 15.0, 1),
        "disclaimer": "Prototype simulation metrics — estimated operational savings compared to un-triaged population evaluation."
    }
