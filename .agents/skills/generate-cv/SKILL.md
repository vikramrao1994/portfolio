---
name: generate-cv
description: Use when modifying, debugging, or extending the PDF CV generation system (Python scripts or the /api/cv route).
---

# Generate CV

## How it works
1. `GET /api/cv?lang=en|de` is called
2. Route handler (`src/app/api/cv/route.ts`) fetches portfolio data
3. Writes data to a temp JSON file
4. Calls the appropriate Python script via child process
5. Returns the PDF as a binary response
6. Response is cached server-side for 10 minutes

## Python scripts
- `scripts/cv/generate_cv_en.py` — English PDF
- `scripts/cv/generate_cv_de.py` — German PDF
- Dependencies: `requirements.txt` (ReportLab)

## Local testing
```bash
# Via API
curl "http://localhost:3000/api/cv?lang=en" --output cv_en.pdf
curl "http://localhost:3000/api/cv?lang=de" --output cv_de.pdf

# Direct Python
python scripts/cv/generate_cv_en.py
python scripts/cv/generate_cv_de.py
```

## Adding content to the CV
1. Update the Python script to include the new field
2. Ensure the field is included in the data passed from the API route
3. Match the JSON key names between the route handler and the Python script
4. Test both EN and DE variants

## Modifying layout/styling
- CV layout is controlled entirely by ReportLab in the Python scripts
- No CSS — use ReportLab's `Paragraph`, `Table`, `Spacer` primitives
- Font, color, and spacing constants are defined at the top of each script

## Constraints
- Both `generate_cv_en.py` and `generate_cv_de.py` must be kept in sync structurally
- Python dependencies must be installed in the Docker image (via `requirements.txt`)
- API route caches for 10min — clear cache by restarting the server for testing
- Never hardcode personal data in the Python scripts — always read from the JSON input

## Files
- `src/app/api/cv/route.ts` — API handler + caching
- `scripts/cv/generate_cv_en.py`
- `scripts/cv/generate_cv_de.py`
- `requirements.txt` — Python dependencies

## Anti-Patterns
- Hardcoding CV content in Python scripts instead of reading from JSON
- Modifying only one language script when making structural changes
- Forgetting to add new Python dependencies to `requirements.txt`
