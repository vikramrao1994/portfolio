---
name: generate-cv
description: Use when modifying, debugging, or extending the PDF CV generation system (Python scripts or the /api/cv route).
---

# Generate CV

## How it works

```
POST /api/cv?lang=en|de  (body: SiteSchema JSON)
→ Zod validate SiteSchema
→ write temp JSON to OS temp dir
→ spawn python3 scripts/cv/main.py --input <json> --lang <lang> --output <pdf>
  └── main.py → Resume_Creator (resume_creator.py) → ReportLab PDF
→ return PDF binary (Content-Type: application/pdf)
→ cleanup temp files
```

## Python scripts

| File | Purpose |
|---|---|
| `scripts/cv/main.py` | Entry point — parses args, loads JSON, calls `Resume_Creator` |
| `scripts/cv/resume_creator.py` | ReportLab layout engine |
| `scripts/cv/image.py` | `HyperlinkedImage` — clickable image/logo support |
| `scripts/cv/line_generator.py` | Custom line drawing primitives |
| `requirements.txt` | Python dependencies (ReportLab, python-dateutil) |

## Verification / Reference Hyperlinks

CV PDFs support clickable verification links (e.g., certification URLs):

- `resume_creator.py` checks each cert entry for a valid `url` field via `_is_valid_cert_url()`
- Valid `http://` or `https://` URLs become clickable links in the rendered PDF via `HyperlinkedImage`
- To add a verification link: include a `url` field in the relevant DB record and pass it through `siteContent`
- Cover-letter PDFs must NOT include verification links

## Local testing

```bash
# Via API (POST with site data)
curl -s -X POST "http://localhost:3000/api/cv?lang=en" \
  -H "Content-Type: application/json" \
  -d @data/site-payload.json --output cv_en.pdf

# Direct Python
cd scripts/cv
python3 main.py --input ../../data/site-payload.json --lang en --output /tmp/cv_en.pdf
python3 main.py --input ../../data/site-payload.json --lang de --output /tmp/cv_de.pdf
```

## Adding content to the CV

1. Add the field to the DB schema and siteContent aggregation
2. Pass the field through in the API route body
3. Read the field in `resume_creator.py` from the JSON payload
4. Test both EN and DE variants

## Modifying layout/styling

- All layout is controlled by ReportLab in `resume_creator.py`
- No CSS — use ReportLab `Paragraph`, `Table`, `Spacer` primitives
- Font, color, and spacing constants are at the top of `resume_creator.py`

## Constraints

- Never hardcode personal data in Python scripts — always read from the JSON input
- New Python dependencies must be added to `requirements.txt` (Docker image dependency)
- API route has `dynamic = "force-dynamic"` — no server-side caching
- No shell interpolation — Python is spawned with an args array via `spawn`
- Both renderers (CV + cover-letter) follow the same temp-file pattern — keep in sync

## Anti-Patterns

- Hardcoding CV content in Python instead of reading from JSON payload
- Adding shell-interpolated strings to the `spawn` call in `route.ts`
- Adding verification hyperlinks to cover-letter PDFs
