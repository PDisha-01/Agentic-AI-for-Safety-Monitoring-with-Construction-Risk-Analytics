def calculate_risk_score(
    hazard_severity: int,
    likelihood: int,
    worker_exposure: int,
    safety_compliance: int,
) -> dict:
    """
    Calculate a construction safety risk score from 0 to 100.

    Inputs:
        hazard_severity: 1-5
        likelihood: 1-5
        worker_exposure: 1-5
        safety_compliance: 1-5 (1 = poor, 5 = excellent)
    """
    values = {
        "hazard_severity": hazard_severity,
        "likelihood": likelihood,
        "worker_exposure": worker_exposure,
        "safety_compliance": safety_compliance,
    }

    for name, value in values.items():
        if not isinstance(value, int) or isinstance(value, bool) or not 1 <= value <= 5:
            raise ValueError(f"{name} must be an integer between 1 and 5.")

    # Higher severity, likelihood and exposure increase risk.
    # Better safety compliance reduces risk.
    raw_score = (
        hazard_severity * 0.35
        + likelihood * 0.30
        + worker_exposure * 0.20
        + (6 - safety_compliance) * 0.15
    ) / 5 * 100

    score = round(raw_score)

    if score >= 80:
        level = "Critical"
        recommendation = "Stop the affected work and implement immediate controls."
    elif score >= 60:
        level = "High"
        recommendation = "Address hazards promptly before continuing affected work."
    elif score >= 40:
        level = "Medium"
        recommendation = "Implement preventive controls and monitor the hazard."
    else:
        level = "Low"
        recommendation = "Maintain existing controls and continue routine monitoring."

    return {
        "risk_score": score,
        "risk_level": level,
        "recommendation": recommendation,
    }
