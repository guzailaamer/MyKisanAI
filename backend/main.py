from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
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

# ─── Import Firestore and Auth services ─────────────────────────────────────────
from backend.firestore_service import firestore_service
from backend.auth_middleware import get_current_user

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

# Custom middleware to handle OPTIONS requests
@app.middleware("http")
async def handle_options_requests(request, call_next):
    if request.method == "OPTIONS":
        from fastapi.responses import Response
        return Response(
            content="",
            status_code=200,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
            }
        )
    return await call_next(request)

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



@app.get("/conversations")
async def get_user_conversations(user_id: str = Depends(get_current_user), limit: int = 50):
    """Get user's conversation history"""
    conversations = firestore_service.get_user_conversations(user_id, limit)
    return {"conversations": conversations}

@app.get("/conversations/{tool_name}")
async def get_tool_conversations(tool_name: str, user_id: str = Depends(get_current_user), limit: int = 20):
    """Get user's conversations for a specific tool"""
    conversations = firestore_service.get_conversations_by_tool(user_id, tool_name, limit)
    return {"conversations": conversations}

# 1️⃣ Crop Disease Diagnosis  ----------------------------------------------------
@app.post("/diagnose_crop")
async def diagnose_crop_endpoint(
    image: UploadFile = File(...), 
    query: str = "", 
    user_id: str = Depends(get_current_user)
):
    # Ensure the uploaded file is an image (JPEG or PNG)
    if image.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=415, detail="Unsupported file type")

    # Read the image bytes
    img_bytes = await image.read()

    try:
        # Call the diagnose_crop function with image bytes and the query
        diagnosis = diagnose_crop(img_bytes, query, API_KEY)
        
        # Store conversation metadata
        metadata = {
            "query": query,
            "image_filename": image.filename,
            "image_size": len(img_bytes),
            "response": diagnosis,
            "tool_type": "crop_diagnosis"
        }
        
        firestore_service.store_conversation(user_id, "crop_diagnosis", metadata)
        
        return diagnosis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

# 2️⃣ Market Advisory  -----------------------------------------------------------
@app.post("/market_advice")
async def market_advice_endpoint(
    query: MarketQuery, 
    user_id: str = Depends(get_current_user)
):
    result = get_market_trend(query.crop_name, query.location)
    
    # Store conversation metadata
    metadata = {
        "crop_name": query.crop_name,
        "location": query.location,
        "response": result,
        "tool_type": "market_advisory"
    }
    
    firestore_service.store_conversation(user_id, "market_advisory", metadata)
    
    return result

# 3️⃣ Subsidy Navigator  ---------------------------------------------------------
@app.post("/subsidy_query")
async def subsidy_query_endpoint(
    query: SubsidyQuery, 
    user_id: str = Depends(get_current_user)
):
    answer = answer_scheme_query(query.question)
    
    # Store conversation metadata
    metadata = {
        "question": query.question,
        "response": answer,
        "tool_type": "subsidy_navigator"
    }
    
    firestore_service.store_conversation(user_id, "subsidy_navigator", metadata)
    
    return answer

# 4️⃣ Text‑to‑Speech (stub) ------------------------------------------------------
@app.post("/tts")
async def tts_endpoint(
    req: TTSRequest, 
    user_id: str = Depends(get_current_user)
):
    result = synthesize_speech(
        req.text,
        req.language,
        translate=req.translate,
        source_lang=req.source_lang,
        target_lang=req.target_lang
    )
    audio_base64 = base64.b64encode(result["audio"]).decode("utf-8")
    
    # Store conversation metadata
    metadata = {
        "text": req.text,
        "language": req.language,
        "translate": req.translate,
        "source_lang": req.source_lang,
        "target_lang": req.target_lang,
        "audio_length": len(result["audio"]),
        "translated_text": result.get("translated_text"),
        "tool_type": "text_to_speech"
    }
    
    firestore_service.store_conversation(user_id, "text_to_speech", metadata)
    
    return {"audio": audio_base64, "translated_text": result["translated_text"]}

# 5️⃣ Speech‑to‑Text (stub) ------------------------------------------------------
@app.post("/stt", response_model=STTResponse)
async def stt_endpoint(
    audio: UploadFile = File(...), 
    user_id: str = Depends(get_current_user)
):
    audio_bytes = await audio.read()
    transcript = transcribe_audio(audio_bytes)
    
    # Store conversation metadata
    metadata = {
        "audio_filename": audio.filename,
        "audio_size": len(audio_bytes),
        "transcript": transcript,
        "tool_type": "speech_to_text"
    }
    
    firestore_service.store_conversation(user_id, "speech_to_text", metadata)
    
    return {"transcript": transcript}
