
from resume_creator import Resume_Creator
import argparse
import json
from pathlib import Path

def generate_pdf(payload: dict, lang: str, output_path: Path):
    resume = Resume_Creator(output_path, payload, lang=lang)
    resume.save_resume()
    pass

def parse_args():
    parser = argparse.ArgumentParser(description="Generate CV PDF")
    parser.add_argument("--input", required=True, help="Path to JSON payload")
    parser.add_argument("--lang", required=True, choices=["en", "de"])
    parser.add_argument("--output", required=True, help="Output PDF path")
    return parser.parse_args()


def main():
    args = parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    lang = args.lang

    with input_path.open(encoding="utf-8") as f:
        data = json.load(f)

    generate_pdf(data, lang, output_path)


if __name__ == "__main__":
    main()