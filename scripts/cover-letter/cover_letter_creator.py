import os
import re
import sys
from datetime import datetime
from io import BytesIO

# Allow importing shared components from the cv scripts directory
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "cv"))

from line_generator import MCLine
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table

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
        self.s_date = ParagraphStyle(
            "cl_date", parent=base, fontSize=GENERAL_FONT_SIZE, alignment=TA_RIGHT,
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
        date = self.payload.get("date", "")

        # Name (left) + date (right) on the same row
        name_row = [[
            Paragraph("<b>%s</b>" % sanitize(sender["name"]), self.s_name),
            Paragraph(sanitize(date), self.s_date),
        ]]
        name_table = Table(name_row, colWidths=[CONTENT_WIDTH - 120, 120])
        name_table.setStyle([("VALIGN", (0, 0), (-1, -1), "BOTTOM")])
        self.data.append(name_table)
        self.data.append(Spacer(1, 3))

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
        # Vertical gap where a handwritten signature would go
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

        self.doc.build(self.data, onFirstPage=footer_cb)

        output_path = (
            self.file_name
            if self.file_name.endswith(".pdf")
            else self.file_name + ".pdf"
        )
        with open(output_path, "wb") as f:
            f.write(self.pdf_buffer.getbuffer())
        self.pdf_buffer.close()

        print("✅ Cover letter generated at %s" % output_path)
