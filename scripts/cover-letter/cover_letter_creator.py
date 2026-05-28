import os
import re
import sys
from datetime import datetime
from io import BytesIO
from urllib.parse import urlparse

import requests

# Allow importing shared components from the cv scripts directory
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cv"))

from line_generator import MCLine
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_JUSTIFY
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer

# ── Constants (mirror CV design system) ─────────────────────────────────────
MARGIN_VERTICAL = 20
MARGIN_HORIZONTAL = 30
HEADING_COLOR = HexColor("#6969e5")
GENERAL_FONT_SIZE = 9
NAME_FONT_SIZE = 16
SPACER_VALUE = 6
FOOTER_FONT_SIZE = 7

PAGE_WIDTH = letter[0]
CONTENT_WIDTH = PAGE_WIDTH - 2 * MARGIN_HORIZONTAL  # 552 pt

ALLOWED_SIGNATURE_HOSTS = {"firebasestorage.googleapis.com"}
MAX_SIGNATURE_BYTES = 500 * 1024  # 500 KB
SIGNATURE_TARGET_WIDTH = 140  # points


# ── Helpers ──────────────────────────────────────────────────────────────────

def sanitize(text: str) -> str:
    """Escape Claude-supplied text for safe use inside ReportLab Paragraph markup."""
    if not isinstance(text, str):
        return ""
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    return text


def footer_cb(canvas, doc):
    canvas.saveState()
    canvas.setFontSize(FOOTER_FONT_SIZE)
    canvas.setFillColor(HexColor("#888888"))
    canvas.drawString(
        MARGIN_HORIZONTAL,
        15,
        "Generated on %s" % datetime.strftime(datetime.now(), "%d.%m.%Y"),
    )
    canvas.restoreState()


def make_first_page_cb(date_str: str):
    def first_page_cb(canvas, doc):
        footer_cb(canvas, doc)
        if date_str:
            canvas.saveState()
            canvas.setFontSize(GENERAL_FONT_SIZE)
            canvas.setFillColor(HexColor("#000000"))
            y = letter[1] - MARGIN_VERTICAL - GENERAL_FONT_SIZE
            canvas.drawRightString(PAGE_WIDTH - MARGIN_HORIZONTAL, y, date_str)
            canvas.restoreState()
    return first_page_cb


def fetch_signature_image(url: str):
    """Fetch signature PNG from an allowlisted Firebase URL into memory.

    Returns (BytesIO, orig_width, orig_height) on success, or None on any
    validation/fetch failure. Never writes to disk.
    """
    try:
        parsed = urlparse(url)

        if parsed.scheme != "https":
            print("[signature] rejected: not HTTPS", file=sys.stderr)
            return None

        if parsed.hostname not in ALLOWED_SIGNATURE_HOSTS:
            print("[signature] rejected: hostname not allowlisted (%s)" % parsed.hostname, file=sys.stderr)
            return None

        response = requests.get(url, timeout=10)
        response.raise_for_status()

        content_type = response.headers.get("content-type", "")
        if "image/png" not in content_type:
            print("[signature] rejected: unexpected content-type %r" % content_type, file=sys.stderr)
            return None

        if len(response.content) > MAX_SIGNATURE_BYTES:
            print(
                "[signature] rejected: size %d bytes exceeds 500 KB limit" % len(response.content),
                file=sys.stderr,
            )
            return None

        from PIL import Image as PILImage

        pil_img = PILImage.open(BytesIO(response.content))
        orig_w, orig_h = pil_img.size

        print(
            "[signature] downloaded OK (%d bytes, %dx%d)" % (len(response.content), orig_w, orig_h),
            file=sys.stderr,
        )
        return BytesIO(response.content), orig_w, orig_h

    except Exception as exc:
        print("[signature] fetch failed: %s" % exc, file=sys.stderr)
        return None


# ── Renderer ─────────────────────────────────────────────────────────────────

