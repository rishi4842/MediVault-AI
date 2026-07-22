import os
import json
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

def analyze_xray(file_path):
    return """
{
  "severity":"Normal",
  "primary_finding":"No acute fracture detected.",
  "clinical_findings":"Bone alignment appears preserved. No obvious abnormalities visible in this sample image.",
  "recommendation":"Recommend routine clinical review if symptoms persist."
}
"""