from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.upload import router as upload_router

app = FastAPI(title="MediVault AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://medi-vault-ai-dun.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)

@app.get("/")
def home():
    return {"message": "Backend Running"}

@app.get("/health")
def health():
    return {
        "status": "Healthy",
        "version": "1.0",
        "project": "MediVault AI"
    }