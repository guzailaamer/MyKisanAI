"""
Market Advisory Tool
-------------------
This module provides functions to fetch and analyze market price trends for crops.
It integrates with external market APIs and uses Gemini Pro (Google Vertex AI) for summarization and advice.

Main function:
    get_market_trend(crop_name: str, location: str) -> dict
        # Returns market trend summary and selling advice for the given crop and location.
""" 

import requests
import time
import os
import pandas as pd
from pathlib import Path

def get_market_trend_from_csv(crop_name, location=None):
    """Get market trend from CSV file"""
    # df = load_csv_data()
    df = pd.read_csv("../GOV_MANDI_PRICES_CSV.csv")  # Adjust path as needed
    if df is None:
        return {"error": "No data source available"}
    
    # Filter by commodity
    crop_data = df[df['Commodity'].str.lower().str.contains(crop_name.lower(), na=False)]
    
    # Filter by location if provided
    if location:
        crop_data = crop_data[crop_data['State'].str.lower().str.contains(location.lower(), na=False)]

    if crop_data.empty:
        return {"message": f"No price data found for {crop_name} in {location or 'any location'}"}
    
    # Calculate average modal price
    prices = crop_data['Modal_x0020_Price'].dropna().astype(float)
    avg_price = int(prices.mean()) if not prices.empty else None
    
    # Get market names
    market_names = [
        f"{row['Market']} ({row['District']})"
        for _, row in crop_data.head(5).iterrows()
        if pd.notna(row['Market']) and pd.notna(row['District'])
    ]
    
    return {
        "average_modal_price": avg_price,
        "records_found": len(prices),
        "markets": market_names,
        "commodity": crop_name,
        "location": location,
        "data_source": "CSV file"
    }

def get_market_trend(crop_name, location=None, limit=10):
    # Try API first
    API_KEY = os.getenv("GOV_MANDI_PRICE_API_KEY")
    base_url = "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070"
    
    try:
        params = {
            "api-key": API_KEY,
            "format": "json",
            "limit": limit,
            "filters[commodity]": crop_name
        }
        
        if location:
            params["filters[state]"] = location
        
        response = requests.get(base_url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            records = data.get("records", [])
            
            if records:
                # API data available - process normally
                prices = [int(r["modal_price"]) for r in records if r.get("modal_price")]
                avg_price = sum(prices) // len(prices) if prices else None
                market_names = [
                    f"{r['market']} ({r['district']})"
                    for r in records[:5]
                    if r.get("market") and r.get("district")
                ]
                
                return {
                    "average_modal_price": avg_price,
                    "records_found": len(prices),
                    "markets": market_names,
                    "commodity": crop_name,
                    "location": location,
                    "data_source": "API"
                }
        
        # API failed or no data - fallback to CSV
        print("API failed or no data, falling back to CSV...")
        return get_market_trend_from_csv(crop_name, location)
        
    except Exception as e:
        print(f"API error: {e}, falling back to CSV...")
        return get_market_trend_from_csv(crop_name, location)