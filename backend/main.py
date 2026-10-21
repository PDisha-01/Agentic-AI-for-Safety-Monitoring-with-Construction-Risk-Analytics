from pathlib import Path
import tempfile

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from detection.risk_assessment import analyze_site_image

app = FastAPI(title="Construction Safety Risk Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/")
def health_check():
    return {
        "status": "online",
        "message": "Construction Safety Risk Analytics API is running"
    }


@app.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    hazard_severity: int = Form(...),
    likelihood: int = Form(...),
    worker_exposure: int = Form(...),
    safety_compliance: int = Form(...),
):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(
            status_code=400,
            detail="Upload a JPEG, PNG, or WebP image."
        )

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
        suffix = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
        }[file.content_type]

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=suffix, delete=False
        ) as temp_file:
            temp_path = Path(temp_file.name)

            while chunk := await file.read(1024 * 1024):
                temp_file.write(chunk)

        return analyze_site_image(
            image_path=str(temp_path),
            hazard_severity=hazard_severity,
            likelihood=likelihood,
            worker_exposure=worker_exposure,
            safety_compliance=safety_compliance,
        )

    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    finally:
        await file.close()
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)


# --- Site Risk Agent and saved assessments API ---
from pydantic import BaseModel, Field
from backend.risk_service import (
    initialize_database,
    assess_and_save,
    get_assessments,
)


class RiskAssessmentRequest(BaseModel):
    hazard_severity: int = Field(ge=1, le=5)
    likelihood: int = Field(ge=1, le=5)
    worker_exposure: int = Field(ge=1, le=5)
    safety_compliance: int = Field(ge=1, le=5)


@app.on_event("startup")
def setup_risk_database():
    initialize_database()


@app.post("/assess")
def assess_site(request: RiskAssessmentRequest):
    try:
        return assess_and_save(
            hazard_severity=request.hazard_severity,
            likelihood=request.likelihood,
            worker_exposure=request.worker_exposure,
            safety_compliance=request.safety_compliance,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.get("/assessments")
def list_assessments(limit: int = 20):
    if not 1 <= limit <= 100:
        raise HTTPException(
            status_code=422,
            detail="limit must be between 1 and 100.",
        )
    return {"assessments": get_assessments(limit)}
