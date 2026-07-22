import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

print("KEY FOUND:", bool(os.getenv("GEMINI_API_KEY")))

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def analyze_xray(file_path):
    try:
        uploaded_file = client.files.upload(file=file_path)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                """
You are an AI assistant for medical image analysis.

Analyze the uploaded X-ray and return ONLY valid JSON.

{
  "severity": "Normal",
  "primary_finding": "",
  "clinical_findings": "",
  "recommendation": ""
}
""",
                uploaded_file,
            ],
        )

        print("Gemini Response:", response.text)

        return response.text

    except Exception as e:
        print("Gemini ERROR:", repr(e))
        raise