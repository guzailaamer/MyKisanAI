import datetime
import base64
import os
from zoneinfo import ZoneInfo
from google.adk.agents import Agent

# Import your original tools
import sys
from pathlib import Path
backend_dir = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_dir))

from backend.tools.crop_diagnosis_tool import diagnose_crop as _diagnose_crop
from backend.tools.market_advisory_tool import get_market_trend as _get_market_trend
from backend.tools.scheme_navigator_tool import answer_scheme_query as _answer_scheme_query

def diagnose_crop_disease(query: str = "Analyze this crop image for diseases") -> dict:
    """Diagnoses crop diseases from an uploaded image.

    Args:
        query (str): Description of what you want to analyze about the crop image

    Returns:
        dict: Diagnosis result with status and findings
    """
    try:
        # Get API key from environment
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return {
                "status": "error",
                "error_message": "API key not configured"
            }
        
        # Note: ADK will handle image data automatically when image is uploaded
        # The actual image processing will happen in the agent's context
        return {
            "status": "ready",
            "message": "Please upload an image of your crop for analysis",
            "instructions": "I can analyze crop images to identify diseases, pests, and health issues. Upload a clear photo of the affected plant or leaves."
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Failed to prepare crop diagnosis: {str(e)}"
        }

def get_market_prices(crop_name: str, location: str = "") -> dict:
    """Gets current market prices and trends for a specific crop.

    Args:
        crop_name (str): Name of the crop (e.g., "tomato", "rice", "wheat")
        location (str): Optional location for localized pricing

    Returns:
        dict: Market data with prices and trends
    """
    try:
        result = _get_market_trend(crop_name, location if location else None)
        
        return {
            "status": "success",
            "crop": crop_name,
            "location": location or "general",
            "market_data": result
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Failed to get market data: {str(e)}"
        }

def get_government_schemes(question: str) -> dict:
    """Provides information about government schemes and subsidies for farmers.

    Args:
        question (str): Question about government schemes, subsidies, or benefits

    Returns:
        dict: Information about relevant schemes and how to apply
    """
    try:
        result = _answer_scheme_query(question)
        
        return {
            "status": "success",
            "question": question,
            "answer": result
        }
        
    except Exception as e:
        return {
            "status": "error",
            "error_message": f"Failed to get scheme information: {str(e)}"
        }

# Create the ADK agent - this should handle multimodal input
root_agent = Agent(
    name="farmer_assistant_agent",
    model="gemini-2.0-flash",
    description=(
        "AI assistant for Indian farmers that can analyze crop images, provide market information, and explain government schemes"
    ),
    instruction=(
        "You are FarmerAgent, an AI assistant for Indian farmers. You have access to these capabilities:\n\n"
        "🌱 **Crop Disease Diagnosis**: When a user uploads an image, analyze it for diseases, pests, or health issues\n"
        "📈 **Market Information**: Provide current crop prices and market trends\n"
        "🏛️ **Government Schemes**: Explain agricultural subsidies and benefits\n\n"
        "**Image Analysis Instructions:**\n"
        "- When you receive an image, automatically analyze it for crop health\n"
        "- Look for signs of disease, pest damage, nutrient deficiency\n"
        "- Provide specific recommendations and treatment advice\n"
        "- Use simple, farmer-friendly language\n"
        "- Be encouraging and practical\n\n"
        "**Response Style:**\n"
        "- Use clear, simple language\n"
        "- Provide actionable steps\n"
        "- Include local contact information when relevant\n"
        "- Be supportive and encouraging"
    ),
    tools=[diagnose_crop_disease, get_market_prices, get_government_schemes],
)