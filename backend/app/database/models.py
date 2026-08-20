from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, unique=True, index=True, nullable=False) # Anonymous ID P-1001, etc.
    age = Column(Integer, nullable=False)
    sex = Column(String, nullable=False) # M / F / Other
    current_stage = Column(String, nullable=False) # Normal, MCI, Mild, Moderate, Severe
    review_status = Column(String, default="Pending Review")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    cognitive_assessment = relationship("CognitiveAssessment", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    clinical_indicators = relationship("ClinicalIndicators", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    blood_markers = relationship("BloodMarkers", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    imaging_features = relationship("ImagingFeatures", back_populates="patient", uselist=False, cascade="all, delete-orphan")
    prioritization_result = relationship("PrioritizationResult", back_populates="patient", uselist=False, cascade="all, delete-orphan")


class CognitiveAssessment(Base):
    __tablename__ = "cognitive_assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_db_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    mmse_score = Column(Float, nullable=True) # 0-30
    moca_score = Column(Float, nullable=True) # 0-30
    cognitive_decline_indicator = Column(Boolean, default=False)
    memory_decline_flag = Column(Boolean, default=False)
    executive_fn_score = Column(Float, nullable=True) # 0-10

    patient = relationship("Patient", back_populates="cognitive_assessment")


class ClinicalIndicators(Base):
    __tablename__ = "clinical_indicators"

    id = Column(Integer, primary_key=True, index=True)
    patient_db_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    comorbidities_count = Column(Integer, default=0)
    family_history_alzheimers = Column(Boolean, default=False)
    medication_adherence = Column(String, default="Good") # Good, Moderate, Poor

    patient = relationship("Patient", back_populates="clinical_indicators")


class BloodMarkers(Base):
    __tablename__ = "blood_markers"

    id = Column(Integer, primary_key=True, index=True)
    patient_db_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    abeta_42_44_ratio = Column(Float, nullable=True)
    ptau_181 = Column(Float, nullable=True)
    ptau_217 = Column(Float, nullable=True)
    nfl = Column(Float, nullable=True)
    apoe4_carrier = Column(Boolean, default=False)

    patient = relationship("Patient", back_populates="blood_markers")


class ImagingFeatures(Base):
    __tablename__ = "imaging_features"

    id = Column(Integer, primary_key=True, index=True)
    patient_db_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    hippocampal_volume_mm3 = Column(Float, nullable=True)
    entorhinal_cortical_thickness = Column(Float, nullable=True)
    ventricle_volume_ratio = Column(Float, nullable=True)
    mri_taken_flag = Column(Boolean, default=False)
    pet_taken_flag = Column(Boolean, default=False)

    patient = relationship("Patient", back_populates="imaging_features")


class PrioritizationResult(Base):
    __tablename__ = "prioritization_results"

    id = Column(Integer, primary_key=True, index=True)
    patient_db_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    priority_score = Column(Float, nullable=False) # 0-100 score
    priority_level = Column(String, nullable=False) # LOW, MEDIUM, HIGH, URGENT
    key_contributing_factor = Column(String, nullable=False)
    recommended_next_stage = Column(String, nullable=False) # Blood Biomarker Confirmation, MRI Triage, Specialist Referral
    confidence_interval_low = Column(Float, nullable=True)
    confidence_interval_high = Column(Float, nullable=True)
    model_version = Column(String, default="baseline-rf-v1.0")
    generated_at = Column(DateTime, default=datetime.utcnow)
    factor_contributions_json = Column(JSON, nullable=True) # JSON list of factor breakdown

    patient = relationship("Patient", back_populates="prioritization_result")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    user = Column(String, nullable=False) # Clinician Dr. Smith, Admin, etc.
    action = Column(String, nullable=False) # Login, View Patient, CSV Upload, Prioritization Run, etc.
    resource = Column(String, nullable=False)
    status = Column(String, default="Success") # Success, Warning, Failed
    details = Column(Text, nullable=True)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False) # Normalized lowercase email
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, nullable=False, default="CLINICIAN") # CLINICIAN, ADMIN, EVALUATOR
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False) # HIGH_PRIORITY_PATIENT, MRI_CAPACITY, PET_QUEUE, CSV_IMPORT_SUCCESS, CSV_IMPORT_FAILURE, MODEL_EVALUATION, SECURITY_AUDIT, SESSION_EXPIRING
    severity = Column(String, nullable=False, default="INFO") # INFO, SUCCESS, WARNING, CRITICAL
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    read_at = Column(DateTime, nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    patient_id = Column(String, nullable=True)
    route = Column(String, nullable=True)
    event_key = Column(String, nullable=True, index=True)
    metadata_json = Column(JSON, nullable=True)

    user = relationship("User", backref="notifications")
