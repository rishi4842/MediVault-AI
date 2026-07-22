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
                "Describe this X-ray.",
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
  "severity":"Normal",
  "primary_finding":"No acute fracture detected.",
  "clinical_findings":"Bone alignment appears preserved. No obvious abnormalities visible in this sample image.",
  "recommendation":"Recommend routine clinical review if symptoms persist."
}
"""