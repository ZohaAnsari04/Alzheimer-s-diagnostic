from typing import Dict, Any

def recommend_next_stage(current_stage: str, priority_level: str, priority_score: float) -> str:
    """
    Prototype Pathway Recommendation Engine.
    Combines patient's current diagnostic stage with priority score/level.
    
    IMPORTANT: Prototype workflow logic — not a clinical protocol.
    """
    if current_stage == "Cognitive Screening":
        if priority_level == "HIGH":
            return "Blood-Based Biomarkers"
        elif priority_level == "MEDIUM":
            return "Blood-Based Biomarkers — Review"
        else:
            return "Continue Screening Review"
            
    elif current_stage == "Blood-Based Biomarkers":
        if priority_level == "HIGH" or priority_score >= 70.0:
            return "MRI Evaluation"
        elif priority_level == "MEDIUM":
            return "Follow-up Biomarker Review"
        else:
            return "Standard Clinical Follow-up"
            
    elif current_stage == "MRI Evaluation":
        if priority_level == "HIGH" or priority_score >= 75.0:
            return "PET Scan Prioritization"
        elif priority_level == "MEDIUM":
            return "Neurology Specialist Review"
        else:
            return "Routine MRI Tracking"
            
    elif current_stage == "PET Scan Prioritization":
        if priority_level == "HIGH":
            return "Candidate for Advanced Evaluation"
        else:
            return "Comprehensive Clinical Panel"

    return "Continue Screening Review"
