# report_generator.py
# Generates a PDF compliance report from the compliance engine's output.
# Input: compliance result dict (from engine.py) + basic product/scan metadata
# Output: a saved PDF file

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from datetime import datetime
import os


def generate_report(
    compliance_result: dict,
    product_name: str,
    scan_id: str,
    output_path: str,
    image_path: str = None
) -> str:
    """
    Generates a PDF compliance report.

    Args:
        compliance_result: output dict from check_compliance()
        product_name: name of the scanned product
        scan_id: unique identifier for this inspection/scan
        output_path: file path to save the generated PDF
        image_path: optional path to the scanned product image to embed

    Returns:
        The output_path where the PDF was saved.
    """

    doc = SimpleDocTemplate(output_path, pagesize=A4,
                             topMargin=20*mm, bottomMargin=20*mm)
    styles = getSampleStyleSheet()
    elements = []

    # ---------- Title ----------
    title_style = ParagraphStyle(
        'TitleStyle', parent=styles['Title'], fontSize=18, spaceAfter=6
    )
    elements.append(Paragraph("PackSure Compliance Report", title_style))
    elements.append(Spacer(1, 4*mm))

    # ---------- Basic Info ----------
    info_data = [
        ["Product Name:", product_name],
        ["Scan ID:", scan_id],
        ["Date:", datetime.now().strftime("%d/%m/%Y %H:%M")],
        ["Overall Status:", compliance_result["overall_status"].replace("_", " ")],
        ["Risk Level:", compliance_result["risk_level"]],
    ]
    info_table = Table(info_data, colWidths=[45*mm, 100*mm])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 8*mm))

    # ---------- Product Image (optional) ----------
    if image_path and os.path.exists(image_path):
        elements.append(Paragraph("Scanned Image", styles['Heading3']))
        elements.append(Spacer(1, 2*mm))
        img = Image(image_path, width=80*mm, height=80*mm)
        elements.append(img)
        elements.append(Spacer(1, 8*mm))

    # ---------- Declaration Checks Table ----------
    elements.append(Paragraph("Declaration Checks", styles['Heading3']))
    elements.append(Spacer(1, 2*mm))

    check_table_data = [["Field", "Status", "Message"]]
    for check in compliance_result["checks"]:
        symbol = "PASS" if check["status"] == "PASS" else (
            "WARN" if check["status"] == "WARNING" else "FAIL"
        )
        check_table_data.append([
            check["field"].replace("_", " ").title(),
            symbol,
            check["message"]
        ])

    check_table = Table(check_table_data, colWidths=[45*mm, 25*mm, 90*mm])
    check_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#2C3E50")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#F5F5F5")]),
    ]))
    elements.append(check_table)
    elements.append(Spacer(1, 8*mm))

    # ---------- Violations Section ----------
    if compliance_result["violations"]:
        elements.append(Paragraph("Violations", styles['Heading3']))
        elements.append(Spacer(1, 2*mm))

        violation_data = [["Field", "Severity", "Message"]]
        for v in compliance_result["violations"]:
            violation_data.append([
                v["field"].replace("_", " ").title(),
                v["severity"],
                v["message"]
            ])

        violation_table = Table(violation_data, colWidths=[45*mm, 25*mm, 90*mm])
        violation_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#B03A2E")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        elements.append(violation_table)
        elements.append(Spacer(1, 8*mm))
    else:
        elements.append(Paragraph("No violations detected.", styles['Normal']))
        elements.append(Spacer(1, 8*mm))

    # ---------- Footer Note ----------
    footer_style = ParagraphStyle(
        'FooterStyle', parent=styles['Normal'], fontSize=8, textColor=colors.grey
    )
    elements.append(Spacer(1, 10*mm))
    elements.append(Paragraph(
        "This is a preliminary automated compliance screening result. "
        "Detection of a declaration does not by itself guarantee complete legal compliance. "
        "Generated by PackSure.",
        footer_style
    ))

    doc.build(elements)
    return output_path