from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from fastapi import UploadFile, File, Form

# ─── Import tool stubs ──────────────────────────────────────────────────────────
from tools.crop_diagnosis_tool import diagnose_crop
from tools.market_advisory_tool import get_market_trend
from tools.scheme_navigator_tool import answer_scheme_query
from tools.tts_stt_tool import synthesize_speech, transcribe_audio


app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000"],  # Frontend origin
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

class STTResponse(BaseModel):
    transcript: str

# ─── Routes ─────────────────────────────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "Backend is running 🚀"}

# 1️⃣ Crop Disease Diagnosis  ----------------------------------------------------
@app.post("/diagnose_crop")
async def diagnose_crop_endpoint(image: UploadFile = File(...)):
    if image.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=415, detail="Unsupported file type")
    img_bytes = await image.read()
    diagnosis = diagnose_crop(img_bytes)
    return diagnosis

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
    audio_stub = synthesize_speech(req.text, req.language)
    return {"audio": audio_stub}

# 5️⃣ Speech‑to‑Text (stub) ------------------------------------------------------
@app.post("/stt", response_model=STTResponse)
async def stt_endpoint(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()
    transcript = transcribe_audio(audio_bytes)
    return {"transcript": transcript}
