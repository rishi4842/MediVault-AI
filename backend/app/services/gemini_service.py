import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def analyze_xray(file_path):
    try:
        uploaded_file = client.files.upload(file=file_path)

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                """
You are an AI medical assistant.

Analyze the uploaded medical document.

The uploaded file may be:
- X-ray
- Blood Test
- Sugar Report
- Blood Pressure Report
- Prescription
- ECG
- Lab Report
- Any healthcare document

Return ONLY valid JSON.

Format:

{
  "document_type":"",
  "condition":"",
  "severity":"",
  "findings":"",
  "medications":"",
  "recommendation":""
}

Rules:

- Detect the document type.
- If it is a prescription, list medicines.
- If it is a blood report, summarize abnormal values.
- If it is an X-ray, summarize radiology findings.
- If handwriting is unclear, mention that.
- Never invent diseases.
- Keep findings concise and patient-friendly.
""",
                uploaded_file,
            ],
        )

        print(response.text)
        return response.text

    except Exception as e:
        import traceback

        traceback.print_exc()
        print("Gemini Error:", e)

        return """
{
  "document_type":"Medical Document",
  "condition":"Unable to analyze",
  "severity":"Unknown",
  "findings":"Document analysis temporarily unavailable.",
  "medications":"None",
  "recommendation":"Please try again or contact support."
}
"""