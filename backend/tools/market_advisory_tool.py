"""
Market Advisory Tool
-------------------
This module provides functions to fetch and analyze market price trends for crops.
It integrates with external market APIs and uses Gemini Pro (Google Vertex AI) for summarization and advice.

Main function:
    get_market_trend(crop_name: str, location: str) -> dict
        # Returns market trend summary and selling advice for the given crop and location.
""" 

def get_market_trend(crop_name, location):
    # Dummy trend logic
    return {
        "price_today": 2300,
        "trend": "Rising",
        "advice": f"Prices are trending up in {location}. Consider waiting 2–3 days before selling {crop_name}."
    }

