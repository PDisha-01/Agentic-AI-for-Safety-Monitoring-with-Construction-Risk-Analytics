import json
import os
from pathlib import Path
import shutil
import time

PROJECT_ROOT = Path(__file__).resolve().parent
os.environ["YOLO_CONFIG_DIR"] = str(PROJECT_ROOT / ".ultralytics")
os.environ["MPLCONFIGDIR"] = str(PROJECT_ROOT / ".matplotlib_cache")

from ultralytics import YOLO
DATA_YAML = PROJECT_ROOT / "datasets" / "construction-ppe" / "data.yaml"
MODEL_PATH = PROJECT_ROOT / "models" / "ppe_best.pt"
REPORTS_DIR = PROJECT_ROOT / "reports"
FIGURES_DIR = REPORTS_DIR / "figures"


def evaluate_ppe_model(split: str = "test", batch_size: int = 16, imgsz: int = 416):
    """Run YOLO evaluation on the construction PPE dataset and export metrics."""
    os.environ["YOLO_CONFIG_DIR"] = str(PROJECT_ROOT / ".ultralytics")
    os.environ["MPLCONFIGDIR"] = str(PROJECT_ROOT / ".matplotlib_cache")
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    FIGURES_DIR.mkdir(parents=True, exist_ok=True)

    if not MODEL_PATH.is_file():
        raise FileNotFoundError(f"Model weights not found at {MODEL_PATH}")
    if not DATA_YAML.is_file():
        raise FileNotFoundError(f"Dataset config not found at {DATA_YAML}")

    print(f"Loading PPE model: {MODEL_PATH}")
    model = YOLO(str(MODEL_PATH))

    start_time = time.time()
    print(f"Evaluating model on '{split}' split (imgsz={imgsz}, batch={batch_size})...")
    metrics = model.val(
        data=str(DATA_YAML),
        split=split,
        imgsz=imgsz,
        batch=batch_size,
        device="cpu",
        plots=True,
        save_json=False,
        verbose=False,
    )
    eval_duration = round(time.time() - start_time, 2)

    # Extract overall metrics
    overall_precision = round(float(metrics.box.mp), 4)
    overall_recall = round(float(metrics.box.mr), 4)
    overall_map50 = round(float(metrics.box.map50), 4)
    overall_map50_95 = round(float(metrics.box.map), 4)

    # Extract per-class metrics
    class_metrics = {}
    for idx, class_name in model.names.items():
        class_metrics[class_name] = {
            "class_id": idx,
            "precision": round(float(metrics.box.p[idx]), 4),
            "recall": round(float(metrics.box.r[idx]), 4),
            "mAP50": round(float(metrics.box.ap50[idx]), 4),
            "mAP50_95": round(float(metrics.box.ap[idx]), 4),
        }

    # Extract latency speeds
    speed_info = metrics.speed  # preprocess, inference, loss, postprocess

    results_data = {
        "model_name": "YOLO11n-Construction-PPE",
        "model_path": str(MODEL_PATH.relative_to(PROJECT_ROOT)),
        "dataset_split": split,
        "evaluation_duration_seconds": eval_duration,
        "overall_metrics": {
            "precision": overall_precision,
            "recall": overall_recall,
            "mAP50": overall_map50,
            "mAP50_95": overall_map50_95,
        },
        "per_class_metrics": class_metrics,
        "inference_speed_ms": {
            "preprocess": round(float(speed_info.get("preprocess", 0.0)), 2),
            "inference": round(float(speed_info.get("inference", 0.0)), 2),
            "postprocess": round(float(speed_info.get("postprocess", 0.0)), 2),
            "total_per_image": round(
                float(speed_info.get("preprocess", 0.0))
                + float(speed_info.get("inference", 0.0))
                + float(speed_info.get("postprocess", 0.0)),
                2,
            ),
        },
    }

    # Save to JSON
    json_path = REPORTS_DIR / "model_evaluation_metrics.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results_data, f, indent=2)
    print(f"Metrics saved to {json_path}")

    # Save to CSV
    csv_path = REPORTS_DIR / "model_evaluation_metrics.csv"
    with open(csv_path, "w", encoding="utf-8") as f:
        f.write("Class,Precision,Recall,mAP50,mAP50_95\n")
        f.write(
            f"ALL,{overall_precision},{overall_recall},{overall_map50},{overall_map50_95}\n"
        )
        for name, data in class_metrics.items():
            f.write(
                f"{name},{data['precision']},{data['recall']},{data['mAP50']},{data['mAP50_95']}\n"
            )
    print(f"Metrics saved to {csv_path}")

    # Copy plots to figures directory
    val_run_dir = Path(metrics.save_dir)
    if val_run_dir.exists():
        for file in val_run_dir.glob("*.png"):
            shutil.copy2(file, FIGURES_DIR / file.name)
        for file in val_run_dir.glob("*.jpg"):
            shutil.copy2(file, FIGURES_DIR / file.name)

    # Print summary table
    print("\n" + "=" * 75)
    print("       CONSTRUCTION PPE MODEL EVALUATION SUMMARY (MILESTONE 2)       ")
    print("=" * 75)
    print(f"{'Class':<12} | {'Precision':<10} | {'Recall':<10} | {'mAP@50':<10} | {'mAP@50-95':<10}")
    print("-" * 75)
    print(
        f"{'ALL (Overall)':<12} | {overall_precision:<10.2%} | {overall_recall:<10.2%} | {overall_map50:<10.2%} | {overall_map50_95:<10.2%}"
    )
    print("-" * 75)
    for name, data in class_metrics.items():
        print(
            f"{name:<12} | {data['precision']:<10.2%} | {data['recall']:<10.2%} | {data['mAP50']:<10.2%} | {data['mAP50_95']:<10.2%}"
        )
    print("=" * 75)
    print(f"Average Inference Latency: {results_data['inference_speed_ms']['total_per_image']} ms per frame")
    print(f"Plots & Curves directory: {FIGURES_DIR}")
    print("=" * 75)

    return results_data


if __name__ == "__main__":
    evaluate_ppe_model()
