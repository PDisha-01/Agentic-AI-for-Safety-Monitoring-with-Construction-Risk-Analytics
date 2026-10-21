import json
from detection.risk_assessment import analyze_site_image

result = analyze_site_image(
    image_path="bus.jpg",
    hazard_severity=4,
    likelihood=3,
    worker_exposure=4,
    safety_compliance=2,
)

print(json.dumps(result, indent=2))
