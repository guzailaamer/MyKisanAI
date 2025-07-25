from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from io import BytesIO
from dotenv import load_dotenv
import os
import base64

# ─── Import tool stubs ──────────────────────────────────────────────────────────
from backend.tools.crop_diagnosis_tool import diagnose_crop
from backend.tools.market_advisory_tool import get_market_trend
from backend.tools.scheme_navigator_tool import answer_scheme_query
from backend.tools.tts_stt_tool import synthesize_speech, transcribe_audio

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variables
API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("API_KEY not found in environment variables")

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "https://mykisanai.web.app"],  # Vite frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic request / response schemas ───────────────────────────────────────
class MarketQuery(BaseModel):
    crop_name: str
    location: Optional[str] = None  # optional for now

class SubsidyQuery(BaseModel):
    question: str

class TTSRequest(BaseModel):
    text: str
    language: str = "en"
    translate: bool = False
    source_lang: str = "en"
    target_lang: str = None

class STTResponse(BaseModel):
    transcript: str

# ─── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "Backend is running 🚀"}

# 1️⃣ Crop Disease Diagnosis  ----------------------------------------------------
@app.post("/diagnose_crop")
async def diagnose_crop_endpoint(image: UploadFile = File(...), query: str = ""):
    # Ensure the uploaded file is an image (JPEG or PNG)
    if image.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=415, detail="Unsupported file type")

    # Read the image bytes
    img_bytes = await image.read()

    try:
        # Call the diagnose_crop function with image bytes and the query
        diagnosis = diagnose_crop(img_bytes, query, API_KEY)
        return diagnosis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# 2️⃣ Market Advisory  -----------------------------------------------------------
@app.post("/market_advice")
def market_advice_endpoint(query: MarketQuery):
    result = get_market_trend(query.crop_name, query.location)
    return result

# 3️⃣ Subsidy Navigator  ---------------------------------------------------------
@app.post("/subsidy_query")
def subsidy_query_endpoint(query: SubsidyQuery):
    answer = answer_scheme_query(query.question)
    return answer

# 4️⃣ Text‑to‑Speech (stub) ------------------------------------------------------
@app.post("/tts")
def tts_endpoint(req: TTSRequest):
    result = synthesize_speech(
        req.text,
        req.language,
        translate=req.translate,
        source_lang=req.source_lang,
        target_lang=req.target_lang
    )
    audio_base64 = base64.b64encode(result["audio"]).decode("utf-8")
    return {"audio": audio_base64, "translated_text": result["translated_text"]}

# 5️⃣ Speech‑to‑Text (stub) ------------------------------------------------------
@app.post("/stt", response_model=STTResponse)
async def stt_endpoint(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    transcript = transcribe_audio(audio_bytes)
    return {"transcript": transcript}
