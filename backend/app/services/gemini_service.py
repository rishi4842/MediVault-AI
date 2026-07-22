import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def analyze_xray(file_path):
    try:
        uploaded_file = client.files.upload(file=file_path)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                """
You are an AI assistant for medical image analysis.

Analyze the uploaded X-ray and return ONLY valid JSON, nothing else.

{
  "severity": "Normal|Warning|Critical",
  "primary_finding": "brief finding description",
  "clinical_findings": "observed clinical findings",
  "recommendation": "clinical recommendation"
}

SEVERITY GUIDELINES:
- "Normal": No acute abnormalities, no fractures, normal appearance, within normal limits
- "Warning": Mild to moderate findings, mild degenerative changes, requires monitoring
- "Critical": Fracture detected, dislocation, tumor, malignancy, severe findings

RULES:
- Return ONLY valid JSON, no markdown, no ```json wrapper
- Keep each field under 50 words
- Always set severity to one of: Normal, Warning, or Critical
- Do not provide a medical diagnosis
- If uncertain, recommend clinical evaluation
""",
                uploaded_file,
            ],
        )

        return response.text

    except Exception as e:
        return f"Error: {e}"