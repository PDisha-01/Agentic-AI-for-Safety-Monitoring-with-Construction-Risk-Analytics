import json
from detection.risk_assessment import analyze_site_image

print("=" * 60)
print("TEST 1: Automated AI Analysis (Milestone 2 - CV Derived)")
print("=" * 60)
auto_result = analyze_site_image("test_images/construction_site_test.png")
display_auto = {k: v for k, v in auto_result.items() if k != "annotated_image"}
display_auto["annotated_image_preview"] = f"<data:image/jpeg;base64,{len(auto_result['annotated_image'])} chars>"
print(json.dumps(display_auto, indent=2))

print("\n" + "=" * 60)
print("TEST 2: Manual Parameter Override Mode")
print("=" * 60)
manual_result = analyze_site_image(
    image_path="test_images/construction_site_test.png",
    hazard_severity=4,
    likelihood=3,
    worker_exposure=4,
    safety_compliance=2,
)
display_manual = {k: v for k, v in manual_result.items() if k != "annotated_image"}
display_manual["annotated_image_preview"] = f"<data:image/jpeg;base64,{len(manual_result['annotated_image'])} chars>"
print(json.dumps(display_manual, indent=2))
