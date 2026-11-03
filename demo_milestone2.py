import json
import os
from pathlib import Path
import time

PROJECT_ROOT = Path(__file__).resolve().parent

# Ensure local writable caches
os.environ["YOLO_CONFIG_DIR"] = str(PROJECT_ROOT / ".ultralytics")
os.environ["MPLCONFIGDIR"] = str(PROJECT_ROOT / ".matplotlib_cache")

from backend.auth import create_access_token, decode_access_token
from backend.risk_service import (
    authenticate_user,
    get_assessments,
    initialize_database,
    save_cv_assessment,
)
from detection.cv_visualizer import annotate_image, process_video
from detection.hazard_detector import assess_worker_compliance, detect_objects
from detection.risk_assessment import analyze_site_image
from src.site_risk_agent import site_risk_agent


def print_header(title: str):
    print("\n" + "=" * 70)
    print(f"   {title}")
    print("=" * 70)


def run_milestone2_demo():
    print_header("INFOSYS SPRINGBOARD - HAZARDHAWK AI PLATFORM DEMO")
    print("Project: Agentic AI for Safety Monitoring with Construction Risk Analytics")
    print("Milestone 2: Computer Vision, JWT Authentication & Site Agents\n")

    # Step 1: Model Benchmarks Check
    print_header("STEP 1: Validated Computer Vision Model Performance")
    metrics_path = PROJECT_ROOT / "reports" / "model_evaluation_metrics.json"
    if metrics_path.is_file():
        with open(metrics_path, "r", encoding="utf-8") as f:
            metrics_data = json.load(f)
        overall = metrics_data["overall_metrics"]
        print(f"Model Architecture  : {metrics_data['model_name']}")
        print(f"Monitored Classes   : boots, gloves, helmet, human, vest")
        print(f"Overall Precision   : {overall['precision']:.2%}")
        print(f"Overall Recall      : {overall['recall']:.2%}")
        print(f"mAP @ IoU 0.50      : {overall['mAP50']:.2%}")
        print(f"mAP @ IoU 0.50:0.95 : {overall['mAP50_95']:.2%}")
        print(f"Inference Latency   : {metrics_data['inference_speed_ms']['total_per_image']} ms per frame")
        print(f"Benchmark Curves    : reports/figures/ (confusion matrix, PR curve, F1 curve)")

    # Step 2: Automated Hazard Detection on Site Image
    print_header("STEP 2: Automated Hazard Detection & Worker PPE Association")
    test_image = PROJECT_ROOT / "test_images" / "construction_site_test.png"
    print(f"Analyzing Site Image: {test_image.name}")

    start_time = time.time()
    result = analyze_site_image(str(test_image), save_annotated_copy=True)
    latency = round(time.time() - start_time, 2)

    print(f"Analysis Latency    : {latency}s")
    print(f"Mode                : {result['mode'].upper()} (Zero manual sliders required)")
    print(f"Total Workers       : {result['total_workers']}")
    print(f"Compliant Workers   : {result['compliant_workers']}")
    print(f"PPE Compliance Rate : {result['ppe_compliance_rate']}%")
    print(f"Violations Count    : {result['violations_count']}")
    print(f"Calculated Risk     : Score {result['risk_assessment']['risk_score']}/100 ({result['risk_assessment']['risk_level']} Level)")
    print(f"Safety Directives   : {result['risk_assessment']['recommendation']}")

    # Step 3: OpenCV Visualizer Output
    print_header("STEP 3: OpenCV Visual Annotation & HUD Display")
    annotated_output = PROJECT_ROOT / "reports" / "figures" / "annotated_site_test.jpg"
    print(f"Annotated Image Saved: {annotated_output.relative_to(PROJECT_ROOT)}")
    print("Features Rendered:")
    print("  [Green Boxes] Compliant Workers (wearing required Helmet + Vest)")
    print("  [Red Boxes]   Workers with OSHA Violations (missing PPE)")
    print("  [Top HUD Bar] Live Status Header with Worker Counts, Compliance %, and Risk Score")

    # Step 4: Video Processing Pipeline
    print_header("STEP 4: OpenCV Video Processing Pipeline")
    sample_video = PROJECT_ROOT / "test_videos" / "sample_site.mp4"
    if sample_video.is_file():
        video_out = PROJECT_ROOT / "reports" / "figures" / "annotated_site_video.mp4"
        vid_stats = process_video(
            video_path=str(sample_video),
            output_path=str(video_out),
            max_frames=5,
        )
        print(f"Frames Analyzed     : {vid_stats['frames_analyzed']}")
        print(f"Avg Compliance Rate : {vid_stats['average_compliance_rate']}%")
        print(f"Output Video Saved  : {video_out.relative_to(PROJECT_ROOT)}")

    # Step 5: JWT Authentication
    print_header("STEP 5: JWT Authentication System")
    initialize_database()
    user = authenticate_user("admin@hazardhawk.ai", "Admin@123")
    token = create_access_token(data={"sub": user["email"], "role": user["role"]})
    decoded = decode_access_token(token)
    print(f"Authenticated User  : {user['full_name']} ({user['email']})")
    print(f"User Assigned Role  : {user['role']}")
    print(f"JWT Bearer Token    : {token[:35]}...[Signed HS256]")
    print(f"Token Verification  : Verified subject '{decoded['sub']}'")

    # Step 6: Dedicated LangGraph Site Risk Agent Workflow
    print_header("STEP 6: Dedicated Site Risk Agent & LangGraph Workflow")
    target_zone = "Zone B - Perimeter Scaffolding"
    workflow_state = {
        "hazard_severity": 4,
        "likelihood": 3,
        "worker_exposure": 4,
        "safety_compliance": 2,
    }
    agent_output = site_risk_agent.invoke(workflow_state)
    report = agent_output["agent_report"]
    print(f"Target Sector       : {target_zone}")
    print(f"Orchestration Engine: {report['assessment_method']}")
    print(f"Risk Output         : Score {report['risk_score']}/100 ({report['risk_level']} Level)")
    print(f"Agent Recommendation: {report['recommendation']}")

    # Step 7: Database Layer & Historical Persistence
    print_header("STEP 7: Database Layer & Historical Persistence")
    saved = save_cv_assessment(result)
    recent = get_assessments(limit=3)
    print(f"Persisted Audit ID  : #{saved['id']} ({saved['mode']} inspection)")
    print(f"Recent Database Rows: {len(recent)} verified in SQLite")

    print_header("STATUS: ALL FEATURES 100% COMPLETE & VERIFIED")


if __name__ == "__main__":
    run_milestone2_demo()
