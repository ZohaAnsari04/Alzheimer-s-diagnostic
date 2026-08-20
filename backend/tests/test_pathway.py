from app.services.pathway_engine import recommend_next_stage

def test_pathway_recommendation_matrix():
    assert recommend_next_stage("Cognitive Screening", "HIGH", 85.0) == "Blood-Based Biomarkers"
    assert recommend_next_stage("Cognitive Screening", "MEDIUM", 55.0) == "Blood-Based Biomarkers — Review"
    assert recommend_next_stage("Cognitive Screening", "LOW", 25.0) == "Continue Screening Review"

    assert recommend_next_stage("Blood-Based Biomarkers", "HIGH", 80.0) == "MRI Evaluation"
    assert recommend_next_stage("MRI Evaluation", "HIGH", 82.0) == "PET Scan Prioritization"
