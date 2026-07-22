import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

print("KEY FOUND:", bool(os.getenv("GEMINI_API_KEY")))

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))