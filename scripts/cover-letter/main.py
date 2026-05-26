import argparse
import json
from pathlib import Path

from cover_letter_creator import CoverLetterCreator


def parse_args():
    parser = argparse.ArgumentParser(description="Generate Cover Letter PDF")
    parser.add_argument("--input", required=True, help="Path to JSON payload")
    parser.add_argument("--lang", required=True, choices=["en", "de"])
    parser.add_argument("--output", required=True, help="Output PDF path")
    return parser.parse_args()


def main():
    args = parse_args()

    with Path(args.input).open(encoding="utf-8") as f:
        payload = json.load(f)

    creator = CoverLetterCreator(args.output, payload, lang=args.lang)
    creator.save_pdf()


if __name__ == "__main__":
    main()
