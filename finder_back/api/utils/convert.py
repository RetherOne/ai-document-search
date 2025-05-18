import os
from pathlib import Path

from django.conf import settings
from docx2pdf import convert


def docx_to_pdf(docx_path):
    print("conevert in!!!")
    output_folder = os.path.join(settings.MEDIA_ROOT, "public_files/pdfs")
    os.makedirs(output_folder, exist_ok=True)

    convert(docx_path, output_folder)

    pdf_filename = os.path.splitext(os.path.basename(docx_path))[0] + ".pdf"
    pdf_abs_path = os.path.join(output_folder, pdf_filename)

    if os.path.exists(pdf_abs_path):
        relative_path = os.path.relpath(pdf_abs_path, settings.MEDIA_ROOT)
        result = Path(relative_path).as_posix()
        return result
    else:
        raise FileNotFoundError("PDF файл не был создан.")
