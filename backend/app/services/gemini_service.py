import os
import mimetypes

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def analyze_xray(file_path):
    try:
        mime_type = mimetypes.guess_type(file_path)[0] or "image/jpeg"

        with open(file_path, "rb") as f:
            image_bytes = f.read()

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                """
You are an AI assistant for medical image analysis.

Analyze the uploaded X-ray.

Return ONLY valid JSON.

{
  "severity": "Normal",
  "primary_finding": "",
  "clinical_findings": "",
  "recommendation": ""
}
""",
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type,
                ),
            ],
        )

        return response.text

    except Exception as e:
        return f"Error: {e}"