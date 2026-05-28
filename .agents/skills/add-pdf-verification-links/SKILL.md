---
name: add-pdf-verification-links
description: Use when adding, modifying, or debugging clickable verification/reference hyperlinks in CV PDFs.
---

# Add PDF Verification Links

## Overview

CV PDFs support clickable hyperlinks for verification (e.g., certification URLs, credential links).
This is implemented in the Python ReportLab renderer via `HyperlinkedImage`.

**Cover-letter PDFs must NOT include verification links.**

## How it works

1. A DB record contains a `url` field (e.g., a certification entry with a credential URL)
2. `siteContent` aggregation includes the `url` in the JSON payload passed to the API route
3. `resume_creator.py` calls `_is_valid_cert_url(url)` to validate the URL before rendering
4. Valid URLs are rendered as clickable elements using `HyperlinkedImage` from `scripts/cv/image.py`

## Key files

| File | Purpose |
|---|---|
| `scripts/cv/resume_creator.py` | Main renderer — calls `_is_valid_cert_url`, renders `HyperlinkedImage` |
| `scripts/cv/image.py` | `HyperlinkedImage` — ReportLab Flowable with embedded hyperlink |
| `src/server/siteContent.ts` | Includes `url` fields from DB in the site content aggregate |
| `src/app/api/cv/route.ts` | Passes full SiteSchema JSON to the Python renderer |

## Adding a verification link to a new entity

1. Add a `url TEXT` column to the DB table (`db/schema.sql`)
2. Run a migration (`database-migration` skill)
3. Include the `url` field in the Zod schema (`src/lib/schemas.ts`)
4. Include it in the siteContent query (`src/server/siteContent.ts`)
5. In `resume_creator.py`, call `_is_valid_cert_url(entry.get("url"))` before rendering
6. If valid, wrap the element with `HyperlinkedImage` or a `Paragraph` with a `<link>` tag

## URL validation rules (`_is_valid_cert_url`)

- Must be a non-empty string
- Must have scheme `http` or `https`
- Must have a non-empty `netloc`
- Invalid or missing URLs are silently skipped — no error thrown

## ReportLab hyperlink patterns

```python
# Clickable text link
from reportlab.platypus import Paragraph
linked = Paragraph('<link href="https://example.com">Verify credential</link>', style)

# Clickable image/badge
from image import HyperlinkedImage
img = HyperlinkedImage("path/to/badge.png", url="https://example.com", width=50, height=50)
```

## Constraints

- Only `http://` and `https://` URLs are valid — file paths and relative URLs are rejected
- Cover-letter PDFs must never include hyperlinks
- Invalid URLs are silently skipped — do not raise exceptions in the renderer
- URL fields should be optional in the DB schema and Zod schema
