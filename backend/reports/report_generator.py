from reportlab.platypus import SimpleDocTemplate
from reportlab.platypus import Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import os

styles = getSampleStyleSheet()


def generate_report(data):

    os.makedirs("generated_reports", exist_ok=True)

    filename = f"generated_reports/{data['filename']}.pdf"

    pdf = SimpleDocTemplate(filename)

    elements = []

    elements.append(
        Paragraph(
            "<b>AI Infrastructure Crack Detection Report</b>",
            styles["Title"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Image:</b> {data['filename']}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Prediction:</b> {data['prediction']}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Confidence:</b> {data['confidence']}%",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Structure:</b> {data['structure']}",
            styles["Normal"]
        )
    )

    elements.append(
        Paragraph(
            f"<b>Model:</b> {data['model_name']}",
            styles["Normal"]
        )
    )

    pdf.build(elements)

    return filename