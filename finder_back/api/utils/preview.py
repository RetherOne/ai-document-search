import os

import pymupdf
from django.conf import settings


def generate_preview(document):
    pdf_path = document.pdf_file.path
    output_folder = os.path.join(settings.MEDIA_ROOT, "public_files/previews")
    os.makedirs(output_folder, exist_ok=True)

    doc = pymupdf.open(pdf_path)
    page = doc.load_page(0)
    pix = page.get_pixmap()

    filename = os.path.splitext(os.path.basename(document.pdf_file.name))[0]
    image_path = os.path.join(output_folder, f"{filename}.jpg")
    pix.save(image_path)
    doc.close()

    document.preview.name = f"public_files/previews/{filename}.jpg"
    document.save(update_fields=["preview"])