class CoverLetterCreator:

    def __init__(self, file_name: str, payload: dict, lang: str = "en"):
        self.file_name = file_name
        self.payload = payload
        self.lang = lang
        self.data = []

        self.pdf_buffer = BytesIO()
        self.doc = SimpleDocTemplate(
            self.pdf_buffer,
            pageSize=letter,
            rightMargin=MARGIN_HORIZONTAL,
            leftMargin=MARGIN_HORIZONTAL,
            topMargin=MARGIN_VERTICAL,
            bottomMargin=30,
        )

        base = getSampleStyleSheet()["Normal"]
        self.s_name = ParagraphStyle(
            "cl_name", parent=base, fontSize=NAME_FONT_SIZE,
            textColor=HEADING_COLOR, spaceBefore=0, spaceAfter=2,
        )
        self.s_contact = ParagraphStyle(
            "cl_contact", parent=base, fontSize=GENERAL_FONT_SIZE - 1,
        )
        self.s_recipient = ParagraphStyle(
            "cl_recipient", parent=base, fontSize=GENERAL_FONT_SIZE, spaceAfter=1,
        )
        self.s_subject = ParagraphStyle(
            "cl_subject", parent=base, fontSize=GENERAL_FONT_SIZE + 1,
            spaceBefore=2, spaceAfter=2,
        )
        self.s_salutation = ParagraphStyle(
            "cl_salutation", parent=base, fontSize=GENERAL_FONT_SIZE,
        )
        self.s_body = ParagraphStyle(
            "cl_body", parent=base, fontSize=GENERAL_FONT_SIZE,
            alignment=TA_JUSTIFY, leading=14,
        )
        self.s_closing = ParagraphStyle(
            "cl_closing", parent=base, fontSize=GENERAL_FONT_SIZE,
        )

    # ── Section builders ─────────────────────────────────────────────────────

    def add_header(self):
        sender = self.payload["sender"]
        self._date_str = self.payload.get("date", "")

        # Name as a direct Paragraph so it aligns exactly with the left margin
        self.data.append(Paragraph("<b>%s</b>" % sanitize(sender["name"]), self.s_name))
        self.data.append(Spacer(1, 14))

        # Contact line
        contact_parts = []
        if sender.get("phone"):
            contact_parts.append(sanitize(sender["phone"]))
        if sender.get("email"):
            e = sender["email"]
            contact_parts.append(
                '<a href="mailto:%s"><font color="blue">%s</font></a>' % (e, sanitize(e))
            )
        if sender.get("address"):
            contact_parts.append(sanitize(sender["address"]))
        if sender.get("website"):
            w = sender["website"]
            contact_parts.append(
                '<a href="%s"><font color="blue">%s</font></a>' % (w, sanitize(w))
            )

        if contact_parts:
            self.data.append(Paragraph(" &nbsp;·&nbsp; ".join(contact_parts), self.s_contact))

        self.data.append(Spacer(1, 5))
        self.data.append(MCLine(CONTENT_WIDTH, 0))
        self.data.append(Spacer(1, SPACER_VALUE))

    def add_recipient(self):
        recipient = self.payload.get("recipient") or {}
        has_content = False

        if recipient.get("companyName"):
            self.data.append(
                Paragraph("<b>%s</b>" % sanitize(recipient["companyName"]), self.s_recipient)
            )
            has_content = True
        if recipient.get("contactName"):
            self.data.append(
                Paragraph(sanitize(recipient["contactName"]), self.s_recipient)
            )
            has_content = True
        for line in recipient.get("addressLines") or []:
            self.data.append(Paragraph(sanitize(line), self.s_recipient))
            has_content = True

        if has_content:
            self.data.append(Spacer(1, SPACER_VALUE * 2))

    def add_subject(self):
        self.data.append(
            Paragraph("<b>%s</b>" % sanitize(self.payload["subject"]), self.s_subject)
        )
        self.data.append(Spacer(1, SPACER_VALUE))

    def add_salutation(self):
        self.data.append(
            Paragraph(sanitize(self.payload["salutation"]), self.s_salutation)
        )
        self.data.append(Spacer(1, SPACER_VALUE))

    def add_body(self):
        for para in self.payload.get("paragraphs", []):
            self.data.append(Paragraph(sanitize(para), self.s_body))
            self.data.append(Spacer(1, SPACER_VALUE))

    def add_closing(self):
        self.data.append(Spacer(1, SPACER_VALUE))
        self.data.append(
            Paragraph(sanitize(self.payload["closing"]), self.s_closing)
        )

        sig_cfg = self.payload.get("signature")
        if sig_cfg and sig_cfg.get("enabled") and sig_cfg.get("imageUrl"):
            result = fetch_signature_image(sig_cfg["imageUrl"])
            if result is not None:
                buf, orig_w, orig_h = result
                target_w = SIGNATURE_TARGET_WIDTH
                target_h = target_w * orig_h / orig_w
                self.data.append(Spacer(1, SPACER_VALUE))
                self.data.append(Image(buf, width=target_w, height=target_h))
                self.data.append(Spacer(1, SPACER_VALUE))
            else:
                # Fetch failed — leave blank space where signature would appear
                self.data.append(Spacer(1, SPACER_VALUE * 4))
        else:
            # Visual signature not configured — leave blank space
            self.data.append(Spacer(1, SPACER_VALUE * 4))

        self.data.append(
            Paragraph("<b>%s</b>" % sanitize(self.payload["signatureName"]), self.s_closing)
        )

    # ── Output ───────────────────────────────────────────────────────────────

    def save_pdf(self):
        self.add_header()
        self.add_recipient()
        self.add_subject()
        self.add_salutation()
        self.add_body()
        self.add_closing()

        self.doc.build(self.data, onFirstPage=make_first_page_cb(self._date_str))

        output_path = (
            self.file_name
            if self.file_name.endswith(".pdf")
            else self.file_name + ".pdf"
        )
        with open(output_path, "wb") as f:
            f.write(self.pdf_buffer.getbuffer())
        self.pdf_buffer.close()

        print("Cover letter generated at %s" % output_path)
