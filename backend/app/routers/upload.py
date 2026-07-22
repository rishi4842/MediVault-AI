import os
import json
import shutil

from fastapi import APIRouter, UploadFile, File

from app.services.gemini_service import analyze_xray

router = APIRouter()

UPLOAD_FOLDER = "uploads"
HISTORY_FILE = "history.json"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_xray(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    ai_result = analyze_xray(file_path)

    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            history = json.load(f)
    else:
        history = []

    history.append({
        "filename": file.filename,
        "image": file_path,
        "analysis": ai_result
    })

    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=4)

    return {
        "message": "Analysis completed successfully",
        "filename": file.filename,
        "analysis": ai_result
    }


@router.get("/history")
async def get_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)

    return []