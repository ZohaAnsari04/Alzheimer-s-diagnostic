import sys
import os
import json
import argparse

sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from app.services.synthetic_data import generate_synthetic_patients

def main():
    parser = argparse.ArgumentParser(description="Generate synthetic patient cohort for NeuroPath AI benchmark.")
    parser.add_argument("--count", type=int, default=248, help="Number of synthetic patients (e.g. 50, 100, 248, 500)")
    parser.add_argument("--output", type=str, default="data/seed_patients.json", help="Output file path")
    args = parser.parse_args()

    print(f"Generating synthetic cohort of {args.count} patients...")
    patients = generate_synthetic_patients(args.count)

    output_path = os.path.join(os.path.dirname(__file__), "..", args.output)
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    with open(output_path, "w") as f:
        json.dump(patients, f, indent=2)

    print(f"Successfully saved {len(patients)} synthetic records to {args.output}")

if __name__ == "__main__":
    main()
