"""
Crop Diagnosis Tool
------------------
This module provides functions to analyze crop images using Gemini LLM.
It detects crop diseases and suggests remedies based on the image input.

Main function:
    diagnose_crop(image_bytes: bytes, query: str, api_key: str) -> dict
        # Accepts image bytes and a query, returns disease diagnosis and treatment suggestions.
"""
import base64
import requests
import json


def diagnose_crop(img_bytes, query, api_key):
    # Encode image bytes to base64
    image_b64 = base64.b64encode(img_bytes).decode('utf-8')

    # Prepare request payload
    payload = {
        "contents": [{
            "parts": [
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",  # Ensure correct MIME type
                        "data": image_b64
                    }
                },
                {
                    "text": query
                }
            ]
        }]
    }

    # API URL and headers
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    headers = {
        "x-goog-api-key": api_key,
        "Content-Type": "application/json"
    }

    # Sending POST request
    response = requests.post(url, headers=headers, data=json.dumps(payload))

    # Check if response is successful
    if response.status_code == 200:
        response_data = response.json()
        # Extract the relevant text from the Gemini API response
        try:
            # Navigate through the JSON structure to get the text
            diagnosis_text = response_data['candidates'][0]['content']['parts'][0]['text']
            return {"diagnosis": diagnosis_text} # Return as a dictionary for consistent frontend handling
        except (KeyError, IndexError) as e:
            raise Exception(f"Could not parse Gemini LLM response: {e}. Full response: {response_data}")
    else:
        raise Exception(f"Error: {response.status_code} - {response.text}")