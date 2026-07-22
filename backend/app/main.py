from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers.upload import router as upload_router

app = FastAPI(title="MediVault AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)

@app.get("/")
def home():
    return {"message": "MediVault AI Backend Running"}

@app.get("/health")
def health():
    return {"status": "healthy"}