import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def analyze_xray(file_path):
    try:
        with open(file_path, "rb") as image:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[
                    image,
                    """
Analyze this X-ray.

Return ONLY valid JSON.

{
  "severity":"Normal|Warning|Critical",
  "primary_finding":"",
  "clinical_findings":"",
  "recommendation":""
}
"""
                ]
            )

        return response.text

    except Exception as e:
        print("Gemini Error:", e)
        return json.dumps({
            "severity":"Warning",
            "primary_finding":"AI analysis unavailable",
            "clinical_findings":str(e),
            "recommendation":"Please try again later."
        })