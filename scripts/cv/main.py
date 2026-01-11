import json
import os
from resume_creator import Resume_Creator


def output_path(prefix: str) -> str:
    # Keep behavior consistent with your existing pipeline (writes into ./public)
    return f"public/{prefix}"


DATA_PATH = os.getenv("CV_DATA_PATH", "src/data/data.json")
OUTPUT_PREFIX = os.getenv("CV_OUTPUT_PREFIX", "CV_Vikram")
LANG = os.getenv("CV_LANG")  # optional: "en" or "de"

with open(DATA_PATH, "r", encoding="utf-8") as json_file:
    data = json.load(json_file)

langs = [LANG] if LANG in ("en", "de") else ["en", "de"]

for lang in langs:
    filename = output_path(f"{OUTPUT_PREFIX}_{lang.upper()}")
    resume = Resume_Creator(filename, data, lang=lang)
    resume.save_resume()
